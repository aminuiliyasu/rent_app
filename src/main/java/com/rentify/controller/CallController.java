package com.rentify.controller;

import com.rentify.dto.request.InitiateCallRequest;
import com.rentify.dto.response.CallResponse;
import com.rentify.service.CallService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/calls")
@CrossOrigin(origins = "*")
public class CallController {
    
    @Autowired
    private CallService callService;
    
    @PostMapping("/initiate")
    public ResponseEntity<CallResponse> initiateCall(@Valid @RequestBody InitiateCallRequest request) {
        CallResponse call = callService.initiateCall(request);
        return ResponseEntity.ok(call);
    }
    
    @PostMapping("/{callId}/answer")
    public ResponseEntity<CallResponse> answerCall(@PathVariable String callId) {
        CallResponse call = callService.answerCall(callId);
        return ResponseEntity.ok(call);
    }
    
    @PostMapping("/{callId}/reject")
    public ResponseEntity<CallResponse> rejectCall(@PathVariable String callId) {
        CallResponse call = callService.rejectCall(callId);
        return ResponseEntity.ok(call);
    }
    
    @PostMapping("/{callId}/end")
    public ResponseEntity<CallResponse> endCall(@PathVariable String callId) {
        CallResponse call = callService.endCall(callId);
        return ResponseEntity.ok(call);
    }
    
    @PostMapping("/{callId}/cancel")
    public ResponseEntity<CallResponse> cancelCall(@PathVariable String callId) {
        CallResponse call = callService.cancelCall(callId);
        return ResponseEntity.ok(call);
    }
}
