package com.rentify.service;

import com.rentify.model.Category;
import com.rentify.model.Listing;
import com.rentify.repository.CategoryRepository;
import com.rentify.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Idempotent seed for Budapest-focused categories. Legacy rows are merged on startup
 * so clients only see a small, efficient set.
 */
@Service
public class CategorySeedService {

    private static final List<String> ACTIVE_SLUGS = List.of(
            "tools-equipment",
            "electronics",
            "home-living",
            "apartment",
            "services",
            "vehicles",
            "pet-lovers",
            "socials",
            "other"
    );

    private static final Map<String, String> LEGACY_SLUG_MIGRATIONS = Map.ofEntries(
            Map.entry("furniture", "home-living"),
            Map.entry("housing", "apartment"),
            Map.entry("infant-items", "home-living"),
            Map.entry("garages", "home-living"),
            Map.entry("professional-services", "services"),
            Map.entry("sports-recreation", "socials"),
            Map.entry("fashion-costumes", "socials"),
            Map.entry("fashion-customs", "other"),
            Map.entry("pet-lover", "pet-lovers"),
            Map.entry("event-supplies", "socials"),
            Map.entry("parties-events", "socials")
    );

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Transactional
    public void ensureDefaultCategories() {
        ensureCategory("Tools & DIY", "tools-equipment");
        ensureCategory("Electronics", "electronics");
        ensureCategory("Home & Living", "home-living");
        ensureCategory("Spaces", "apartment");
        ensureCategory("Services", "services");
        ensureCategory("Scooter & Bikes", "vehicles");
        ensureCategory("Pet Lovers", "pet-lovers");
        ensureCategory("Socials", "socials");
        ensureCategory("Other", "other");

        migrateLegacyCategories();
    }

    public List<Category> getActiveCategories() {
        ensureDefaultCategories();
        Set<String> active = Set.copyOf(ACTIVE_SLUGS);
        return categoryRepository.findAll().stream()
                .filter(c -> c.getSlug() != null && active.contains(c.getSlug()))
                .sorted(Comparator.comparingInt(c -> ACTIVE_SLUGS.indexOf(c.getSlug())))
                .toList();
    }

    private void migrateLegacyCategories() {
        for (Map.Entry<String, String> entry : LEGACY_SLUG_MIGRATIONS.entrySet()) {
            migrateListingsFromSlug(entry.getKey(), entry.getValue());
        }
    }

    private void migrateListingsFromSlug(String fromSlug, String toSlug) {
        categoryRepository.findBySlug(fromSlug).ifPresent(from ->
                categoryRepository.findBySlug(toSlug).ifPresent(to -> {
                    if (from.getId().equals(to.getId())) {
                        return;
                    }
                    List<Listing> listings = listingRepository.findByCategoryId(from.getId());
                    if (listings.isEmpty()) {
                        return;
                    }
                    for (Listing listing : listings) {
                        listing.setCategory(to);
                    }
                    listingRepository.saveAll(listings);
                })
        );
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
