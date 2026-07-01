package com.rentify.model.enums;

/**
 * What kind of security deposit a renter is willing to accept on a rent wish post.
 */
public enum DepositPreference {
    /** Prefer no deposit. */
    NONE,
    /** Cash deposit is OK. */
    CASH,
    /** Item deposit (collateral) is OK. */
    ITEM,
    /** Open to discussing deposit terms in chat. */
    FLEXIBLE
}
