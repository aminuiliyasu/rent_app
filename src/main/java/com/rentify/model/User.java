package com.rentify.model;

import com.rentify.model.enums.KycStatus;
import com.rentify.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_phone", columnList = "phone")
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"listings", "bookings", "sentMessages", "receivedMessages"})
@ToString(exclude = {"listings", "bookings", "sentMessages", "receivedMessages"})
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "password_hash", length = 255)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.RENTER;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false)
    private KycStatus kycStatus = KycStatus.NOT_REQUIRED;
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;
    
    @Column(name = "phone_verified", nullable = false)
    private Boolean phoneVerified = false;
    
    @Column(name = "two_factor_enabled", nullable = false)
    private Boolean twoFactorEnabled = false;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "is_banned", nullable = false)
    private Boolean isBanned = false;
    
    // KYC fields
    @Column(name = "kyc_id_url", length = 500)
    private String kycIdUrl;
    
    @Column(name = "kyc_selfie_url", length = 500)
    private String kycSelfieUrl;
    
    @Column(name = "kyc_verified_at")
    private java.time.LocalDateTime kycVerifiedAt;
    
    // OAuth fields
    @Column(name = "google_id", unique = true)
    private String googleId;
    
    @Column(name = "facebook_id", unique = true)
    private String facebookId;
    
    // Relationships
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Listing> listings = new HashSet<>();
    
    @OneToMany(mappedBy = "renter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Booking> bookings = new HashSet<>();
    
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Message> sentMessages = new HashSet<>();
    
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Message> receivedMessages = new HashSet<>();
}
