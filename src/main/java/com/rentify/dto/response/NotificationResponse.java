package com.rentify.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String body;
    private String linkPath;
    private String actorName;
    private Long bookingId;
    private Long messageId;
    private boolean read;
    private LocalDateTime createdAt;
}
