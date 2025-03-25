
package com.learnify.controller;

import com.learnify.model.Course;
import com.learnify.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private static final Logger logger = Logger.getLogger(CourseController.class.getName());
    
    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        try {
            logger.info("GET request received for all courses");
            List<Course> courses = courseService.getAllCourses();
            logger.info("Returning " + courses.size() + " courses");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error retrieving all courses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve courses", "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            logger.info("GET request received for course with ID: " + id);
            Optional<Course> courseOpt = courseService.getCourseById(id);
            
            if (courseOpt.isPresent()) {
                logger.info("Returning course: " + courseOpt.get().getTitle());
                return ResponseEntity.ok(courseOpt.get());
            } else {
                logger.warning("Course not found with ID: " + id);
                return ResponseEntity
                    .status(404)
                    .body(Map.of(
                        "error", "Course not found", 
                        "courseId", id,
                        "message", "No course exists with the provided identifier"
                    ));
            }
        } catch (Exception e) {
            logger.severe("Error retrieving course with ID: " + id + ": " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity
                .status(500)
                .body(Map.of(
                    "error", "Failed to retrieve course", 
                    "message", e.getMessage(),
                    "courseId", id
                ));
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedCourses() {
        try {
            logger.info("GET request received for featured courses");
            List<Course> courses = courseService.getFeaturedCourses();
            logger.info("Returning " + courses.size() + " featured courses");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error retrieving featured courses: " + e.getMessage());
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve featured courses", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/featured/premium/{premium}")
    public ResponseEntity<?> getFeaturedCoursesByPremium(@PathVariable boolean premium) {
        try {
            logger.info("GET request received for featured courses with premium status: " + premium);
            List<Course> courses = courseService.getFeaturedCoursesByPremium(premium);
            logger.info("Returning " + courses.size() + " featured " + (premium ? "premium" : "free") + " courses");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error retrieving featured courses by premium status: " + e.getMessage());
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve featured courses by premium status", "message", e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getCoursesByCategory(@PathVariable String category) {
        try {
            logger.info("GET request received for courses in category: " + category);
            List<Course> courses = courseService.getCoursesByCategory(category);
            logger.info("Returning " + courses.size() + " courses in category: " + category);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error retrieving courses by category: " + e.getMessage());
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve courses by category", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/free")
    public ResponseEntity<?> getFreeCourses() {
        try {
            logger.info("GET request received for free courses");
            List<Course> courses = courseService.getFreeCourses();
            logger.info("Returning " + courses.size() + " free courses");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error retrieving free courses: " + e.getMessage());
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve free courses", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/premium")
    public ResponseEntity<?> getPremiumCourses() {
        try {
            logger.info("GET request received for premium courses");
            List<Course> courses = courseService.getPremiumCourses();
            logger.info("Returning " + courses.size() + " premium courses");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error retrieving premium courses: " + e.getMessage());
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve premium courses", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/category/{category}/type/{premium}")
    public ResponseEntity<?> getCoursesByCategoryAndType(
        @PathVariable String category,
        @PathVariable boolean premium
    ) {
        try {
            logger.info("GET request received for courses in category: " + category + " with premium status: " + premium);
            List<Course> courses = courseService.getCoursesByCategoryAndType(category, premium);
            logger.info("Returning " + courses.size() + " courses in category: " + category + " with premium status: " + premium);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error retrieving courses by category and type: " + e.getMessage());
            return ResponseEntity
                .status(500)
                .body(Map.of(
                    "error", "Failed to retrieve courses by category and type", 
                    "message", e.getMessage()
                ));
        }
    }
}
