-- Manual fix if booking still fails with "currency is not supported by the database".
-- Production uses PostgreSQL (see deploy/terraform/rds.tf).

-- PostgreSQL (run in RDS Query Editor or psql)
ALTER TABLE bookings ALTER COLUMN currency TYPE VARCHAR(10) USING currency::text;
ALTER TABLE transactions ALTER COLUMN currency TYPE VARCHAR(10) USING currency::text;

-- If the column uses a PostgreSQL ENUM named "currency", you can instead add values:
-- ALTER TYPE currency ADD VALUE IF NOT EXISTS 'HUF';
-- ALTER TYPE currency ADD VALUE IF NOT EXISTS 'EUR';
-- ALTER TYPE currency ADD VALUE IF NOT EXISTS 'GBP';

-- MySQL (only if not on Postgres)
-- ALTER TABLE bookings MODIFY COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'HUF';
-- ALTER TABLE transactions MODIFY COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'HUF';
