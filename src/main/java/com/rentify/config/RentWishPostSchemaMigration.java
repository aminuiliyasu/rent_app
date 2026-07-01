package com.rentify.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Adds {@code visibility_hours} to legacy H2 databases where Hibernate ddl-auto failed
 * because the column was declared NOT NULL on a non-empty table.
 */
@Component
@Order(0)
public class RentWishPostSchemaMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        if (!tableExists("RENT_WISH_POSTS")) {
            return;
        }
        if (!columnExists("RENT_WISH_POSTS", "VISIBILITY_HOURS")) {
            jdbcTemplate.execute(
                    "ALTER TABLE rent_wish_posts ADD COLUMN visibility_hours INTEGER DEFAULT 24");
        }
        jdbcTemplate.update(
                "UPDATE rent_wish_posts SET visibility_hours = 24 WHERE visibility_hours IS NULL");
        if (!columnExists("RENT_WISH_POSTS", "DEPOSIT_PREFERENCE")) {
            jdbcTemplate.execute(
                    "ALTER TABLE rent_wish_posts ADD COLUMN deposit_preference VARCHAR(16)");
        }
        if (!columnExists("RENT_WISH_POSTS", "DEPOSIT_NOTE")) {
            jdbcTemplate.execute(
                    "ALTER TABLE rent_wish_posts ADD COLUMN deposit_note VARCHAR(120)");
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE UPPER(TABLE_NAME) = ?",
                Integer.class,
                tableName.toUpperCase());
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS "
                        + "WHERE UPPER(TABLE_NAME) = ? AND UPPER(COLUMN_NAME) = ?",
                Integer.class,
                tableName.toUpperCase(),
                columnName.toUpperCase());
        return count != null && count > 0;
    }
}
