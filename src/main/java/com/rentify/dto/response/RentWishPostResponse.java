package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentWishPostResponse {
    private Long id;
    /** ITEM or WORKER */
    private String requestType;
    private String title;
    private String timingNote;
    private String description;
    private String location;
    private String district;
    private String city;
    private String country;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    /** Free-text budget note as entered by the renter (null when empty). */
    private String budgetText;

    /** PICKUP | DELIVERY | EITHER (null when renter didn't specify). */
    private String deliveryPreference;

    /** NONE | CASH | ITEM | FLEXIBLE (null when renter didn't specify). */
    private String depositPreference;

    /** Optional deposit detail — amount or collateral item. */
    private String depositNote;

    /** 12 or 24 — chosen visibility window. */
    private Integer visibilityHours;
}
