package com.rentify.repository;

import com.rentify.model.Message;
import com.rentify.model.enums.MessageKind;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    Page<Message> findByBookingIdOrderByCreatedAtAsc(Long bookingId, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId OR m.receiver.id = :userId) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.booking.id = :bookingId " +
           "AND (m.sender.id = :userId OR m.receiver.id = :userId) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findBookingMessages(@Param("bookingId") Long bookingId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.readAt IS NULL")
    Long countUnreadMessages(@Param("userId") Long userId);

    boolean existsByBooking_IdAndMessageKind(Long bookingId, MessageKind messageKind);
}
