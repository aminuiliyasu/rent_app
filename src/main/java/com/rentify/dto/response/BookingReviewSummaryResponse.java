package com.rentify.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingReviewSummaryResponse {
    /** Whether the current user may submit their review (booking completed and not yet reviewed). */
    private boolean canSubmitReview;
    /** You submitted yours; waiting for the other party before reviews go public together. */
    private boolean awaitingPartnerReview;
    /** Both reviews are live; partner's review is visible. */
    private boolean bothReviewsVisible;
    private ReviewResponse myReview;
    private ReviewResponse partnerReview;
}
