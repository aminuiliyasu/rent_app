package com.rentify.service;

import com.rentify.model.Category;
import com.rentify.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Idempotent seed for default categories. Called on startup and before category reads so
 * clients never see missing rows (e.g. Fashion&amp;costumes) after DB resets or partial imports.
 */
@Service
public class CategorySeedService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    public void ensureDefaultCategories() {
        migrateLegacyCategorySlugs();
        ensureCategory("Electronics", "electronics");
        ensureCategory("Vehicles", "vehicles");
        ensureCategory("Tools & Equipment", "tools-equipment");
        ensureCategory("Furniture", "furniture");
        ensureCategory("Sports & Recreation", "sports-recreation");
        ensureCategory("Professional Services", "professional-services");
        ensureCategory("Housing", "housing");
        ensureCategory("Infant Items", "infant-items");
        ensureCategory("Pet Lover", "pet-lover");
        ensureCategory("Fashion&costumes", "fashion-costumes");
        ensureCategory("Other", "other");
    }

    private void migrateLegacyCategorySlugs() {
        categoryRepository.findBySlug("garages").ifPresent(category -> {
            category.setName("Infant Items");
            category.setSlug("infant-items");
            categoryRepository.save(category);
        });
        categoryRepository.findBySlug("fashion-customs").ifPresent(category -> {
            category.setName("Fashion&costumes");
            category.setSlug("fashion-costumes");
            categoryRepository.save(category);
        });
    }

    /** Create if missing, or update display name if the slug already exists (idempotent seed). */
    private void ensureCategory(String name, String slug) {
        categoryRepository.findBySlug(slug).ifPresentOrElse(
                existing -> {
                    if (!name.equals(existing.getName())) {
                        existing.setName(name);
                        categoryRepository.save(existing);
                    }
                },
                () -> {
                    Category category = new Category();
                    category.setName(name);
                    category.setSlug(slug);
                    categoryRepository.save(category);
                });
    }
}
