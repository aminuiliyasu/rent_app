package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long bookingId;
    private Long senderId;
    private UserResponse sender;
    private Long receiverId;
    private UserResponse receiver;
    private String content;
    private String attachmentUrl;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    /** STANDARD | LIVE_REQUEST_REPLY */
    private String messageKind;
}
