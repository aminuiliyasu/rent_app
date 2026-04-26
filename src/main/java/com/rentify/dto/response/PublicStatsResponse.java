package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicStatsResponse {
    private Long totalListings;
    private Long activeListings;
    private Long totalWorkers;
    private Long totalUsers;
}
