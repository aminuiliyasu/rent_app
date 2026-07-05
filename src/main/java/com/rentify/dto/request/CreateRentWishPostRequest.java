package com.rentify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRentWishPostRequest {

    /** ITEM (gear/space) or WORKER (person/service). Defaults to ITEM when omitted. */
    @Pattern(regexp = "^(ITEM|WORKER)$", message = "requestType must be ITEM or WORKER")
    private String requestType;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 120, message = "Timing note can be at most 120 characters")
    private String timingNote;

    @Size(max = 2000)
    private String description;

    @Size(max = 200)
    private String location;

    @Size(max = 120)
    private String district;

    @Size(max = 120)
    private String city;

    @Size(max = 120)
    private String country;

    /** Free-text budget note (price, currency, total duration) — short like a tweet. */
    @Size(max = 280, message = "Budget note can be at most 280 characters")
    private String budgetText;

    /** PICKUP | DELIVERY | EITHER */
    @Pattern(regexp = "^(PICKUP|DELIVERY|EITHER)$",
            message = "deliveryPreference must be PICKUP, DELIVERY or EITHER")
    private String deliveryPreference;

    /** NONE | CASH | ITEM | FLEXIBLE */
    @Pattern(regexp = "^(NONE|CASH|ITEM|FLEXIBLE)$",
            message = "depositPreference must be NONE, CASH, ITEM or FLEXIBLE")
    private String depositPreference;

    @Size(max = 120, message = "Deposit note can be at most 120 characters")
    private String depositNote;

    /** 12 or 24 — how long the post stays live. Defaults to 24 when omitted. */
    private Integer visibilityHours;
}
