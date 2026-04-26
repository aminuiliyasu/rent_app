package com.rentify.controller;

import com.rentify.dto.response.MessageResponse;
import com.rentify.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class MessageWebSocketController {
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/message.send")
    @SendTo("/topic/messages")
    public MessageResponse sendMessage(@Payload Map<String, Object> payload) {
        try {
            Long bookingId = Long.valueOf(payload.get("bookingId").toString());
            String content = payload.get("content").toString();
            
            com.rentify.dto.request.SendMessageRequest request = 
                new com.rentify.dto.request.SendMessageRequest();
            request.setBookingId(bookingId);
            request.setContent(content);
            
            MessageResponse message = messageService.sendMessage(request);
            
            // Send to specific booking room
            messagingTemplate.convertAndSend("/topic/booking/" + bookingId, message);
            
            return message;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
