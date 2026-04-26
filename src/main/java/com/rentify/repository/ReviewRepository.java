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
    
    List<Review> findByBookingId(Long bookingId);
    
    Optional<Review> findByBookingIdAndReviewerId(Long bookingId, Long reviewerId);
    
    Page<Review> findByRevieweeIdAndIsPublishedTrue(Long revieweeId, Pageable pageable);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.isPublished = true")
    Double getAverageRating(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId AND r.isPublished = true")
    Long getReviewCount(@Param("userId") Long userId);
    
    List<Review> findByIsFlaggedTrue();
}
