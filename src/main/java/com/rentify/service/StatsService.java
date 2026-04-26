package com.rentify.service;

import com.rentify.dto.response.PublicStatsResponse;
import com.rentify.model.enums.ListingStatus;
import com.rentify.model.enums.ListingType;
import com.rentify.repository.ListingRepository;
import com.rentify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsService {
    
    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public PublicStatsResponse getPublicStats() {
        // Count total listings
        Long totalListings = listingRepository.count();
        
        // Count active listings
        Long activeListings = listingRepository.countByStatus(ListingStatus.ACTIVE);
        
        // Count workers (listings with type WORKER)
        Long totalWorkers = listingRepository.countByTypeAndStatus(ListingType.WORKER, ListingStatus.ACTIVE);
        
        // Count total users (active and not banned)
        Long totalUsers = userRepository.countByIsActiveTrueAndIsBannedFalse();
        
        return new PublicStatsResponse(
            totalListings,
            activeListings,
            totalWorkers,
            totalUsers
        );
    }
}
