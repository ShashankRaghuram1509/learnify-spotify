
package com.learnify.controller;

import com.learnify.model.Course;
import com.learnify.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/courses")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve courses", "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            Optional<Course> courseOpt = courseService.getCourseById(id);
            
            if (courseOpt.isPresent()) {
                return ResponseEntity.ok(courseOpt.get());
            } else {
                // Log more details for debugging
                System.out.println("Course not found with ID: " + id);
                return ResponseEntity
                    .status(404)
                    .body(Map.of(
                        "error", "Course not found", 
                        "courseId", id,
                        "message", "No course exists with the provided identifier"
                    ));
            }
        } catch (Exception e) {
            // Log the exception for debugging
            System.err.println("Error retrieving course with ID: " + id);
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
            List<Course> courses = courseService.getFeaturedCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve featured courses", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/featured/premium/{premium}")
    public ResponseEntity<?> getFeaturedCoursesByPremium(@PathVariable boolean premium) {
        try {
            List<Course> courses = courseService.getFeaturedCoursesByPremium(premium);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve featured courses by premium status", "message", e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getCoursesByCategory(@PathVariable String category) {
        try {
            List<Course> courses = courseService.getCoursesByCategory(category);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve courses by category", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/free")
    public ResponseEntity<?> getFreeCourses() {
        try {
            List<Course> courses = courseService.getFreeCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(Map.of("error", "Failed to retrieve free courses", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/premium")
    public ResponseEntity<?> getPremiumCourses() {
        try {
            List<Course> courses = courseService.getPremiumCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
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
            List<Course> courses = courseService.getCoursesByCategoryAndType(category, premium);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(Map.of(
                    "error", "Failed to retrieve courses by category and type", 
                    "message", e.getMessage()
                ));
        }
    }
}
