package com.rentify.service;

import com.rentify.dto.request.UpdateProfileRequest;
import com.rentify.dto.response.DashboardStatsResponse;
import com.rentify.dto.response.UserResponse;
import com.rentify.model.Listing;
import com.rentify.model.User;
import com.rentify.model.enums.BookingStatus;
import com.rentify.model.enums.ListingStatus;
import com.rentify.repository.BookingRepository;
import com.rentify.repository.ListingRepository;
import com.rentify.repository.MessageRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToResponse(user);
    }
    
    @Transactional(readOnly = true)
    public UserResponse getMyProfile() {
        Long userId = CurrentUser.getCurrentUserId();
        return getProfile(userId);
    }
    
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        Long userId = CurrentUser.getCurrentUserId();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }
        
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        user = userRepository.save(user);
        
        return mapToResponse(user);
    }
    
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        Long userId = CurrentUser.getCurrentUserId();
        
        // Active bookings (as renter)
        long activeBookings = bookingRepository.findByRenterId(userId, 
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .stream()
            .filter(b -> b.getStatus() == BookingStatus.PENDING || 
                        b.getStatus() == BookingStatus.CONFIRMED ||
                        b.getStatus() == BookingStatus.IN_PROGRESS)
            .count();
        
        // Total bookings (as renter)
        long totalBookings = bookingRepository.findByRenterId(userId,
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .getTotalElements();
        
        // My listings
        List<Listing> myListings = listingRepository.findAll()
            .stream()
            .filter(l -> l.getOwner().getId().equals(userId))
            .collect(Collectors.toList());
        
        long totalListings = myListings.size();
        long activeListings = myListings.stream()
            .filter(l -> l.getStatus() == ListingStatus.ACTIVE)
            .count();
        
        // Unread messages
        Long unreadMessages = messageRepository.countUnreadMessages(userId);
        
        return new DashboardStatsResponse(
            activeBookings,
            totalBookings,
            totalListings,
            activeListings,
            unreadMessages
        );
    }
    
    private UserResponse mapToResponse(User user) {
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
