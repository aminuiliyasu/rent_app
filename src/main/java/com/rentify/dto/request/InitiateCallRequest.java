package com.rentify.dto.request;

import com.rentify.model.enums.CallType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InitiateCallRequest {
    @NotNull(message = "Receiver ID is required")
    private Long receiverId;
    
    @NotNull(message = "Call type is required")
    private CallType type;
    
    private Long bookingId; // Optional: associate call with a booking
}
