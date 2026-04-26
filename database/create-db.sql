-- Create database if not exists
CREATE DATABASE IF NOT EXISTS rentify_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (will fail if exists, that's okay)
CREATE USER IF NOT EXISTS 'rentify_user'@'localhost' IDENTIFIED BY 'RentifySecure2024!';
CREATE USER IF NOT EXISTS 'rentify_user'@'%' IDENTIFIED BY 'RentifySecure2024!';

-- Set passwords (works even if user exists)
ALTER USER 'rentify_user'@'localhost' IDENTIFIED BY 'RentifySecure2024!';
ALTER USER 'rentify_user'@'%' IDENTIFIED BY 'RentifySecure2024!';

-- Grant privileges
GRANT ALL PRIVILEGES ON rentify_db.* TO 'rentify_user'@'localhost';
GRANT ALL PRIVILEGES ON rentify_db.* TO 'rentify_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES LIKE 'rentify_db';
SELECT user, host FROM mysql.user WHERE user = 'rentify_user';
