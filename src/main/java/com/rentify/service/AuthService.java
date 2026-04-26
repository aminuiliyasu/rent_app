package com.rentify.service;

import com.rentify.dto.request.LoginRequest;
import com.rentify.dto.request.RegisterRequest;
import com.rentify.dto.response.JwtAuthenticationResponse;
import com.rentify.dto.response.UserResponse;
import com.rentify.model.User;
import com.rentify.model.enums.KycStatus;
import com.rentify.model.enums.UserRole;
import com.rentify.repository.UserRepository;
import com.rentify.security.JwtTokenProvider;
import com.rentify.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Transactional
    public JwtAuthenticationResponse register(RegisterRequest request) {
        // #region agent log
        try {
            java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
            fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"C\",\"location\":\"AuthService.register:38\",\"message\":\"Register service called\",\"data\":{\"email\":\"" + (request.getEmail() != null ? request.getEmail() : "null") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
            fw.close();
        } catch (Exception e) {}
        // #endregion
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                // #region agent log
                try {
                    java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                    fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"D\",\"location\":\"AuthService.register:42\",\"message\":\"Email exists check\",\"data\":{\"exists\":true},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                    fw.close();
                } catch (Exception e) {}
                // #endregion
                throw new RuntimeException("Email already exists");
            }
            
            if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
                throw new RuntimeException("Phone number already exists");
            }
            
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setRole(UserRole.RENTER);
            user.setKycStatus(KycStatus.NOT_REQUIRED);
            user.setEmailVerified(false);
            user.setPhoneVerified(false);
            user.setIsActive(true);
            user.setIsBanned(false);
            
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"D\",\"location\":\"AuthService.register:65\",\"message\":\"Before userRepository.save\",\"data\":{\"userId\":null},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            user = userRepository.save(user);
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"D\",\"location\":\"AuthService.register:67\",\"message\":\"After userRepository.save\",\"data\":{\"userId\":\"" + (user.getId() != null ? user.getId() : "null") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"E\",\"location\":\"AuthService.register:70\",\"message\":\"Before authenticationManager.authenticate\",\"data\":{},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"E\",\"location\":\"AuthService.register:75\",\"message\":\"After authenticationManager.authenticate\",\"data\":{\"authenticated\":\"" + (authentication != null && authentication.isAuthenticated()) + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"F\",\"location\":\"AuthService.register:82\",\"message\":\"Before token generation\",\"data\":{},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(request.getEmail());
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"F\",\"location\":\"AuthService.register:85\",\"message\":\"After token generation\",\"data\":{\"hasAccessToken\":\"" + (accessToken != null && !accessToken.isEmpty()) + "\",\"hasRefreshToken\":\"" + (refreshToken != null && !refreshToken.isEmpty()) + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception e) {}
            // #endregion
            
            UserResponse userResponse = mapToUserResponse(user);
            
            return new JwtAuthenticationResponse(accessToken, refreshToken, "Bearer", userResponse);
        } catch (Exception e) {
            // #region agent log
            try {
                java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
                fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"C\",\"location\":\"AuthService.register:95\",\"message\":\"Register service exception\",\"data\":{\"exceptionType\":\"" + e.getClass().getSimpleName() + "\",\"message\":\"" + (e.getMessage() != null ? e.getMessage().replace("\"", "'").replace("\n", " ") : "null") + "\",\"stackTrace\":\"" + (e.getStackTrace().length > 0 ? e.getStackTrace()[0].toString().replace("\"", "'") : "none") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
                fw.close();
            } catch (Exception ex) {}
            // #endregion
            throw e;
        }
    }
    
    public JwtAuthenticationResponse login(LoginRequest request) {
        try {
            // First check if user exists
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));
            
            // Check if user is active
            if (user.getIsActive() == null || !user.getIsActive()) {
                throw new RuntimeException("Account is not active. Please contact support.");
            }
            
            // Check if user is banned
            if (user.getIsBanned() != null && user.getIsBanned()) {
                throw new RuntimeException("Account has been banned. Please contact support.");
            }
            
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(request.getEmail());
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User authenticatedUser = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            UserResponse userResponse = mapToUserResponse(authenticatedUser);
            
            return new JwtAuthenticationResponse(accessToken, refreshToken, "Bearer", userResponse);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        } catch (org.springframework.security.authentication.DisabledException e) {
            throw new RuntimeException("Account is disabled. Please contact support.");
        } catch (org.springframework.security.authentication.LockedException e) {
            throw new RuntimeException("Account is locked. Please contact support.");
        }
    }
    
    public JwtAuthenticationResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        String email = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getIsActive() || user.getIsBanned()) {
            throw new RuntimeException("User account is inactive or banned");
        }
        
        // Generate new tokens
        String newAccessToken = tokenProvider.generateTokenFromUsername(email);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);
        
        UserResponse userResponse = mapToUserResponse(user);
        
        return new JwtAuthenticationResponse(newAccessToken, newRefreshToken, "Bearer", userResponse);
    }
    
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }
    
    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getKycStatus(),
            user.getAvatarUrl(),
            user.getEmailVerified(),
            user.getPhoneVerified()
        );
    }
}
