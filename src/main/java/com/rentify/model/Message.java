package com.rentify.model;

import com.rentify.model.enums.MessageKind;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_messages_booking_id", columnList = "booking_id"),
    @Index(name = "idx_messages_sender_id", columnList = "sender_id"),
    @Index(name = "idx_messages_receiver_id", columnList = "receiver_id"),
    @Index(name = "idx_messages_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Message extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_kind", nullable = false, length = 32)
    @ColumnDefault("'STANDARD'")
    private MessageKind messageKind = MessageKind.STANDARD;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;
    
    @Column(name = "read_at")
    private java.time.LocalDateTime readAt;
}
