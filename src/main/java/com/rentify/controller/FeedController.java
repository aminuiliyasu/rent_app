package com.rentify.controller;

import com.rentify.dto.request.CreateRentWishPostRequest;
import com.rentify.dto.request.StartLiveRentWishConversationRequest;
import com.rentify.dto.response.BookingResponse;
import com.rentify.dto.response.RentWishPostResponse;
import com.rentify.service.RentWishPostService;
import com.rentify.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/rent-requests/posts", "/api/v1/feed/posts"})
@CrossOrigin(origins = "*")
public class FeedController {

    @Autowired
    private RentWishPostService rentWishPostService;

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<Page<RentWishPostResponse>> listPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(rentWishPostService.listVisible(pageable));
    }

    @PostMapping
    public ResponseEntity<RentWishPostResponse> createPost(@Valid @RequestBody CreateRentWishPostRequest request) {
        RentWishPostResponse created = rentWishPostService.create(request);
        return ResponseEntity.status(201).body(created);
    }

    /**
     * Host opens (or reopens) a booking + messages thread for a live rent request.
     * Body: {@link StartLiveRentWishConversationRequest#listingId} — one of the host's active listings.
     */
    @PostMapping("/{postId}/conversation")
    public ResponseEntity<BookingResponse> startRentWishConversation(
            @PathVariable Long postId,
            @Valid @RequestBody StartLiveRentWishConversationRequest request) {
        BookingResponse booking = bookingService.startConversationFromRentWish(postId, request.getListingId());
        return ResponseEntity.ok(booking);
    }
}
