package com.rentify.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RentWishPostResponse {
    private Long id;
    private String title;
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
}
