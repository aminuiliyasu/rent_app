package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    /** ISO-8601 instant in UTC, e.g. {@code 2026-07-04T22:41:00Z} */
    private String readAt;
    /** ISO-8601 instant in UTC, e.g. {@code 2026-07-04T22:41:00Z} */
    private String createdAt;
    /** STANDARD | LIVE_REQUEST_REPLY */
    private String messageKind;
}
