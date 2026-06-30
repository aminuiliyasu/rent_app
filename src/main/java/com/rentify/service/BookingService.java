package com.rentify.service;

import com.rentify.dto.request.CreateBookingRequest;
import com.rentify.dto.response.BookingResponse;
import com.rentify.dto.response.ListingResponse;
import com.rentify.model.Booking;
import com.rentify.model.Listing;
import com.rentify.model.ListingImage;
import com.rentify.model.RentWishPost;
import com.rentify.model.User;
import com.rentify.model.enums.BookingStatus;
import com.rentify.model.enums.Currency;
import com.rentify.model.enums.MessageKind;
import com.rentify.dto.response.BookingReviewSummaryResponse;
import com.rentify.repository.BookingRepository;
import com.rentify.repository.ListingRepository;
import com.rentify.repository.MessageRepository;
import com.rentify.repository.RentWishPostRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;

import static com.rentify.exception.BusinessException.badRequest;
import static com.rentify.exception.BusinessException.conflict;
import static com.rentify.exception.BusinessException.forbidden;
import static com.rentify.exception.BusinessException.notFound;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private RentWishPostRepository rentWishPostRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageService messageService;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        Long userId = CurrentUser.getCurrentUserId();
        
        User renter = userRepository.findById(userId)
                .orElseThrow(() -> notFound("User not found"));
        
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> notFound("Listing not found"));
        
        // Check if user is trying to book their own listing
        if (listing.getOwner().getId().equals(userId)) {
            throw badRequest("You cannot book your own listing");
        }
        
        // Check if listing is active
        if (listing.getStatus() != com.rentify.model.enums.ListingStatus.ACTIVE) {
            throw badRequest("Listing is not available for booking");
        }

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw badRequest("End time must be after start time");
        }
        
        // Check for conflicting bookings
        List<BookingStatus> activeStatuses = Arrays.asList(
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS
        );
        
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
            listing.getId(),
            request.getStartDate(),
            request.getEndDate(),
            activeStatuses
        );
        
        if (!conflictingBookings.isEmpty()) {
            throw badRequest("Listing is not available for the selected dates");
        }
        
        // Calculate pricing
        BigDecimal totalAmount = calculateTotalAmount(listing, request.getStartDate(), request.getEndDate());
        BigDecimal deposit = listing.getDeposit() != null ? listing.getDeposit() : BigDecimal.ZERO;
        BigDecimal platformFee = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        
        // Create booking
        Booking booking = new Booking();
        booking.setListing(listing);
        booking.setRenter(renter);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(totalAmount);
        booking.setDeposit(deposit);
        booking.setPlatformFee(platformFee);
        booking.setCurrency(Currency.USD);
        
        booking = bookingRepository.save(booking);
        
        return mapToResponse(booking);
    }

    /**
     * Host opens a messages thread for a live rent request using one of their listings.
     * Seeds the thread with a fixed "request posted" line ({@link MessageKind#LIVE_REQUEST_REPLY}).
     */
    @Transactional
    public BookingResponse startConversationFromRentWish(Long postId, Long listingId) {
        Long hostId = CurrentUser.getCurrentUserId();

        RentWishPost post = rentWishPostRepository.findById(postId)
                .orElseThrow(() -> notFound("Rent request not found"));

        if (post.getAuthor().getId().equals(hostId)) {
            throw badRequest("You cannot reply to your own rent request");
        }

        LocalDateTime now = LocalDateTime.now();
        if (!RentWishPostService.isStillVisible(post, now)) {
            throw badRequest("This rent request has expired");
        }

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> notFound("Listing not found"));

        if (!listing.getOwner().getId().equals(hostId)) {
            throw forbidden("You can only reply using your own listings");
        }

        if (listing.getStatus() != com.rentify.model.enums.ListingStatus.ACTIVE) {
            throw badRequest("Listing is not active");
        }

        User renter = post.getAuthor();

        Optional<Booking> existing = bookingRepository.findByRentWishPost_IdAndListing_IdAndRenter_Id(
                post.getId(), listing.getId(), renter.getId());
        if (existing.isPresent()) {
            Booking b = existing.get();
            if (!messageRepository.existsByBooking_IdAndMessageKind(b.getId(), MessageKind.LIVE_REQUEST_REPLY)) {
                messageService.createLiveRequestOpeningMessage(b);
            }
            return mapToResponse(b);
        }

        LocalDateTime startDate = now.plusHours(1);
        LocalDateTime endDate = startDate.plusDays(1);

        List<BookingStatus> activeStatuses = Arrays.asList(
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                BookingStatus.IN_PROGRESS
        );

        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                listing.getId(),
                startDate,
                endDate,
                activeStatuses
        );

        if (!conflictingBookings.isEmpty()) {
            throw badRequest("This listing already has a booking in that window. Try another listing or try again later.");
        }

        BigDecimal totalAmount;
        try {
            totalAmount = calculateTotalAmount(listing, startDate, endDate);
        } catch (RuntimeException ex) {
            totalAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal deposit = listing.getDeposit() != null ? listing.getDeposit() : BigDecimal.ZERO;

        Booking booking = new Booking();
        booking.setListing(listing);
        booking.setRenter(renter);
        booking.setRentWishPost(post);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(totalAmount);
        booking.setDeposit(deposit);
        booking.setPlatformFee(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        booking.setCurrency(Currency.USD);

        booking = bookingRepository.save(booking);
        messageService.createLiveRequestOpeningMessage(booking);

        return mapToResponse(booking);
    }
    
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findWithParticipantsById(id)
                .orElseThrow(() -> notFound("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        // Check if user is renter or owner
        if (!booking.getRenter().getId().equals(userId) && 
            !booking.getListing().getOwner().getId().equals(userId)) {
            throw forbidden("You don't have permission to view this booking");
        }

        BookingResponse response = mapToResponse(booking);
        BookingReviewSummaryResponse summary = reviewService.buildSummary(booking, userId);
        response.setReviewSummary(summary);
        return response;
    }
    
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(Pageable pageable) {
        Long userId = CurrentUser.getCurrentUserId();
        return bookingRepository.findByRenterId(userId, pageable)
                .map(booking -> {
                    BookingResponse response = mapToResponse(booking);
                    response.setReviewSummary(reviewService.buildSummary(booking, userId));
                    return response;
                });
    }
    
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyListingBookings(Pageable pageable) {
        Long userId = CurrentUser.getCurrentUserId();
        return bookingRepository.findByListingOwnerId(userId, pageable)
                .map(booking -> {
                    BookingResponse response = mapToResponse(booking);
                    response.setReviewSummary(reviewService.buildSummary(booking, userId));
                    return response;
                });
    }
    
    @Transactional
    public BookingResponse confirmBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> notFound("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!booking.getListing().getOwner().getId().equals(userId)) {
            throw forbidden("Only the listing owner can confirm bookings");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw badRequest("Only pending bookings can be confirmed");
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        
        return mapToResponse(booking);
    }
    
    @Transactional
    public BookingResponse cancelBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> notFound("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!booking.getRenter().getId().equals(userId) && 
            !booking.getListing().getOwner().getId().equals(userId)) {
            throw forbidden("You don't have permission to cancel this booking");
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED || 
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw conflict("Cannot cancel a booking that is already completed or cancelled");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(reason);
        booking = bookingRepository.save(booking);
        
        return mapToResponse(booking);
    }
    
    @Transactional
    public BookingResponse startBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> notFound("Booking not found"));

        Long userId = CurrentUser.getCurrentUserId();
        if (!booking.getListing().getOwner().getId().equals(userId)) {
            throw forbidden("Only the listing owner can start the rental period");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw badRequest("Only confirmed bookings can be marked as in progress");
        }

        booking.setStatus(BookingStatus.IN_PROGRESS);
        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse completeBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> notFound("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!booking.getListing().getOwner().getId().equals(userId)) {
            throw forbidden("Only the listing owner can complete bookings");
        }
        
        if (booking.getStatus() != BookingStatus.CONFIRMED && 
            booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw badRequest("Only confirmed or in-progress bookings can be completed");
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        
        return mapToResponse(booking);
    }
    
    private BigDecimal calculateTotalAmount(Listing listing, LocalDateTime startDate, LocalDateTime endDate) {
        Duration duration = Duration.between(startDate, endDate);
        if (duration.isZero() || duration.isNegative()) {
            throw badRequest("Booking length must be positive");
        }

        long billableDays = Math.max(1L, (long) Math.ceil(duration.toMinutes() / (24.0 * 60.0)));
        long billableHours = Math.max(1L, (long) Math.ceil(duration.toMinutes() / 60.0));

        if (listing.getType() == com.rentify.model.enums.ListingType.WORKER && listing.getPriceHour() != null) {
            return listing.getPriceHour().multiply(BigDecimal.valueOf(billableHours))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        if (billableDays >= 30 && listing.getPriceMonth() != null) {
            long months = billableDays / 30;
            return listing.getPriceMonth().multiply(BigDecimal.valueOf(Math.max(1, months)))
                    .setScale(2, RoundingMode.HALF_UP);
        } else if (billableDays >= 7 && listing.getPriceWeek() != null) {
            long weeks = billableDays / 7;
            return listing.getPriceWeek().multiply(BigDecimal.valueOf(Math.max(1, weeks)))
                    .setScale(2, RoundingMode.HALF_UP);
        } else if (listing.getPriceDay() != null) {
            return listing.getPriceDay().multiply(BigDecimal.valueOf(billableDays))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        throw badRequest("No pricing information available for this listing");
    }
    
    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setListingId(booking.getListing().getId());
        response.setRenterId(booking.getRenter().getId());
        response.setOwnerId(booking.getListing().getOwner().getId());
        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setStatus(booking.getStatus());
        response.setTotalAmount(booking.getTotalAmount());
        response.setDeposit(booking.getDeposit());
        response.setPlatformFee(booking.getPlatformFee());
        response.setCurrency(booking.getCurrency());
        response.setPaymentId(null);
        response.setConfirmedAt(booking.getConfirmedAt());
        response.setCompletedAt(booking.getCompletedAt());
        response.setCancelledAt(booking.getCancelledAt());
        response.setCancellationReason(booking.getCancellationReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        if (booking.getRentWishPost() != null) {
            response.setRentWishPostId(booking.getRentWishPost().getId());
        }

        // Minimal listing payload so booking/message lists always show who/what was booked.
        Listing listing = booking.getListing();
        if (listing != null) {
            ListingResponse listingResponse = new ListingResponse();
            listingResponse.setId(listing.getId());
            listingResponse.setType(listing.getType());
            listingResponse.setTitle(listing.getTitle());
            listingResponse.setCategoryId(listing.getCategory() != null ? listing.getCategory().getId() : null);
            listingResponse.setCategoryName(listing.getCategory() != null ? listing.getCategory().getName() : null);
            listingResponse.setPricingCurrency(
                    listing.getPricingCurrency() != null && !listing.getPricingCurrency().isBlank()
                            ? listing.getPricingCurrency()
                            : "USD");
            listingResponse.setStatus(listing.getStatus());
            listingResponse.setOwnerId(listing.getOwner() != null ? listing.getOwner().getId() : null);
            listingResponse.setOwnerName(listing.getOwner() != null ? listing.getOwner().getName() : null);

            List<String> imageUrls = listing.getImages().stream()
                    .sorted(Comparator.comparing(ListingImage::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                    .map(ListingImage::getUrl)
                    .collect(Collectors.toList());
            listingResponse.setImageUrls(imageUrls);
            listingResponse.setPrimaryImageUrl(
                    listing.getImages().stream()
                            .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                            .findFirst()
                            .map(ListingImage::getUrl)
                            .orElse(imageUrls.isEmpty() ? null : imageUrls.get(0)));

            response.setListing(listingResponse);
        }
        
        // Map renter
        com.rentify.dto.response.UserResponse renter = new com.rentify.dto.response.UserResponse(
            booking.getRenter().getId(),
            booking.getRenter().getName(),
            booking.getRenter().getEmail(),
            booking.getRenter().getPhone(),
            booking.getRenter().getRole(),
            booking.getRenter().getKycStatus(),
            booking.getRenter().getAvatarUrl(),
            booking.getRenter().getEmailVerified(),
            booking.getRenter().getPhoneVerified()
        );
        response.setRenter(renter);
        
        // Map owner
        com.rentify.dto.response.UserResponse owner = new com.rentify.dto.response.UserResponse(
            booking.getListing().getOwner().getId(),
            booking.getListing().getOwner().getName(),
            booking.getListing().getOwner().getEmail(),
            booking.getListing().getOwner().getPhone(),
            booking.getListing().getOwner().getRole(),
            booking.getListing().getOwner().getKycStatus(),
            booking.getListing().getOwner().getAvatarUrl(),
            booking.getListing().getOwner().getEmailVerified(),
            booking.getListing().getOwner().getPhoneVerified()
        );
        response.setOwner(owner);
        
        return response;
    }
}
