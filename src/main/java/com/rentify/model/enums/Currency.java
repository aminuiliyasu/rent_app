package com.rentify.model.enums;

public enum Currency {
    HUF,
    USD,
    EUR,
    GBP,
    NGN,
    GHS,
    KES,
    ZAR;

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
}
