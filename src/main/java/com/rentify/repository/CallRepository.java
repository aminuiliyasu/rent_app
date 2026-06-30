package com.rentify.repository;

import com.rentify.model.Call;
import com.rentify.model.enums.CallStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {
    
    Optional<Call> findByCallId(String callId);
    
    @Query("SELECT c FROM Call c WHERE (c.caller.id = :userId OR c.receiver.id = :userId) " +
           "ORDER BY c.createdAt DESC")
    Page<Call> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT c FROM Call c WHERE c.booking.id = :bookingId " +
           "ORDER BY c.createdAt DESC")
    List<Call> findByBookingId(@Param("bookingId") Long bookingId);

    void deleteByBookingId(Long bookingId);
    
    @Query("SELECT c FROM Call c WHERE c.status = :status " +
           "AND (c.caller.id = :userId OR c.receiver.id = :userId)")
    List<Call> findActiveCallsByUser(@Param("userId") Long userId, @Param("status") CallStatus status);
}
