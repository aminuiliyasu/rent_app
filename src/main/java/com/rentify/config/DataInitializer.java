package com.rentify.config;

import com.rentify.model.Category;
import com.rentify.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Override
    public void run(String... args) {
        // Initialize categories if they don't exist
        if (categoryRepository.count() == 0) {
            createDefaultCategories();
            System.out.println("Default categories initialized");
        }
    }
    
    private void createDefaultCategories() {
        // Electronics
        Category electronics = new Category();
        electronics.setName("Electronics");
        electronics.setSlug("electronics");
        categoryRepository.save(electronics);
        
        // Vehicles
        Category vehicles = new Category();
        vehicles.setName("Vehicles");
        vehicles.setSlug("vehicles");
        categoryRepository.save(vehicles);
        
        // Tools & Equipment
        Category tools = new Category();
        tools.setName("Tools & Equipment");
        tools.setSlug("tools-equipment");
        categoryRepository.save(tools);
        
        // Furniture
        Category furniture = new Category();
        furniture.setName("Furniture");
        furniture.setSlug("furniture");
        categoryRepository.save(furniture);
        
        // Sports & Recreation
        Category sports = new Category();
        sports.setName("Sports & Recreation");
        sports.setSlug("sports-recreation");
        categoryRepository.save(sports);
        
        // Workers - Professional Services
        Category workers = new Category();
        workers.setName("Professional Services");
        workers.setSlug("professional-services");
        categoryRepository.save(workers);
        
        // Other
        Category other = new Category();
        other.setName("Other");
        other.setSlug("other");
        categoryRepository.save(other);
    }
}
