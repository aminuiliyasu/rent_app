-- Rentify MySQL Database Initialization Script
-- Run this script after creating the database to set up initial configuration

USE rentify_db;

-- Set timezone
SET time_zone = '+00:00';

-- Optimize for production (run these after tables are created by Hibernate)
-- Note: Tables will be auto-created by Hibernate on first run

-- Additional indexes for performance (run after application creates tables)
-- These complement the indexes already defined in entity classes

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_listings_status_type ON listings(status, type);
CREATE INDEX IF NOT EXISTS idx_listings_category_status ON listings(category_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_location_status ON listings(lat, lng, status);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status_dates ON bookings(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_status ON bookings(listing_id, status);

-- Message indexes for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_booking_created ON messages(booking_id, created_at DESC);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_active_banned ON users(is_active, is_banned);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_booking_status ON transactions(booking_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(type, status);

-- Full-text search for listings (MySQL 5.6+)
-- Uncomment if you want full-text search capabilities
-- ALTER TABLE listings ADD FULLTEXT INDEX ft_listings_search (title, description);

-- Set table storage engine to InnoDB (if not already)
-- ALTER TABLE users ENGINE=InnoDB;
-- ALTER TABLE listings ENGINE=InnoDB;
-- ALTER TABLE bookings ENGINE=InnoDB;
-- ALTER TABLE messages ENGINE=InnoDB;
-- ALTER TABLE transactions ENGINE=InnoDB;

-- Optimize table statistics
ANALYZE TABLE users;
ANALYZE TABLE listings;
ANALYZE TABLE bookings;
ANALYZE TABLE messages;
ANALYZE TABLE transactions;
ANALYZE TABLE categories;
ANALYZE TABLE reviews;
ANALYZE TABLE listing_images;
ANALYZE TABLE availabilities;

-- Show current indexes
SHOW INDEX FROM listings;
SHOW INDEX FROM bookings;
SHOW INDEX FROM messages;

-- Display table information
SELECT 
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'rentify_db'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
