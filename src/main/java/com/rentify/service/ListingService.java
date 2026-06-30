package com.rentify.service;

import com.rentify.dto.request.CreateListingRequest;
import com.rentify.dto.response.ListingResponse;
import com.rentify.dto.response.ReviewResponse;
import com.rentify.model.Category;
import com.rentify.model.Listing;
import com.rentify.model.ListingImage;
import com.rentify.model.enums.BookingStatus;
import com.rentify.model.enums.ListingStatus;
import com.rentify.model.enums.ListingType;
import com.rentify.model.User;
import com.rentify.repository.BookingRepository;
import com.rentify.repository.CategoryRepository;
import com.rentify.repository.ListingImageRepository;
import com.rentify.repository.ListingRepository;
import com.rentify.repository.ReviewRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ListingService {
    
    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ListingImageRepository listingImageRepository;

    @Autowired
    private ReviewService reviewService;

    @Transactional(readOnly = true)
    public Page<ListingResponse> searchListings(String search, String location, Long categoryId, String categorySlug,
                                                ListingType type,
                                                BigDecimal minPrice, BigDecimal maxPrice,
                                                Double lat, Double lng, Double radius,
                                                Pageable pageable) {
        ListingStatus status = ListingStatus.ACTIVE;
        
        if (lat != null && lng != null && radius != null) {
            return listingRepository.findNearbyListings(lat, lng, radius, status.name(), pageable)
                    .map(this::mapToResponse);
        }
        
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String locationParam = (location != null && !location.trim().isEmpty()) ? location.trim() : null;

        Long resolvedCategoryId = categoryId;
        if (resolvedCategoryId == null && categorySlug != null && !categorySlug.isBlank()) {
            Optional<Category> bySlug = categoryRepository.findBySlug(categorySlug.trim());
            if (bySlug.isEmpty()) {
                return Page.empty(pageable);
            }
            resolvedCategoryId = bySlug.get().getId();
        }
        
        return listingRepository.searchListings(
                searchParam,
                locationParam,
                resolvedCategoryId,
                type,
                minPrice,
                maxPrice,
                status,
                pageable
        ).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public ListingResponse getListingById(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        return mapToResponse(listing);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPublishedReviewsForListing(Long listingId, Pageable pageable) {
        return reviewService.getPublishedReviewsForListing(listingId, pageable);
    }
    
    @Transactional
    public ListingResponse createListing(CreateListingRequest request) {
        Long userId = CurrentUser.getCurrentUserId();
        
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Listing listing = new Listing();
        listing.setOwner(owner);
        listing.setType(request.getType());
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(category);
        listing.setPriceDay(request.getPriceDay());
        listing.setPriceWeek(request.getPriceWeek());
        listing.setPriceMonth(request.getPriceMonth());
        listing.setPriceHour(request.getPriceHour());
        listing.setDeposit(request.getDeposit());
        listing.setPricingCurrency(normalizePricingCurrency(request.getPricingCurrency()));
        listing.setLat(request.getLat());
        listing.setLng(request.getLng());
        listing.setAddress(request.getAddress());
        listing.setCity(request.getCity());
        listing.setState(request.getState());
        listing.setCountry(request.getCountry());
        listing.setDeliveryOption(request.getDeliveryOption());
        listing.setDeliveryRadius(request.getDeliveryRadius());
        listing.setWorkerName(request.getWorkerName());
        listing.setWorkerBio(request.getWorkerBio());
        listing.setWorkerProfession(request.getWorkerProfession());
        listing.setServiceArea(request.getServiceArea());
        listing.setAvailableDays(request.getAvailableDays());
        listing.setStatus(ListingStatus.ACTIVE); // Auto-activate listings so they're visible
        
        listing = listingRepository.save(listing);
        
        // Save images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            int sortOrder = 0;
            for (String imageUrl : request.getImageUrls()) {
                if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                    ListingImage image = new ListingImage();
                    image.setListing(listing);
                    image.setUrl(imageUrl);
                    image.setIsPrimary(sortOrder == 0);
                    image.setSortOrder(sortOrder++);
                    listingImageRepository.save(image);
                }
            }
            // Refresh listing to load images
            listing = listingRepository.findById(listing.getId()).orElse(listing);
        }
        
        return mapToResponse(listing);
    }
    
    @Transactional
    public ListingResponse updateListing(Long id, CreateListingRequest request) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!listing.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this listing");
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            listing.setCategory(category);
        }
        
        if (request.getTitle() != null) listing.setTitle(request.getTitle());
        if (request.getDescription() != null) listing.setDescription(request.getDescription());
        if (request.getPriceDay() != null) listing.setPriceDay(request.getPriceDay());
        if (request.getPriceWeek() != null) listing.setPriceWeek(request.getPriceWeek());
        if (request.getPriceMonth() != null) listing.setPriceMonth(request.getPriceMonth());
        if (request.getPriceHour() != null) listing.setPriceHour(request.getPriceHour());
        if (request.getDeposit() != null) listing.setDeposit(request.getDeposit());
        if (request.getPricingCurrency() != null) {
            listing.setPricingCurrency(normalizePricingCurrency(request.getPricingCurrency()));
        }
        if (request.getLat() != null) listing.setLat(request.getLat());
        if (request.getLng() != null) listing.setLng(request.getLng());
        if (request.getAddress() != null) listing.setAddress(request.getAddress());
        if (request.getCity() != null) listing.setCity(request.getCity());
        if (request.getState() != null) listing.setState(request.getState());
        if (request.getCountry() != null) listing.setCountry(request.getCountry());
        if (request.getDeliveryOption() != null) listing.setDeliveryOption(request.getDeliveryOption());
        if (request.getDeliveryRadius() != null) listing.setDeliveryRadius(request.getDeliveryRadius());
        if (request.getWorkerName() != null) listing.setWorkerName(request.getWorkerName());
        if (request.getWorkerBio() != null) listing.setWorkerBio(request.getWorkerBio());
        if (request.getWorkerProfession() != null) listing.setWorkerProfession(request.getWorkerProfession());
        if (request.getServiceArea() != null) listing.setServiceArea(request.getServiceArea());
        if (request.getAvailableDays() != null) listing.setAvailableDays(request.getAvailableDays());
        
        listing = listingRepository.save(listing);
        
        // Update images if provided
        if (request.getImageUrls() != null) {
            // Delete existing images
            listingImageRepository.deleteByListing_Id(listing.getId());
            
            // Add new images
            int sortOrder = 0;
            for (String imageUrl : request.getImageUrls()) {
                if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                    ListingImage image = new ListingImage();
                    image.setListing(listing);
                    image.setUrl(imageUrl);
                    image.setIsPrimary(sortOrder == 0);
                    image.setSortOrder(sortOrder++);
                    listingImageRepository.save(image);
                }
            }
            // Refresh listing to load images
            listing = listingRepository.findById(listing.getId()).orElse(listing);
        }
        
        return mapToResponse(listing);
    }
    
    @Transactional
    public void deleteListing(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!listing.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this listing");
        }

        for (BookingStatus status : List.of(
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                BookingStatus.IN_PROGRESS,
                BookingStatus.DISPUTED)) {
            if (!bookingRepository.findByListingIdAndStatus(id, status).isEmpty()) {
                throw new RuntimeException(
                        "Cannot delete this listing while it has active bookings. "
                                + "Wait until bookings finish or contact support.");
            }
        }
        
        listingRepository.delete(listing);
    }
    
    @Transactional(readOnly = true)
    public Page<ListingResponse> getMyListings(Pageable pageable) {
        Long userId = CurrentUser.getCurrentUserId();
        return listingRepository.findByOwnerId(userId, pageable)
                .map(this::mapToResponse);
    }
    
    @Transactional
    public ListingResponse activateListing(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!listing.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to modify this listing");
        }
        
        listing.setStatus(ListingStatus.ACTIVE);
        listing = listingRepository.save(listing);
        return mapToResponse(listing);
    }
    
    @Transactional
    public ListingResponse pauseListing(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        Long userId = CurrentUser.getCurrentUserId();
        if (!listing.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to modify this listing");
        }
        
        listing.setStatus(ListingStatus.PAUSED);
        listing = listingRepository.save(listing);
        return mapToResponse(listing);
    }
    
    private ListingResponse mapToResponse(Listing listing) {
        ListingResponse response = new ListingResponse();
        response.setId(listing.getId());
        response.setType(listing.getType());
        response.setTitle(listing.getTitle());
        response.setDescription(listing.getDescription());
        response.setCategoryId(listing.getCategory().getId());
        response.setCategoryName(listing.getCategory().getName());
        response.setPriceDay(listing.getPriceDay());
        response.setPriceWeek(listing.getPriceWeek());
        response.setPriceMonth(listing.getPriceMonth());
        response.setPriceHour(listing.getPriceHour());
        response.setDeposit(listing.getDeposit());
        response.setPricingCurrency(
                listing.getPricingCurrency() != null && !listing.getPricingCurrency().isBlank()
                        ? listing.getPricingCurrency()
                        : "HUF");
        response.setStatus(listing.getStatus());
        response.setLat(listing.getLat());
        response.setLng(listing.getLng());
        response.setAddress(listing.getAddress());
        response.setCity(listing.getCity());
        response.setState(listing.getState());
        response.setCountry(listing.getCountry());
        response.setDeliveryOption(listing.getDeliveryOption());
        response.setDeliveryRadius(listing.getDeliveryRadius());
        response.setWorkerName(listing.getWorkerName());
        response.setWorkerBio(listing.getWorkerBio());
        response.setWorkerProfession(listing.getWorkerProfession());
        response.setServiceArea(listing.getServiceArea());
        response.setAvailableDays(listing.getAvailableDays());
        response.setIsFeatured(listing.getIsFeatured());
        response.setOwnerId(listing.getOwner().getId());
        response.setOwnerName(listing.getOwner().getName());
        
        // Map images (explicit query — reliable with open-in-view disabled and correct order)
        List<ListingImage> orderedImages =
                listingImageRepository.findByListing_IdOrderBySortOrderAsc(listing.getId());
        List<String> imageUrls = orderedImages.stream()
                .map(ListingImage::getUrl)
                .collect(Collectors.toList());
        response.setImageUrls(imageUrls);
        
        String primaryImageUrl = orderedImages.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ListingImage::getUrl)
                .orElse(imageUrls.isEmpty() ? null : imageUrls.get(0));
        response.setPrimaryImageUrl(primaryImageUrl);
        
        // Calculate average rating
        Double avgRating = reviewRepository.getAverageRating(listing.getOwner().getId());
        response.setAverageRating(avgRating);
        
        Long reviewCount = reviewRepository.getReviewCount(listing.getOwner().getId());
        response.setReviewCount(reviewCount);
        
        return response;
    }

    private static String normalizePricingCurrency(String raw) {
        if (raw == null || raw.isBlank()) {
            return "HUF";
        }
        String c = raw.trim().toUpperCase();
        if (c.length() != 3) {
            return "HUF";
        }
        return c;
    }
}
