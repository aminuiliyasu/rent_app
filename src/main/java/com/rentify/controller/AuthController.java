package com.rentify.controller;

import com.rentify.dto.request.LoginRequest;
import com.rentify.dto.request.RefreshTokenRequest;
import com.rentify.dto.request.RegisterRequest;
import com.rentify.dto.response.JwtAuthenticationResponse;
import com.rentify.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<JwtAuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        // #region agent log
        try {
            java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
            fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"A\",\"location\":\"AuthController.register:23\",\"message\":\"Register endpoint called\",\"data\":{\"email\":\"" + (request.getEmail() != null ? request.getEmail() : "null") + "\",\"hasName\":\"" + (request.getName() != null) + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
            fw.close();
        } catch (Exception e) {}
        // #endregion
        try {
            JwtAuthenticationResponse response = authService.register(request);
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"A\",\"location\":\"AuthController.register:30\",\"message\":\"Register successful\",\"data\":{\"hasToken\":\"" + (response.getAccessToken() != null) + "\",\"hasUser\":\"" + (response.getUser() != null) + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"A\",\"location\":\"AuthController.register:38\",\"message\":\"Register exception\",\"data\":{\"exceptionType\":\"" + e.getClass().getSimpleName() + "\",\"message\":\"" + (e.getMessage() != null ? e.getMessage().replace("\"", "'") : "null") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception ex) {}
            // #endregion
            throw e;
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {
        // #region agent log
        try {
            java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
            fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"B\",\"location\":\"AuthController.login:45\",\"message\":\"Login endpoint called\",\"data\":{\"email\":\"" + (request.getEmail() != null ? request.getEmail() : "null") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
            fw.close();
        } catch (Exception e) {}
        // #endregion
        try {
            JwtAuthenticationResponse response = authService.login(request);
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"B\",\"location\":\"AuthController.login:52\",\"message\":\"Login successful\",\"data\":{\"hasToken\":\"" + (response.getAccessToken() != null) + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"B\",\"location\":\"AuthController.login:60\",\"message\":\"Login exception\",\"data\":{\"exceptionType\":\"" + e.getClass().getSimpleName() + "\",\"message\":\"" + (e.getMessage() != null ? e.getMessage().replace("\"", "'") : "null") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception ex) {}
            // #endregion
            throw e;
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<JwtAuthenticationResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        JwtAuthenticationResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<com.rentify.dto.response.UserResponse> getCurrentUser() {
        com.rentify.dto.response.UserResponse user = authService.getCurrentUser();
        return ResponseEntity.ok(user);
    }
}
