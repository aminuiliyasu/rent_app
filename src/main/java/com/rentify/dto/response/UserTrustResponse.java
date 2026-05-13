package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public trust signals: ratings about a user and the most recent published exchange in either direction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserTrustResponse {
    /** Average of published reviews where this user is the reviewee (others rating them). */
    private Double averageRatingReceived;
    /** Count of published reviews about this user. */
    private Long reviewsReceivedCount;
    /** Most recent published review about this user (what someone said about them). */
    private ReviewResponse latestReceived;
    /** Most recent published review they wrote about someone else. */
    private ReviewResponse latestGiven;
}
