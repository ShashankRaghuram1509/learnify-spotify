
package com.learnify.controller;

import com.learnify.model.Course;
import com.learnify.model.Enrollment;
import com.learnify.model.User;
import com.learnify.repository.CourseRepository;
import com.learnify.repository.EnrollmentRepository;
import com.learnify.repository.UserRepository;
import com.learnify.service.CourseService;
import com.learnify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
    private static final Logger logger = Logger.getLogger(EnrollmentController.class.getName());
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CourseService courseService;
    
    @GetMapping("/user")
    public ResponseEntity<?> getUserEnrollments() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            
            User user = userOptional.get();
            List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
            
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            logger.severe("Error getting user enrollments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving enrollments");
        }
    }
    
    @PostMapping("/{courseId}")
    public ResponseEntity<?> enrollInCourse(@PathVariable String courseId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            
            User user = userOptional.get();
            Optional<Course> courseOptional = courseService.getCourseById(courseId);
            
            if (courseOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
            }
            
            Course course = courseOptional.get();
            
            // Check if premium course and user not premium
            if (course.isPremium() && !user.isPremium()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "This is a premium course. Please upgrade to premium to enroll.");
                response.put("requiresPremium", true);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            // Check if already enrolled
            Optional<Enrollment> existingEnrollment = enrollmentRepository.findByUserAndCourse(user, course);
            if (existingEnrollment.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You are already enrolled in this course");
                response.put("enrollment", existingEnrollment.get());
                return ResponseEntity.ok(response);
            }
            
            // Create new enrollment
            Enrollment enrollment = new Enrollment();
            enrollment.setUser(user);
            enrollment.setCourse(course);
            enrollment.setEnrollmentDate(LocalDateTime.now());
            enrollment.setProgress(0.0);
            
            Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully enrolled in course");
            response.put("enrollment", savedEnrollment);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.severe("Error enrolling in course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error enrolling in course");
        }
    }
    
    @GetMapping("/check/{courseId}")
    public ResponseEntity<?> checkEnrollment(@PathVariable String courseId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            if (email.equals("anonymousUser")) {
                return ResponseEntity.ok(Map.of("enrolled", false, "requiresAuth", true));
            }
            
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.ok(Map.of("enrolled", false, "requiresAuth", true));
            }
            
            User user = userOptional.get();
            Optional<Course> courseOptional = courseService.getCourseById(courseId);
            
            if (courseOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
            }
            
            Course course = courseOptional.get();
            
            Optional<Enrollment> existingEnrollment = enrollmentRepository.findByUserAndCourse(user, course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("enrolled", existingEnrollment.isPresent());
            response.put("requiresPremium", course.isPremium() && !user.isPremium());
            
            if (existingEnrollment.isPresent()) {
                response.put("enrollment", existingEnrollment.get());
                response.put("progress", existingEnrollment.get().getProgress());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error checking enrollment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error checking enrollment status");
        }
    }
}
