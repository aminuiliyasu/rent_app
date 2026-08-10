package com.rentify.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Connection;

/**
 * Legacy databases were created when {@code Currency} only included USD and African codes.
 * Budapest listings store HUF/EUR/GBP — widen the column on startup so bookings can save.
 */
@Component
@Order(1)
public class BookingCurrencySchemaMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BookingCurrencySchemaMigration.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        if (!tableExists("bookings")) {
            return;
        }

        String product = databaseProductName();
        if (product.contains("PostgreSQL")) {
            widenCurrencyColumnPostgres("bookings");
            widenCurrencyColumnPostgres("transactions");
        } else if (product.contains("MySQL")) {
            widenCurrencyColumnMySql("bookings");
            widenCurrencyColumnMySql("transactions");
        }
    }

    private void widenCurrencyColumnPostgres(String table) {
        if (!columnExists(table, "currency")) {
            return;
        }
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE " + table + " ALTER COLUMN currency TYPE VARCHAR(10) USING currency::text");
            log.info("Widened {}.currency to VARCHAR(10) for HUF/EUR/GBP support", table);
        } catch (Exception ex) {
            log.warn("Could not widen {}.currency (may already be VARCHAR): {}", table, ex.getMessage());
            addPostgresEnumValueIfPresent("currency", "HUF");
            addPostgresEnumValueIfPresent("currency", "EUR");
            addPostgresEnumValueIfPresent("currency", "GBP");
        }
    }

    private void addPostgresEnumValueIfPresent(String typeName, String value) {
        try {
            jdbcTemplate.execute("ALTER TYPE " + typeName + " ADD VALUE IF NOT EXISTS '" + value + "'");
            log.info("Added {} to PostgreSQL enum {}", value, typeName);
        } catch (Exception ignored) {
            // Type name may differ; column conversion above is the primary fix.
        }
    }

    private void widenCurrencyColumnMySql(String table) {
        if (!columnExists(table, "currency")) {
            return;
        }
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE " + table + " MODIFY COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'HUF'");
            log.info("Widened {}.currency to VARCHAR(10) for HUF/EUR/GBP support", table);
        } catch (Exception ex) {
            log.warn("Could not widen {}.currency: {}", table, ex.getMessage());
        }
    }

    private String databaseProductName() {
        try (Connection conn = jdbcTemplate.getDataSource().getConnection()) {
            return conn.getMetaData().getDatabaseProductName();
        } catch (Exception ex) {
            log.warn("Could not detect database product: {}", ex.getMessage());
            return "";
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE LOWER(table_name) = LOWER(?)",
                Integer.class,
                tableName);
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns "
                        + "WHERE LOWER(table_name) = LOWER(?) AND LOWER(column_name) = LOWER(?)",
                Integer.class,
                tableName,
                columnName);
        return count != null && count > 0;
    }
}
