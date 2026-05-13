package com.rentify.repository;

import com.rentify.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    /** Fetch joins so mapping works with {@code spring.jpa.open-in-view=false}. */
    @Query("SELECT DISTINCT r FROM Review r "
            + "LEFT JOIN FETCH r.reviewer LEFT JOIN FETCH r.reviewee LEFT JOIN FETCH r.booking "
            + "WHERE r.booking.id = :bookingId")
    List<Review> findByBookingId(@Param("bookingId") Long bookingId);
    
    Optional<Review> findByBookingIdAndReviewerId(Long bookingId, Long reviewerId);
    
    Page<Review> findByRevieweeIdAndIsPublishedTrue(Long revieweeId, Pageable pageable);

    Page<Review> findByRevieweeIdAndIsPublishedTrueOrderByCreatedAtDesc(Long revieweeId, Pageable pageable);

    /** Published reviews this user wrote about others (visible after mutual reveal on each booking). */
    Page<Review> findByReviewerIdAndIsPublishedTrueOrderByCreatedAtDesc(Long reviewerId, Pageable pageable);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.isPublished = true")
    Double getAverageRating(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId AND r.isPublished = true")
    Long getReviewCount(@Param("userId") Long userId);
    
    List<Review> findByIsFlaggedTrue();

    /**
     * Renter-to-owner reviews for a listing (published), for public listing page.
     */
    @Query("SELECT r FROM Review r WHERE r.booking.listing.id = :listingId AND r.isPublished = true AND r.reviewee.id = :ownerId ORDER BY r.createdAt DESC")
    Page<Review> findPublishedRenterReviewsForListing(
            @Param("listingId") Long listingId,
            @Param("ownerId") Long ownerId,
            Pageable pageable);
}
