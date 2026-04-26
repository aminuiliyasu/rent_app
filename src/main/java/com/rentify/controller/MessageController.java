package com.rentify.controller;

import com.rentify.dto.request.SendMessageRequest;
import com.rentify.dto.response.MessageResponse;
import com.rentify.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@CrossOrigin(origins = "*")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        MessageResponse message = messageService.sendMessage(request);
        return ResponseEntity.status(201).body(message);
    }
    
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<MessageResponse>> getBookingMessages(@PathVariable Long bookingId) {
        List<MessageResponse> messages = messageService.getBookingMessages(bookingId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/my")
    public ResponseEntity<Page<MessageResponse>> getMyMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> messages = messageService.getMyMessages(pageable);
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/booking/{bookingId}/read")
    public ResponseEntity<Void> markBookingMessagesAsRead(@PathVariable Long bookingId) {
        messageService.markBookingMessagesAsRead(bookingId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        Long count = messageService.getUnreadMessageCount();
        return ResponseEntity.ok(count);
    }
}
