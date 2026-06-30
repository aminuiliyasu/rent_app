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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final SecureRandom RESET_TOKEN_RANDOM = new SecureRandom();
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Transactional
    public JwtAuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
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

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(request.getEmail());

        UserResponse userResponse = mapToUserResponse(user);

        return new JwtAuthenticationResponse(accessToken, refreshToken, "Bearer", userResponse);
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("User not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            if (principal instanceof String s && ("anonymousUser".equalsIgnoreCase(s) || s.isBlank())) {
                throw new RuntimeException("User not authenticated");
            }
            if (principal instanceof UserDetails) {
                throw new RuntimeException("User not authenticated");
            }
            throw new RuntimeException("User not authenticated");
        }
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }
    
    @Transactional
    public Map<String, String> requestPasswordReset(String email) {
        Map<String, String> response = new HashMap<>();
        response.put(
            "message",
            "If an account exists for that email, we sent password reset instructions."
        );

        userRepository.findByEmail(email.trim()).ifPresent(user -> {
            if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
                return;
            }
            byte[] tokenBytes = new byte[32];
            RESET_TOKEN_RANDOM.nextBytes(tokenBytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

            user.setPasswordResetToken(token);
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        });

        return response;
    }

    @Transactional
    public Map<String, String> resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

        if (user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            user.setPasswordResetToken(null);
            user.setPasswordResetExpiresAt(null);
            userRepository.save(user);
            throw new RuntimeException("Invalid or expired reset link");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated. You can sign in with your new password.");
        return response;
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
