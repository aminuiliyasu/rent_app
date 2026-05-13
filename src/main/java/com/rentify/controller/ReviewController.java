package com.rentify.controller;

import com.rentify.dto.request.CreateReviewRequest;
import com.rentify.dto.response.ReviewResponse;
import com.rentify.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/bookings/{bookingId}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long bookingId,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.createReview(bookingId, request);
        return ResponseEntity.status(201).body(review);
    }
}
