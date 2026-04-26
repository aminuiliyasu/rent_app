package com.rentify.repository;

import com.rentify.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    
    List<Availability> findByListingIdAndDateBetween(Long listingId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Availability a WHERE a.listing.id = :listingId " +
           "AND a.date BETWEEN :startDate AND :endDate AND a.isAvailable = true")
    List<Availability> findAvailableDates(@Param("listingId") Long listingId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    void deleteByListingId(Long listingId);
}
