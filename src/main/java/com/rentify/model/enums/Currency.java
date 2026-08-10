package com.rentify.model.enums;

import java.util.EnumSet;
import java.util.Set;

public enum Currency {
    HUF,
    USD,
    EUR,
    GBP,
    NGN,
    GHS,
    KES,
    ZAR;

    /** Currencies the original production PostgreSQL schema accepts on {@code bookings.currency}. */
    private static final Set<Currency> LEGACY_DB_CURRENCIES =
            EnumSet.of(USD, NGN, GHS, KES, ZAR);

    /** Maps listing {@code pricingCurrency} (ISO 4217) to a stored booking currency. */
    public static Currency fromPricingCurrency(String pricingCurrency) {
        if (pricingCurrency == null || pricingCurrency.isBlank()) {
            return HUF;
        }
        try {
            return valueOf(pricingCurrency.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return HUF;
        }
    }

    /**
     * Value safe to INSERT into legacy DB columns that predate HUF/EUR/GBP.
     * Amounts stay in the listing's currency; {@link #forApiDisplay} restores the real code for API/UI.
     */
    public static Currency forDatabaseStorage(String pricingCurrency) {
        Currency desired = fromPricingCurrency(pricingCurrency);
        return LEGACY_DB_CURRENCIES.contains(desired) ? desired : USD;
    }

    /** Currency code returned to clients — always the listing's pricing currency when known. */
    public static Currency forApiDisplay(String pricingCurrency, Currency storedInDb) {
        if (pricingCurrency != null && !pricingCurrency.isBlank()) {
            return fromPricingCurrency(pricingCurrency);
        }
        return storedInDb != null ? storedInDb : HUF;
    }
}
