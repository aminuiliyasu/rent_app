package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long activeBookings;
    private Long totalBookings;
    private Long myListings;
    private Long activeListings;
    private Long unreadMessages;
}
