package com.rentify.service;

import com.rentify.dto.request.SendMessageRequest;
import com.rentify.dto.response.MessageResponse;
import com.rentify.model.Booking;
import com.rentify.model.Message;
import com.rentify.model.User;
import com.rentify.model.enums.MessageKind;
import com.rentify.repository.BookingRepository;
import com.rentify.repository.MessageRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rentify.util.CurrentUser;
import com.rentify.util.UtcDateTimes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        Long userId = CurrentUser.getCurrentUserId();
        
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify user is part of this booking
        if (!booking.getRenter().getId().equals(userId) && 
            !booking.getListing().getOwner().getId().equals(userId)) {
            throw new RuntimeException("You are not part of this booking");
        }
        
        // Determine receiver
        User receiver = booking.getRenter().getId().equals(userId) 
            ? booking.getListing().getOwner() 
            : booking.getRenter();
        
        Message message = new Message();
        message.setBooking(booking);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setAttachmentUrl(request.getAttachmentUrl());
        message.setMessageKind(MessageKind.STANDARD);
        message.setCreatedAt(UtcDateTimes.nowUtc());

        message = messageRepository.save(message);
        
        return mapToResponse(message);
    }

    @Transactional
    public MessageResponse createLiveRequestOpeningMessage(Booking booking) {
        Message message = new Message();
        message.setBooking(booking);
        message.setSender(booking.getRenter());
        message.setReceiver(booking.getListing().getOwner());
        message.setContent("request posted");
        message.setMessageKind(MessageKind.LIVE_REQUEST_REPLY);
        message.setCreatedAt(UtcDateTimes.nowUtc());
        message = messageRepository.save(message);
        return mapToResponse(message);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getBookingMessages(Long bookingId) {
        Long userId = CurrentUser.getCurrentUserId();
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify user is part of this booking
        if (!booking.getRenter().getId().equals(userId) && 
            !booking.getListing().getOwner().getId().equals(userId)) {
            throw new RuntimeException("You are not part of this booking");
        }
        
        List<Message> messages = messageRepository.findBookingMessages(bookingId, userId);
        return messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMyMessages(Pageable pageable) {
        Long userId = CurrentUser.getCurrentUserId();
        return messageRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }
    
    @Transactional
    public void markAsRead(Long messageId) {
        Long userId = CurrentUser.getCurrentUserId();
        
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (!message.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You can only mark your own received messages as read");
        }
        
        if (message.getReadAt() == null) {
            message.setReadAt(UtcDateTimes.nowUtc());
            messageRepository.save(message);
        }
    }
    
    @Transactional
    public void markBookingMessagesAsRead(Long bookingId) {
        Long userId = CurrentUser.getCurrentUserId();
        
        // Verify booking exists and user has access
        bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        List<Message> unreadMessages = messageRepository.findBookingMessages(bookingId, userId)
                .stream()
                .filter(m -> m.getReceiver().getId().equals(userId) && m.getReadAt() == null)
                .collect(Collectors.toList());
        
        LocalDateTime now = UtcDateTimes.nowUtc();
        unreadMessages.forEach(m -> m.setReadAt(now));
        if (!unreadMessages.isEmpty()) {
            messageRepository.saveAll(unreadMessages);
        }
    }
    
    @Transactional(readOnly = true)
    public Long getUnreadMessageCount() {
        Long userId = CurrentUser.getCurrentUserId();
        return messageRepository.countUnreadMessages(userId);
    }
    
    private MessageResponse mapToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setBookingId(message.getBooking() != null ? message.getBooking().getId() : null);
        response.setSenderId(message.getSender().getId());
        response.setReceiverId(message.getReceiver().getId());
        response.setContent(message.getContent());
        response.setAttachmentUrl(message.getAttachmentUrl());
        response.setReadAt(UtcDateTimes.toInstantString(message.getReadAt()));
        response.setCreatedAt(UtcDateTimes.toInstantString(message.getCreatedAt()));
        response.setMessageKind(
                message.getMessageKind() != null ? message.getMessageKind().name() : MessageKind.STANDARD.name());

        // Map sender
        com.rentify.dto.response.UserResponse sender = new com.rentify.dto.response.UserResponse(
            message.getSender().getId(),
            message.getSender().getName(),
            message.getSender().getEmail(),
            message.getSender().getPhone(),
            message.getSender().getRole(),
            message.getSender().getKycStatus(),
            message.getSender().getAvatarUrl(),
            message.getSender().getEmailVerified(),
            message.getSender().getPhoneVerified()
        );
        response.setSender(sender);
        
        // Map receiver
        com.rentify.dto.response.UserResponse receiver = new com.rentify.dto.response.UserResponse(
            message.getReceiver().getId(),
            message.getReceiver().getName(),
            message.getReceiver().getEmail(),
            message.getReceiver().getPhone(),
            message.getReceiver().getRole(),
            message.getReceiver().getKycStatus(),
            message.getReceiver().getAvatarUrl(),
            message.getReceiver().getEmailVerified(),
            message.getReceiver().getPhoneVerified()
        );
        response.setReceiver(receiver);
        
        return response;
    }
}
