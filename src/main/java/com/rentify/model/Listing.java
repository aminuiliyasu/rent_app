package com.rentify.model;

import com.rentify.model.enums.DeliveryOption;
import com.rentify.model.enums.ListingStatus;
import com.rentify.model.enums.ListingType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "listings", indexes = {
    @Index(name = "idx_listings_owner_id", columnList = "owner_id"),
    @Index(name = "idx_listings_category_id", columnList = "category_id"),
    @Index(name = "idx_listings_status", columnList = "status"),
    @Index(name = "idx_listings_type", columnList = "type"),
    @Index(name = "idx_listings_location", columnList = "lat,lng")
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"owner", "category", "images", "availabilities", "bookings"})
@ToString(exclude = {"owner", "category", "images", "availabilities", "bookings"})
@NoArgsConstructor
@AllArgsConstructor
public class Listing extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingType type;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    // Pricing
    @Column(name = "price_day", precision = 10, scale = 2)
    private BigDecimal priceDay;
    
    @Column(name = "price_week", precision = 10, scale = 2)
    private BigDecimal priceWeek;
    
    @Column(name = "price_month", precision = 10, scale = 2)
    private BigDecimal priceMonth;
    
    @Column(name = "price_hour", precision = 10, scale = 2)
    private BigDecimal priceHour; // For workers
    
    @Column(name = "deposit", precision = 10, scale = 2)
    private BigDecimal deposit;

    /** ISO 4217 code for displaying rates (e.g. USD, EUR, HUF). */
    @Column(name = "pricing_currency", length = 3)
    private String pricingCurrency = "HUF";
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status = ListingStatus.DRAFT;
    
    // Location
    @Column(precision = 10)
    private Double lat;
    
    @Column(precision = 10)
    private Double lng;
    
    @Column(name = "address", length = 500)
    private String address;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "state", length = 100)
    private String state;
    
    @Column(name = "country", length = 100)
    private String country;
    
    // Delivery
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_option")
    private DeliveryOption deliveryOption = DeliveryOption.PICKUP_ONLY;
    
    @Column(name = "delivery_radius")
    private Integer deliveryRadius; // in kilometers
    
    // Worker-specific fields
    @Column(name = "worker_name", length = 100)
    private String workerName;
    
    @Column(name = "worker_bio", columnDefinition = "TEXT")
    private String workerBio;
    
    @Column(name = "worker_profession", length = 100)
    private String workerProfession;
    
    @Column(name = "service_area", length = 200)
    private String serviceArea;

    @Column(name = "available_days", length = 50)
    private String availableDays;
    
    // Features
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;
    
    @Column(name = "boost_until")
    private java.time.LocalDateTime boostUntil;
    
    // Relationships
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<ListingImage> images = new HashSet<>();
    
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<Availability> availabilities = new HashSet<>();
    
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Booking> bookings = new HashSet<>();
}
