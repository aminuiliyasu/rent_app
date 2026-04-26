package com.rentify.controller;

import com.rentify.dto.request.UpdateProfileRequest;
import com.rentify.dto.response.DashboardStatsResponse;
import com.rentify.dto.response.UserResponse;
import com.rentify.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        UserResponse profile = userService.getMyProfile();
        return ResponseEntity.ok(profile);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getProfile(@PathVariable Long id) {
        UserResponse profile = userService.getProfile(id);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserResponse profile = userService.updateProfile(request);
        return ResponseEntity.ok(profile);
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = userService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
