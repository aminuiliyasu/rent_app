package com.rentify.service;

import com.rentify.dto.request.InitiateCallRequest;
import com.rentify.dto.response.CallResponse;
import com.rentify.dto.response.UserResponse;
import com.rentify.model.Booking;
import com.rentify.model.Call;
import com.rentify.model.User;
import com.rentify.model.enums.CallStatus;
import com.rentify.model.enums.CallType;
import com.rentify.repository.BookingRepository;
import com.rentify.repository.CallRepository;
import com.rentify.repository.UserRepository;
import com.rentify.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CallService {
    
    @Autowired
    private CallRepository callRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public CallResponse initiateCall(InitiateCallRequest request) {
        Long callerId = CurrentUser.getCurrentUserId();
        
        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new RuntimeException("Caller not found"));
        
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        // Check if there's an active call
        List<Call> activeCalls = callRepository.findActiveCallsByUser(callerId, CallStatus.RINGING);
        activeCalls.addAll(callRepository.findActiveCallsByUser(callerId, CallStatus.ANSWERED));
        if (!activeCalls.isEmpty()) {
            throw new RuntimeException("You already have an active call");
        }
        
        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElse(null);
        }
        
        Call call = new Call();
        call.setCaller(caller);
        call.setReceiver(receiver);
        call.setBooking(booking);
        call.setType(request.getType());
        call.setStatus(CallStatus.INITIATED);
        call.setCallId(UUID.randomUUID().toString());
        
        call = callRepository.save(call);
        
        // Update status to RINGING
        call.setStatus(CallStatus.RINGING);
        call = callRepository.save(call);
        
        // Send WebSocket notification to receiver
        CallResponse callResponse = mapToResponse(call);
        messagingTemplate.convertAndSendToUser(
            receiver.getId().toString(),
            "/queue/call",
            callResponse
        );
        
        return callResponse;
    }
    
    @Transactional
    public CallResponse answerCall(String callId) {
        Long userId = CurrentUser.getCurrentUserId();
        
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You are not the receiver of this call");
        }
        
        if (call.getStatus() != CallStatus.RINGING) {
            throw new RuntimeException("Call is not in ringing state");
        }
        
        call.setStatus(CallStatus.ANSWERED);
        call.setStartedAt(LocalDateTime.now());
        call = callRepository.save(call);
        
        // Notify caller
        CallResponse callResponse = mapToResponse(call);
        messagingTemplate.convertAndSendToUser(
            call.getCaller().getId().toString(),
            "/queue/call",
            callResponse
        );
        
        return callResponse;
    }
    
    @Transactional
    public CallResponse rejectCall(String callId) {
        Long userId = CurrentUser.getCurrentUserId();
        
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You are not the receiver of this call");
        }
        
        call.setStatus(CallStatus.REJECTED);
        call.setEndedAt(LocalDateTime.now());
        call = callRepository.save(call);
        
        // Notify caller
        CallResponse callResponse = mapToResponse(call);
        messagingTemplate.convertAndSendToUser(
            call.getCaller().getId().toString(),
            "/queue/call",
            callResponse
        );
        
        return callResponse;
    }
    
    @Transactional
    public CallResponse endCall(String callId) {
        Long userId = CurrentUser.getCurrentUserId();
        
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getCaller().getId().equals(userId) && !call.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You are not part of this call");
        }
        
        call.setStatus(CallStatus.ENDED);
        call.setEndedAt(LocalDateTime.now());
        
        if (call.getStartedAt() != null) {
            long duration = java.time.Duration.between(call.getStartedAt(), call.getEndedAt()).getSeconds();
            call.setDurationSeconds(duration);
        }
        
        call = callRepository.save(call);
        
        // Notify the other party
        CallResponse callResponse = mapToResponse(call);
        Long otherUserId = call.getCaller().getId().equals(userId) 
            ? call.getReceiver().getId() 
            : call.getCaller().getId();
        
        messagingTemplate.convertAndSendToUser(
            otherUserId.toString(),
            "/queue/call",
            callResponse
        );
        
        return callResponse;
    }
    
    @Transactional
    public CallResponse cancelCall(String callId) {
        Long userId = CurrentUser.getCurrentUserId();
        
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getCaller().getId().equals(userId)) {
            throw new RuntimeException("Only the caller can cancel the call");
        }
        
        call.setStatus(CallStatus.CANCELLED);
        call.setEndedAt(LocalDateTime.now());
        call = callRepository.save(call);
        
        // Notify receiver
        CallResponse callResponse = mapToResponse(call);
        messagingTemplate.convertAndSendToUser(
            call.getReceiver().getId().toString(),
            "/queue/call",
            callResponse
        );
        
        return callResponse;
    }
    
    private CallResponse mapToResponse(Call call) {
        CallResponse response = new CallResponse();
        response.setId(call.getId());
        response.setCallId(call.getCallId());
        response.setCallerId(call.getCaller().getId());
        response.setReceiverId(call.getReceiver().getId());
        response.setBookingId(call.getBooking() != null ? call.getBooking().getId() : null);
        response.setType(call.getType());
        response.setStatus(call.getStatus());
        response.setStartedAt(call.getStartedAt());
        response.setEndedAt(call.getEndedAt());
        response.setDurationSeconds(call.getDurationSeconds());
        response.setCreatedAt(call.getCreatedAt());
        
        // Map caller
        UserResponse caller = new UserResponse(
            call.getCaller().getId(),
            call.getCaller().getName(),
            call.getCaller().getEmail(),
            call.getCaller().getPhone(),
            call.getCaller().getRole(),
            call.getCaller().getKycStatus(),
            call.getCaller().getAvatarUrl(),
            call.getCaller().getEmailVerified(),
            call.getCaller().getPhoneVerified()
        );
        response.setCaller(caller);
        
        // Map receiver
        UserResponse receiver = new UserResponse(
            call.getReceiver().getId(),
            call.getReceiver().getName(),
            call.getReceiver().getEmail(),
            call.getReceiver().getPhone(),
            call.getReceiver().getRole(),
            call.getReceiver().getKycStatus(),
            call.getReceiver().getAvatarUrl(),
            call.getReceiver().getEmailVerified(),
            call.getReceiver().getPhoneVerified()
        );
        response.setReceiver(receiver);
        
        return response;
    }
}
