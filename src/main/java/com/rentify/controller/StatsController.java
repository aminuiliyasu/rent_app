package com.rentify.controller;

import com.rentify.dto.response.PublicStatsResponse;
import com.rentify.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stats")
@CrossOrigin(origins = "*")
public class StatsController {
    
    @Autowired
    private StatsService statsService;
    
    @GetMapping("/public")
    public ResponseEntity<PublicStatsResponse> getPublicStats() {
        PublicStatsResponse stats = statsService.getPublicStats();
        return ResponseEntity.ok(stats);
    }
}
