package com.rentify.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

public final class UtcDateTimes {

    private static final ZoneId LEGACY_LOCAL_ZONE = ZoneId.of("Europe/Budapest");

    private UtcDateTimes() {
    }

    public static LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    /**
     * Serialize a {@link LocalDateTime} from the database as an ISO-8601 UTC instant.
     * New rows are stored as UTC wall clock. Older dev rows may be local wall clock;
     * if treating as UTC would land more than two minutes in the future, we reinterpret
     * as Europe/Budapest before converting to instant.
     */
    public static String toInstantString(LocalDateTime stored) {
        if (stored == null) {
            return null;
        }

        Instant asUtcWallClock = stored.toInstant(ZoneOffset.UTC);
        if (asUtcWallClock.isAfter(Instant.now().plusSeconds(120))) {
            return stored.atZone(LEGACY_LOCAL_ZONE).toInstant().toString();
        }
        return asUtcWallClock.toString();
    }
}
