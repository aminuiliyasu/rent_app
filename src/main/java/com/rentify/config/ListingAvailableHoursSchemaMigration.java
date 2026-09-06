package com.rentify.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Adds {@code available_hours} on listings for databases created before the field existed.
 * Hibernate ddl-auto=update usually handles this; this is a fallback for validate/legacy H2.
 */
@Component
@Order(0)
public class ListingAvailableHoursSchemaMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        if (!tableExists("LISTINGS")) {
            return;
        }
        if (!columnExists("LISTINGS", "AVAILABLE_HOURS")) {
            jdbcTemplate.execute("ALTER TABLE listings ADD COLUMN available_hours VARCHAR(120)");
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
