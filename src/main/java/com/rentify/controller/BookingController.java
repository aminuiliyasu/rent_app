package com.rentify.controller;

import com.rentify.dto.request.CreateBookingRequest;
import com.rentify.dto.response.BookingResponse;
import com.rentify.dto.response.BookingReviewSummaryResponse;
import com.rentify.service.BookingService;
import com.rentify.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        return ResponseEntity.status(201).body(booking);
    }
    
    @GetMapping("/{id}/review-summary")
    public ResponseEntity<BookingReviewSummaryResponse> getBookingReviewSummary(@PathVariable Long id) {
        BookingReviewSummaryResponse summary = reviewService.getReviewSummaryForBooking(id);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }
    
    @GetMapping("/my")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookingResponse> bookings = bookingService.getMyBookings(pageable);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/my-listings")
    public ResponseEntity<Page<BookingResponse>> getMyListingBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookingResponse> bookings = bookingService.getMyListingBookings(pageable);
        return ResponseEntity.ok(bookings);
    }
    
    @PostMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(@PathVariable Long id) {
        BookingResponse booking = bookingService.confirmBooking(id);
        return ResponseEntity.ok(booking);
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        BookingResponse booking = bookingService.cancelBooking(id, reason);
        return ResponseEntity.ok(booking);
    }
    
    @PostMapping("/{id}/start")
    public ResponseEntity<BookingResponse> startBooking(@PathVariable Long id) {
        BookingResponse booking = bookingService.startBooking(id);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<BookingResponse> completeBooking(@PathVariable Long id) {
        BookingResponse booking = bookingService.completeBooking(id);
        return ResponseEntity.ok(booking);
    }
}
