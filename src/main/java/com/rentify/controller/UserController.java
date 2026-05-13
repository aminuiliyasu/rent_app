package com.rentify.controller;

import com.rentify.dto.request.UpdateProfileRequest;
import com.rentify.dto.response.DashboardStatsResponse;
import com.rentify.dto.response.ReviewResponse;
import com.rentify.dto.response.UserResponse;
import com.rentify.dto.response.UserTrustResponse;
import com.rentify.service.ReviewService;
import com.rentify.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private ReviewService reviewService;
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        UserResponse profile = userService.getMyProfile();
        return ResponseEntity.ok(profile);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getProfile(@PathVariable Long id) {
        UserResponse profile = userService.getProfile(id);
        return ResponseEntity.ok(profile);
    }

    /** Published reviews about this user (visible on profile for renters and hosts). */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviewsAboutUser(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(reviewService.listPublishedReviewsAboutUser(id, pageable));
    }

    /** Reviews this user posted about others (after mutual publish on each booking). */
    @GetMapping("/{id}/reviews/given")
    public ResponseEntity<Page<ReviewResponse>> getReviewsGivenByUser(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(reviewService.listPublishedReviewsWrittenByUser(id, pageable));
    }

    /** Averages + latest received / given for trust UI. */
    @GetMapping("/{id}/trust")
    public ResponseEntity<UserTrustResponse> getUserTrust(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getTrustSnapshot(id));
    }
    
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserResponse profile = userService.updateProfile(request);
        return ResponseEntity.ok(profile);
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = userService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
