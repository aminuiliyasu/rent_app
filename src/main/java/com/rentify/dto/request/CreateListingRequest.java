package com.rentify.dto.request;

import com.rentify.model.enums.DeliveryOption;
import com.rentify.model.enums.ListingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateListingRequest {
    
    @NotNull(message = "Listing type is required")
    private ListingType type;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private BigDecimal priceDay;
    private BigDecimal priceWeek;
    private BigDecimal priceMonth;
    private BigDecimal priceHour; // For workers
    private BigDecimal deposit;

    /** ISO 4217 (USD, EUR, HUF, …). Defaults on server if omitted. */
    private String pricingCurrency;
    
    private Double lat;
    private Double lng;
    private String address;
    private String city;
    private String state;
    private String country;
    
    private DeliveryOption deliveryOption = DeliveryOption.PICKUP_ONLY;
    
    @Positive(message = "Delivery radius must be positive")
    private Integer deliveryRadius;
    
    // Worker-specific fields
    private String workerName;
    private String workerBio;
    private String workerProfession;
    private String serviceArea;
    private String availableDays;
    private String availableHours;
    
    // Images
    private java.util.List<String> imageUrls;
}
