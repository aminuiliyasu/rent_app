package com.rentify.dto.response;

import com.rentify.model.enums.CallStatus;
import com.rentify.model.enums.CallType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallResponse {
    private Long id;
    private String callId;
    private Long callerId;
    private UserResponse caller;
    private Long receiverId;
    private UserResponse receiver;
    private Long bookingId;
    private CallType type;
    private CallStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long durationSeconds;
    private LocalDateTime createdAt;
}
