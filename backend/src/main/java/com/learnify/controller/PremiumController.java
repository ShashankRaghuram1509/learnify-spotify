
package com.learnify.controller;

import com.learnify.model.User;
import com.learnify.model.VideoCallSchedule;
import com.learnify.service.PremiumService;
import com.learnify.service.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/premium")
public class PremiumController {
    @Autowired
    private PremiumService premiumService;
    
    @Autowired
    private UserService userService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody SubscriptionRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean success = premiumService.processPremiumSubscription(
                user.getId(),
                request.getCardHolder(),
                request.getCardNumber(),
                request.getExpiryDate(),
                request.getCvv()
        );
        
        if (success) {
            Map<String, Object> response = new HashMap<>();
            response.put("subscriptionId", "sub_" + System.currentTimeMillis());
            response.put("status", "active");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Subscription failed");
        }
    }
    
    @PostMapping("/ai-assistant")
    public ResponseEntity<?> aiAssistant(@RequestBody AIRequest request) {
        String response = premiumService.getAIAssistantResponse(request.getMessage());
        
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("message", response);
        responseMap.put("confidence", 0.95);
        
        return ResponseEntity.ok(responseMap);
    }
    
    @PostMapping("/schedule-call")
    public ResponseEntity<?> scheduleCall(@RequestBody ScheduleRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        VideoCallSchedule schedule = premiumService.scheduleVideoCall(
                user.getId(),
                request.getDate(),
                request.getTime()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("callId", schedule.getCallId());
        response.put("date", schedule.getDate().toString());
        response.put("time", schedule.getTime().toString());
        response.put("status", schedule.getStatus());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/scheduled-calls")
    public ResponseEntity<List<VideoCallSchedule>> getScheduledCalls() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(premiumService.getUserScheduledCalls(user.getId()));
    }
    
    @Data
    public static class SubscriptionRequest {
        private String cardHolder;
        private String cardNumber;
        private String expiryDate;
        private String cvv;
    }
    
    @Data
    public static class AIRequest {
        private String message;
    }
    
    @Data
    public static class ScheduleRequest {
        private String date;
        private String time;
    }
}
