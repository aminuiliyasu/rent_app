package com.rentify.service;

import com.rentify.dto.request.CreateBookingRequest;
import com.rentify.dto.response.BookingResponse;
import com.rentify.model.Booking;
import com.rentify.model.Listing;
import com.rentify.model.User;
import com.rentify.model.enums.BookingStatus;
import com.rentify.model.enums.Currency;
import com.rentify.repository.BookingRepository;
import com.rentify.repository.ListingRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.commission-rate:0.12}")
    private Double commissionRate;
    
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        Long userId = CurrentUser.getCurrentUserId();
        
        User renter = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        // Check if user is trying to book their own listing
        if (listing.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You cannot book your own listing");
        }
        
        // Check if listing is active
        if (listing.getStatus() != com.rentify.model.enums.ListingStatus.ACTIVE) {
            throw new RuntimeException("Listing is not available for booking");
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
            throw new RuntimeException("Listing is not available for the selected dates");
        }
        
        // Calculate pricing
        BigDecimal totalAmount = calculateTotalAmount(listing, request.getStartDate(), request.getEndDate());
        BigDecimal deposit = listing.getDeposit() != null ? listing.getDeposit() : BigDecimal.ZERO;
        BigDecimal platformFee = totalAmount.multiply(BigDecimal.valueOf(commissionRate))
                .setScale(2, RoundingMode.HALF_UP);
        
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
    
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        // Check if user is renter or owner
        if (!booking.getRenter().getId().equals(userId) && 
            !booking.getListing().getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to view this booking");
        }
        
        return mapToResponse(booking);
    }
    
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(Pageable pageable) {
        Long userId = CurrentUser.getCurrentUserId();
        return bookingRepository.findByRenterId(userId, pageable)
                .map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyListingBookings(Pageable pageable) {
        Long userId = CurrentUser.getCurrentUserId();
        return bookingRepository.findByListingOwnerId(userId, pageable)
                .map(this::mapToResponse);
    }
    
    @Transactional
    public BookingResponse confirmBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!booking.getListing().getOwner().getId().equals(userId)) {
            throw new RuntimeException("Only the listing owner can confirm bookings");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be confirmed");
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        
        return mapToResponse(booking);
    }
    
    @Transactional
    public BookingResponse cancelBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!booking.getRenter().getId().equals(userId) && 
            !booking.getListing().getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED || 
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel a booking that is already completed or cancelled");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(reason);
        booking = bookingRepository.save(booking);
        
        return mapToResponse(booking);
    }
    
    @Transactional
    public BookingResponse completeBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!booking.getListing().getOwner().getId().equals(userId)) {
            throw new RuntimeException("Only the listing owner can complete bookings");
        }
        
        if (booking.getStatus() != BookingStatus.CONFIRMED && 
            booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new RuntimeException("Only confirmed or in-progress bookings can be completed");
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        
        return mapToResponse(booking);
    }
    
    private BigDecimal calculateTotalAmount(Listing listing, LocalDateTime startDate, LocalDateTime endDate) {
        Duration duration = Duration.between(startDate, endDate);
        long days = duration.toDays();
        long hours = duration.toHours();
        
        if (listing.getType() == com.rentify.model.enums.ListingType.WORKER && listing.getPriceHour() != null) {
            return listing.getPriceHour().multiply(BigDecimal.valueOf(hours))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        if (days >= 30 && listing.getPriceMonth() != null) {
            long months = days / 30;
            return listing.getPriceMonth().multiply(BigDecimal.valueOf(months))
                    .setScale(2, RoundingMode.HALF_UP);
        } else if (days >= 7 && listing.getPriceWeek() != null) {
            long weeks = days / 7;
            return listing.getPriceWeek().multiply(BigDecimal.valueOf(weeks))
                    .setScale(2, RoundingMode.HALF_UP);
        } else if (listing.getPriceDay() != null) {
            return listing.getPriceDay().multiply(BigDecimal.valueOf(Math.max(1, days)))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        throw new RuntimeException("No pricing information available for this listing");
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
        response.setPaymentId(booking.getPaymentId());
        response.setConfirmedAt(booking.getConfirmedAt());
        response.setCompletedAt(booking.getCompletedAt());
        response.setCancelledAt(booking.getCancelledAt());
        response.setCancellationReason(booking.getCancellationReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        
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
