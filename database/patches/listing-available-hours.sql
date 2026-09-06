-- Add weekly time-availability on listings (mirrors available_days).
-- Safe to re-run: ignores the column if it already exists.

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS available_hours VARCHAR(120) NULL;
