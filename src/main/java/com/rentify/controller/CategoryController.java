package com.rentify.controller;

import com.rentify.model.Category;
import com.rentify.repository.CategoryRepository;
import com.rentify.service.CategorySeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategorySeedService categorySeedService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categorySeedService.getActiveCategories());
    }

    @GetMapping("/by-slug/{slug}")
    public ResponseEntity<Category> getCategoryBySlug(@PathVariable String slug) {
        categorySeedService.ensureDefaultCategories();
        String key = slug != null ? slug.trim() : "";
        return categoryRepository.findBySlug(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return ResponseEntity.ok(category);
    }
    
    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<Category>> getSubcategories(@PathVariable Long id) {
        List<Category> subcategories = categoryRepository.findByParentId(id);
        return ResponseEntity.ok(subcategories);
    }
}
