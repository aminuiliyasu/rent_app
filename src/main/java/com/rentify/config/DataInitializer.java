package com.rentify.config;

import com.rentify.service.CategorySeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategorySeedService categorySeedService;

    @Override
    public void run(String... args) {
        categorySeedService.ensureDefaultCategories();
        System.out.println("Default categories verified");
    }

    /** Second pass after the context is fully ready (helps missing rows from older DBs). */
    @EventListener(ApplicationReadyEvent.class)
    public void seedCategoriesWhenReady() {
        categorySeedService.ensureDefaultCategories();
    }
}
