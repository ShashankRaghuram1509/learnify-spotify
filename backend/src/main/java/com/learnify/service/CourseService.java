
package com.learnify.service;

import com.learnify.model.Course;
import com.learnify.model.Module;
import com.learnify.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        try {
            return courseRepository.findAll();
        } catch (Exception e) {
            // Fallback to limited query if there's a database issue
            return courseRepository.findAllCoursesWithLimit();
        }
    }
    
    public List<Course> getFreeCourses() {
        return courseRepository.findByPremium(false);
    }
    
    public List<Course> getPremiumCourses() {
        return courseRepository.findByPremium(true);
    }

    public Optional<Course> getCourseById(String courseId) {
        // First try to get by ID directly
        Optional<Course> course = courseRepository.findByCourseId(courseId);
        
        if (course.isPresent()) {
            return course;
        }
        
        try {
            // Try parsing the ID as a long and fetch by database ID
            Long id = Long.parseLong(courseId);
            return courseRepository.findById(id);
        } catch (NumberFormatException e) {
            // If not a number, try the exact match query
            return courseRepository.findByCourseIdExact(courseId);
        }
    }

    public List<Course> getFeaturedCourses() {
        return courseRepository.findByFeatured(true);
    }
    
    public List<Course> getFeaturedCoursesByPremium(boolean premium) {
        return courseRepository.findFeaturedByPremium(premium);
    }

    public List<Course> getCoursesByCategory(String category) {
        try {
            return courseRepository.findByCategoryIgnoreCase(category);
        } catch (Exception e) {
            // Fallback to the regular method if there's an issue
            return courseRepository.findByCategory(category);
        }
    }
    
    public List<Course> getCoursesByCategoryAndType(String category, boolean premium) {
        try {
            return courseRepository.findByCategoryIgnoreCaseAndPremium(category, premium);
        } catch (Exception e) {
            // Fallback to the regular method if there's an issue
            return courseRepository.findByCategoryAndPremium(category, premium);
        }
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public Module addModuleToCourse(String courseId, Module module) {
        Course course = courseRepository.findByCourseId(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        module.setCourse(course);
        course.getModules().add(module);
        courseRepository.save(course);
        
        return module;
    }
}
