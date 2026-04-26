package com.rentify.repository;

import com.rentify.model.Booking;
import com.rentify.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Page<Booking> findByRenterId(Long renterId, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.listing.owner.id = :ownerId")
    Page<Booking> findByListingOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);
    
    List<Booking> findByListingIdAndStatus(Long listingId, BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.listing.id = :listingId " +
           "AND b.status IN :statuses " +
           "AND ((b.startDate <= :endDate AND b.endDate >= :startDate))")
    List<Booking> findConflictingBookings(@Param("listingId") Long listingId,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate,
                                          @Param("statuses") List<BookingStatus> statuses);
    
    @Query("SELECT b FROM Booking b WHERE b.status = :status " +
           "AND b.endDate < :beforeDate")
    List<Booking> findCompletedBookingsBefore(@Param("status") BookingStatus status,
                                               @Param("beforeDate") LocalDateTime beforeDate);
}
