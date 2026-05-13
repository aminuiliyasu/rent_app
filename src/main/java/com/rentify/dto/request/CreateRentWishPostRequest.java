package com.rentify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRentWishPostRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

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
}
