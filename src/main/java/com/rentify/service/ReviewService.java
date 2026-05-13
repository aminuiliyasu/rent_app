package com.rentify.service;

import com.rentify.dto.request.CreateReviewRequest;
import com.rentify.dto.response.BookingReviewSummaryResponse;
import com.rentify.dto.response.ReviewResponse;
import com.rentify.dto.response.UserTrustResponse;
import com.rentify.dto.response.UserResponse;
import com.rentify.model.Booking;
import com.rentify.model.Listing;
import com.rentify.model.Review;
import com.rentify.model.User;
import com.rentify.model.enums.BookingStatus;
import com.rentify.repository.BookingRepository;
import com.rentify.repository.ListingRepository;
import com.rentify.repository.ReviewRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;

import static com.rentify.exception.BusinessException.badRequest;
import static com.rentify.exception.BusinessException.conflict;
import static com.rentify.exception.BusinessException.forbidden;
import static com.rentify.exception.BusinessException.notFound;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Transactional
    public ReviewResponse createReview(Long bookingId, CreateReviewRequest request) {
        Long uid = CurrentUser.getCurrentUserId();
        Booking booking = bookingRepository.findWithParticipantsById(bookingId)
                .orElseThrow(() -> notFound("Booking not found"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw badRequest("Reviews are available after the rental is marked complete");
        }

        Long renterId = booking.getRenter().getId();
        Long ownerId = booking.getListing().getOwner().getId();

        if (!uid.equals(renterId) && !uid.equals(ownerId)) {
            throw forbidden("You cannot review this booking");
        }

        if (reviewRepository.findByBookingIdAndReviewerId(bookingId, uid).isPresent()) {
            throw conflict("You have already submitted a review for this booking");
        }

        User reviewer = userRepository.findById(uid)
                .orElseThrow(() -> notFound("User not found"));

        User reviewee;
        if (uid.equals(renterId)) {
            reviewee = booking.getListing().getOwner();
        } else {
            reviewee = booking.getRenter();
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsPublished(false);
        review.setIsFlagged(false);

        review = reviewRepository.save(review);
        publishPairIfReady(bookingId);

        Review refreshed = reviewRepository.findById(review.getId()).orElse(review);
        return mapReview(refreshed);
    }

    /**
     * When both renter and owner have submitted, publish both together (fair mutual reveal).
     */
    private void publishPairIfReady(Long bookingId) {
        List<Review> reviews = reviewRepository.findByBookingId(bookingId);
        if (reviews.size() >= 2) {
            for (Review r : reviews) {
                r.setIsPublished(true);
            }
            reviewRepository.saveAll(reviews);
        }
    }

    /**
     * Explicit endpoint body — same rules as {@link com.rentify.service.BookingService#getBookingById(Long)} summary.
     */
    @Transactional(readOnly = true)
    public BookingReviewSummaryResponse getReviewSummaryForBooking(Long bookingId) {
        Booking booking = bookingRepository.findWithParticipantsById(bookingId)
                .orElseThrow(() -> notFound("Booking not found"));
        Long userId = CurrentUser.getCurrentUserId();
        Long renterId = booking.getRenter().getId();
        Long ownerId = booking.getListing().getOwner().getId();
        if (!userId.equals(renterId) && !userId.equals(ownerId)) {
            throw forbidden("You don't have permission to view this booking");
        }
        return buildSummary(booking, userId);
    }

    @Transactional(readOnly = true)
    public BookingReviewSummaryResponse buildSummary(Booking booking, Long viewerId) {
        Long renterId = booking.getRenter().getId();
        Long ownerId = booking.getListing().getOwner().getId();

        if (!viewerId.equals(renterId) && !viewerId.equals(ownerId)) {
            return new BookingReviewSummaryResponse(false, false, false, null, null);
        }

        List<Review> all = reviewRepository.findByBookingId(booking.getId());
        Review renterReview = all.stream()
                .filter(r -> r.getReviewer().getId().equals(renterId))
                .findFirst()
                .orElse(null);
        Review ownerReview = all.stream()
                .filter(r -> r.getReviewer().getId().equals(ownerId))
                .findFirst()
                .orElse(null);

        boolean bothPublished = renterReview != null && ownerReview != null
                && Boolean.TRUE.equals(renterReview.getIsPublished())
                && Boolean.TRUE.equals(ownerReview.getIsPublished());

        Review mine = viewerId.equals(renterId) ? renterReview : ownerReview;
        Review theirs = viewerId.equals(renterId) ? ownerReview : renterReview;

        boolean canSubmit = booking.getStatus() == BookingStatus.COMPLETED && mine == null;
        boolean awaiting = mine != null && !bothPublished;
        ReviewResponse myDto = mine != null ? mapReview(mine) : null;
        ReviewResponse partnerDto = bothPublished && theirs != null ? mapReview(theirs) : null;

        return new BookingReviewSummaryResponse(canSubmit, awaiting, bothPublished, myDto, partnerDto);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPublishedReviewsForListing(Long listingId, Pageable pageable) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> notFound("Listing not found"));
        Long ownerId = listing.getOwner().getId();
        return reviewRepository
                .findPublishedRenterReviewsForListing(listingId, ownerId, pageable)
                .map(this::mapReview);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> listPublishedReviewsAboutUser(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw notFound("User not found");
        }
        return reviewRepository
                .findByRevieweeIdAndIsPublishedTrueOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapReview);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> listPublishedReviewsWrittenByUser(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw notFound("User not found");
        }
        return reviewRepository
                .findByReviewerIdAndIsPublishedTrueOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapReview);
    }

    /**
     * Snapshot for profile trust UI: averages plus latest completed mutual reviews in each direction.
     */
    @Transactional(readOnly = true)
    public UserTrustResponse getTrustSnapshot(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw notFound("User not found");
        }
        Double avg = reviewRepository.getAverageRating(userId);
        Long receivedCount = reviewRepository.getReviewCount(userId);

        Page<Review> receivedPage = reviewRepository.findByRevieweeIdAndIsPublishedTrueOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 1));
        ReviewResponse latestReceived = receivedPage.isEmpty() ? null : mapReview(receivedPage.getContent().get(0));

        Page<Review> givenPage = reviewRepository.findByReviewerIdAndIsPublishedTrueOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 1));
        ReviewResponse latestGiven = givenPage.isEmpty() ? null : mapReview(givenPage.getContent().get(0));

        return new UserTrustResponse(
                avg != null ? roundAvg(avg) : null,
                receivedCount != null ? receivedCount : 0L,
                latestReceived,
                latestGiven);
    }

    private static double roundAvg(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private ReviewResponse mapReview(Review r) {
        User reviewer = r.getReviewer();
        User reviewee = r.getReviewee();
        UserResponse reviewerDto = new UserResponse(
                reviewer.getId(),
                reviewer.getName(),
                reviewer.getEmail(),
                reviewer.getPhone(),
                reviewer.getRole(),
                reviewer.getKycStatus(),
                reviewer.getAvatarUrl(),
                reviewer.getEmailVerified(),
                reviewer.getPhoneVerified()
        );
        UserResponse revieweeDto = new UserResponse(
                reviewee.getId(),
                reviewee.getName(),
                reviewee.getEmail(),
                reviewee.getPhone(),
                reviewee.getRole(),
                reviewee.getKycStatus(),
                reviewee.getAvatarUrl(),
                reviewee.getEmailVerified(),
                reviewee.getPhoneVerified()
        );
        return new ReviewResponse(
                r.getId(),
                r.getBooking().getId(),
                reviewerDto,
                revieweeDto,
                r.getRating(),
                r.getComment(),
                r.getIsPublished(),
                r.getCreatedAt()
        );
    }
}
