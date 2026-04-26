package com.rentify.model;

import com.rentify.model.enums.CallStatus;
import com.rentify.model.enums.CallType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "calls", indexes = {
    @Index(name = "idx_calls_caller_id", columnList = "caller_id"),
    @Index(name = "idx_calls_receiver_id", columnList = "receiver_id"),
    @Index(name = "idx_calls_booking_id", columnList = "booking_id"),
    @Index(name = "idx_calls_status", columnList = "status"),
    @Index(name = "idx_calls_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Call extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caller_id", nullable = false)
    private User caller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CallType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CallStatus status;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @Column(name = "duration_seconds")
    private Long durationSeconds;
    
    @Column(name = "call_id", unique = true, nullable = false)
    private String callId; // Unique identifier for WebRTC session
}
