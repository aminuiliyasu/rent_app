package com.rentify.model;

import com.rentify.model.enums.DeliveryPreference;
import com.rentify.model.enums.DepositPreference;
import com.rentify.model.enums.RentWishRequestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rent_wish_posts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class RentWishPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 16)
    private RentWishRequestType requestType = RentWishRequestType.ITEM;

    /** When the service is needed — for WORKER requests (e.g. "Tonight from 6pm"). */
    @Column(name = "timing_note", length = 120)
    private String timingNote;

    @Column(length = 2000)
    private String description;

    /** Free-text fallback (kept for legacy posts). New posts populate district/city/country instead. */
    @Column(length = 200)
    private String location;

    @Column(length = 120)
    private String district;

    @Column(length = 120)
    private String city;

    @Column(length = 120)
    private String country;

    /** Free-text budget note: price, currency, and total duration in the renter's own words. */
    @Column(name = "budget_text", length = 280)
    private String budgetText;

    /** Preferred handover method. */
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_preference", length = 16)
    private DeliveryPreference deliveryPreference;

    /** What kind of deposit the renter is willing to accept. */
    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_preference", length = 16)
    private DepositPreference depositPreference;

    /** Optional detail when deposit is cash or item — e.g. amount or collateral item. */
    @Column(name = "deposit_note", length = 120)
    private String depositNote;

    /** How long the post stays visible in the feed (12 or 24). */
    @Column(name = "visibility_hours", nullable = false, columnDefinition = "integer default 24")
    private Integer visibilityHours = 24;
}
