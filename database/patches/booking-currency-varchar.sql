-- Run once on production if booking creation fails after the currency update (HUF/EUR/GBP).
-- Older schemas may use a MySQL ENUM that only allows USD, NGN, GHS, KES, ZAR.

-- PostgreSQL
-- ALTER TABLE bookings ALTER COLUMN currency TYPE VARCHAR(10) USING currency::text;

-- MySQL
ALTER TABLE bookings MODIFY COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'HUF';

-- Optional: same for transactions if inserts fail there
-- ALTER TABLE transactions MODIFY COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'HUF';
