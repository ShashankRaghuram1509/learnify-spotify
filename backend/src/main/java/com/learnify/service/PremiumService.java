
package com.learnify.service;

import com.learnify.model.User;
import com.learnify.model.VideoCallSchedule;
import com.learnify.repository.UserRepository;
import com.learnify.repository.VideoCallScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PremiumService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VideoCallScheduleRepository videoCallScheduleRepository;

    public boolean processPremiumSubscription(Long userId, String cardHolder, String cardNumber, 
                                            String expiryDate, String cvv) {
        // In a real implementation, this would connect to a payment processor
        // For now, we'll just simulate a successful payment and upgrade the user
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate card info (this would be more robust in a real implementation)
        if (cardNumber.length() != 16 || cvv.length() < 3) {
            return false;
        }
        
        // Upgrade user to premium
        user.setPremium(true);
        userRepository.save(user);
        
        return true;
    }
    
    public VideoCallSchedule scheduleVideoCall(Long userId, String date, String time) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.isPremium()) {
            throw new RuntimeException("Premium subscription required for video calls");
        }
        
        VideoCallSchedule schedule = new VideoCallSchedule();
        schedule.setUser(user);
        schedule.setCallId("call_" + UUID.randomUUID().toString().substring(0, 8));
        schedule.setDate(LocalDate.parse(date));
        schedule.setTime(LocalTime.parse(time, DateTimeFormatter.ofPattern("hh:mm a")));
        schedule.setStatus("scheduled");
        
        return videoCallScheduleRepository.save(schedule);
    }
    
    public List<VideoCallSchedule> getUserScheduledCalls(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return videoCallScheduleRepository.findByUser(user);
    }
    
    public String getAIAssistantResponse(String message) {
        // In a real implementation, this would connect to an AI service like OpenAI
        // For now, we'll just return a canned response
        
        String response = "I can help answer that! Based on your courses, here's what you need to know about this topic...";
        
        if (message.toLowerCase().contains("javascript")) {
            response = "JavaScript is a programming language that is one of the core technologies of the World Wide Web. It's used to create interactive elements on web pages.";
        } else if (message.toLowerCase().contains("react")) {
            response = "React is a free and open-source front-end JavaScript library for building user interfaces based on UI components. It's maintained by Meta and a community of individual developers and companies.";
        } else if (message.toLowerCase().contains("course")) {
            response = "Your courses are progressing well. Would you like me to recommend some additional resources to supplement your learning?";
        }
        
        return response;
    }
}
