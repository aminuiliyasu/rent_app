package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private UserResponse reviewer;
    private UserResponse reviewee;
    private Integer rating;
    private String comment;
    private Boolean isPublished;
    private LocalDateTime createdAt;
}
