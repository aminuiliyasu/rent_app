package com.rentify.controller;

import com.rentify.dto.request.CreateListingRequest;
import com.rentify.dto.response.ListingResponse;
import com.rentify.dto.response.ReviewResponse;
import com.rentify.model.enums.ListingType;
import com.rentify.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/listings")
@CrossOrigin(origins = "*")
public class ListingController {
    
    @Autowired
    private ListingService listingService;
    
    @GetMapping
    public ResponseEntity<Page<ListingResponse>> searchListings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) ListingType type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
            Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ListingResponse> listings = listingService.searchListings(
            search, location, categoryId, categorySlug, type, minPrice, maxPrice, lat, lng, radius, pageable
        );
        
        return ResponseEntity.ok(listings);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListing(@PathVariable Long id) {
        ListingResponse listing = listingService.getListingById(id);
        return ResponseEntity.ok(listing);
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getListingReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = listingService.getPublishedReviewsForListing(id, pageable);
        return ResponseEntity.ok(reviews);
    }
    
    @PostMapping
    public ResponseEntity<ListingResponse> createListing(@Valid @RequestBody CreateListingRequest request) {
        ListingResponse listing = listingService.createListing(request);
        return ResponseEntity.status(201).body(listing);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody CreateListingRequest request) {
        ListingResponse listing = listingService.updateListing(id, request);
        return ResponseEntity.ok(listing);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        listingService.deleteListing(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/my")
    public ResponseEntity<Page<ListingResponse>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
            Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ListingResponse> listings = listingService.getMyListings(pageable);
        return ResponseEntity.ok(listings);
    }
    
    @PostMapping("/{id}/activate")
    public ResponseEntity<ListingResponse> activateListing(@PathVariable Long id) {
        ListingResponse listing = listingService.activateListing(id);
        return ResponseEntity.ok(listing);
    }
    
    @PostMapping("/{id}/pause")
    public ResponseEntity<ListingResponse> pauseListing(@PathVariable Long id) {
        ListingResponse listing = listingService.pauseListing(id);
        return ResponseEntity.ok(listing);
    }
}
