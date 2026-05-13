package com.rentify.dto.response;

import com.rentify.model.enums.BookingStatus;
import com.rentify.model.enums.Currency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long listingId;
    private ListingResponse listing;
    private Long renterId;
    private UserResponse renter;
    private Long ownerId;
    private UserResponse owner;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BookingStatus status;
    private BigDecimal totalAmount;
    private BigDecimal deposit;
    private BigDecimal platformFee;
    private Currency currency;
    private String paymentId;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Present when this booking was opened from a live rent request (feed). */
    private Long rentWishPostId;

    /** Populated on GET /bookings/{id} for renter and owner only. */
    private BookingReviewSummaryResponse reviewSummary;
}
