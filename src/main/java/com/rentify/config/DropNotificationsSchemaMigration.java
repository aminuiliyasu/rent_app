package com.rentify.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Drops the unused in-app notifications table after that feature was removed.
 * Safe to re-run: no-ops when the table is already gone.
 */
@Component
@Order(2)
public class DropNotificationsSchemaMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DropNotificationsSchemaMigration.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        if (!tableExists("notifications")) {
            return;
        }
        jdbcTemplate.execute("DROP TABLE notifications");
        log.info("Dropped unused notifications table");
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE UPPER(TABLE_NAME) = ?",
                Integer.class,
                tableName.toUpperCase());
        return count != null && count > 0;
    }
}
