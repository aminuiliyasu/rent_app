package com.rentify.dto.response;

import com.rentify.model.enums.DeliveryOption;
import com.rentify.model.enums.ListingStatus;
import com.rentify.model.enums.ListingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingResponse {
    private Long id;
    private ListingType type;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal priceDay;
    private BigDecimal priceWeek;
    private BigDecimal priceMonth;
    private BigDecimal priceHour;
    private BigDecimal deposit;
    /** ISO 4217 — how listing prices should be shown */
    private String pricingCurrency;
    private ListingStatus status;
    private Double lat;
    private Double lng;
    private String address;
    private String city;
    private String state;
    private String country;
    private DeliveryOption deliveryOption;
    private Integer deliveryRadius;
    private String workerName;
    private String workerBio;
    private String workerProfession;
    private String serviceArea;
    private String availableDays;
    private String availableHours;
    private Boolean isFeatured;
    private Long ownerId;
    private String ownerName;
    private List<String> imageUrls;
    private String primaryImageUrl;
    private Double averageRating;
    private Long reviewCount;
}
