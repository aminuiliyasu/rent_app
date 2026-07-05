package com.rentify.service;

import com.rentify.dto.response.NotificationResponse;
import com.rentify.model.Booking;
import com.rentify.model.Message;
import com.rentify.model.Notification;
import com.rentify.model.User;
import com.rentify.model.enums.MessageKind;
import com.rentify.model.enums.NotificationType;
import com.rentify.repository.NotificationRepository;
import com.rentify.util.CurrentUser;
import com.rentify.util.UtcDateTimes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static com.rentify.exception.BusinessException.notFound;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> listForCurrentUser(Pageable pageable) {
        Long userId = CurrentUser.getCurrentUserId();
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCountForCurrentUser() {
        return notificationRepository.countByUser_IdAndReadAtIsNull(CurrentUser.getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public NotificationResponse latestUnreadForCurrentUser() {
        return notificationRepository
                .findFirstByUser_IdAndReadAtIsNullOrderByCreatedAtDesc(CurrentUser.getCurrentUserId())
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public NotificationResponse markRead(Long notificationId) {
        Long userId = CurrentUser.getCurrentUserId();
        Notification notification = notificationRepository.findByIdAndUser_Id(notificationId, userId)
                .orElseThrow(() -> notFound("Notification not found"));
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    @Transactional
    public void markAllReadForCurrentUser() {
        notificationRepository.markAllReadForUser(CurrentUser.getCurrentUserId(), LocalDateTime.now());
    }

    @Transactional
    public void notifyNewBooking(Booking booking) {
        User owner = booking.getListing().getOwner();
        User renter = booking.getRenter();
        String listingTitle = safeListingTitle(booking);
        create(
                owner,
                NotificationType.NEW_BOOKING,
                "New booking request",
                renter.getName() + " requested to book \"" + listingTitle + "\".",
                "/bookings/" + booking.getId(),
                renter.getName(),
                booking.getId(),
                null
        );
    }

    @Transactional
    public void notifyBookingConfirmed(Booking booking) {
        User renter = booking.getRenter();
        User owner = booking.getListing().getOwner();
        String listingTitle = safeListingTitle(booking);
        create(
                renter,
                NotificationType.BOOKING_CONFIRMED,
                "Booking confirmed",
                owner.getName() + " confirmed your booking for \"" + listingTitle + "\".",
                "/bookings/" + booking.getId(),
                owner.getName(),
                booking.getId(),
                null
        );
    }

    @Transactional
    public void notifyBookingCancelled(Booking booking, Long cancelledByUserId) {
        User renter = booking.getRenter();
        User owner = booking.getListing().getOwner();
        User recipient = renter.getId().equals(cancelledByUserId) ? owner : renter;
        User actor = renter.getId().equals(cancelledByUserId) ? renter : owner;
        String listingTitle = safeListingTitle(booking);
        create(
                recipient,
                NotificationType.BOOKING_CANCELLED,
                "Booking cancelled",
                actor.getName() + " cancelled the booking for \"" + listingTitle + "\".",
                "/bookings/" + booking.getId(),
                actor.getName(),
                booking.getId(),
                null
        );
    }

    @Transactional
    public void notifyRentRequestReply(Booking booking) {
        User renter = booking.getRenter();
        User host = booking.getListing().getOwner();
        String listingTitle = safeListingTitle(booking);
        String requestTitle = booking.getRentWishPost() != null
                ? booking.getRentWishPost().getTitle()
                : "your request";
        create(
                renter,
                NotificationType.RENT_REQUEST_REPLY,
                "Reply to your request",
                host.getName() + " replied to \"" + requestTitle + "\" with \"" + listingTitle + "\".",
                "/messages?booking=" + booking.getId(),
                host.getName(),
                booking.getId(),
                null
        );
    }

    @Transactional
    public void notifyNewMessage(Message message) {
        if (message.getMessageKind() == MessageKind.LIVE_REQUEST_REPLY) {
            return;
        }
        User receiver = message.getReceiver();
        User sender = message.getSender();
        String preview = truncate(message.getContent(), 120);
        create(
                receiver,
                NotificationType.NEW_MESSAGE,
                "New message",
                sender.getName() + ": " + preview,
                "/messages?booking=" + message.getBooking().getId(),
                sender.getName(),
                message.getBooking().getId(),
                message.getId()
        );
    }

    private void create(
            User recipient,
            NotificationType type,
            String title,
            String body,
            String linkPath,
            String actorName,
            Long bookingId,
            Long messageId
    ) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setLinkPath(linkPath);
        notification.setActorName(actorName);
        notification.setBookingId(bookingId);
        notification.setMessageId(messageId);
        notification = notificationRepository.save(notification);

        pushRealtime(recipient.getId(), toResponse(notification));
    }

    private void pushRealtime(Long userId, NotificationResponse payload) {
        if (messagingTemplate == null) {
            return;
        }
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                payload
        );
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .body(notification.getBody())
                .linkPath(notification.getLinkPath())
                .actorName(notification.getActorName())
                .bookingId(notification.getBookingId())
                .messageId(notification.getMessageId())
                .read(notification.getReadAt() != null)
                .createdAt(UtcDateTimes.toInstantString(notification.getCreatedAt()))
                .build();
    }

    private static String safeListingTitle(Booking booking) {
        if (booking.getListing() == null || booking.getListing().getTitle() == null) {
            return "a listing";
        }
        String title = booking.getListing().getTitle().trim();
        return title.isEmpty() ? "a listing" : title;
    }

    private static String truncate(String raw, int max) {
        if (raw == null) {
            return "";
        }
        String trimmed = raw.trim().replaceAll("\\s+", " ");
        if (trimmed.length() <= max) {
            return trimmed;
        }
        return trimmed.substring(0, max - 1) + "…";
    }
}
