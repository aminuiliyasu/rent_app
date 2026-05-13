package com.rentify.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartLiveRentWishConversationRequest {

    @NotNull(message = "listingId is required")
    private Long listingId;
}
