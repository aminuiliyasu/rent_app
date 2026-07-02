package com.rentify.model;

import com.rentify.model.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user_read", columnList = "user_id, read_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NotificationType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String body;

    /** Frontend route, e.g. /bookings/12 or /messages?booking=12 */
    @Column(name = "link_path", length = 255)
    private String linkPath;

    @Column(name = "actor_name", length = 120)
    private String actorName;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "message_id")
    private Long messageId;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}
