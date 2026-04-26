package com.rentify.websocket;

import com.rentify.util.CurrentUser;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebRTCSignalingHandler {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public WebRTCSignalingHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    @MessageMapping("/call/offer")
    public void handleOffer(@Payload Map<String, Object> payload) {
        try {
            Long senderId = CurrentUser.getCurrentUserId();
            String callId = (String) payload.get("callId");
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            
            payload.put("senderId", senderId);
            messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/webrtc",
                payload
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @MessageMapping("/call/answer")
    public void handleAnswer(@Payload Map<String, Object> payload) {
        try {
            Long senderId = CurrentUser.getCurrentUserId();
            String callId = (String) payload.get("callId");
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            
            payload.put("senderId", senderId);
            messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/webrtc",
                payload
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @MessageMapping("/call/ice-candidate")
    public void handleIceCandidate(@Payload Map<String, Object> payload) {
        try {
            Long senderId = CurrentUser.getCurrentUserId();
            String callId = (String) payload.get("callId");
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            
            payload.put("senderId", senderId);
            messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/webrtc",
                payload
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
