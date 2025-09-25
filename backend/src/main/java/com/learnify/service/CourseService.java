
package com.learnify.service;

import com.learnify.model.Course;
import com.learnify.model.Module;
import com.learnify.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class CourseService {
    private static final Logger logger = Logger.getLogger(CourseService.class.getName());
    
    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        try {
            logger.info("Fetching all courses");
            return courseRepository.findAll();
        } catch (Exception e) {
            logger.warning("Error fetching all courses: " + e.getMessage());
            // Fallback to limited query if there's a database issue
            return courseRepository.findAllCoursesWithLimit();
        }
    }
    
    public List<Course> getFreeCourses() {
        logger.info("Fetching free courses");
        return courseRepository.findByPremium(false);
    }
    
    public List<Course> getPremiumCourses() {
        logger.info("Fetching premium courses");
        return courseRepository.findByPremium(true);
    }

    public Optional<Course> getCourseById(String courseId) {
        logger.info("Searching for course with ID: " + courseId);
        return courseRepository.findByCourseId(courseId);
    }

    public List<Course> getFeaturedCourses() {
        logger.info("Fetching featured courses");
        return courseRepository.findByFeatured(true);
    }
    
    public List<Course> getFeaturedCoursesByPremium(boolean premium) {
        logger.info("Fetching featured courses by premium status: " + premium);
        return courseRepository.findFeaturedByPremium(premium);
    }

    public List<Course> getCoursesByCategory(String category) {
        logger.info("Fetching courses by category: " + category);
        try {
            return courseRepository.findByCategoryIgnoreCase(category);
        } catch (Exception e) {
            logger.warning("Error in category search: " + e.getMessage());
            // Fallback to the regular method if there's an issue
            return courseRepository.findByCategory(category);
        }
    }
    
    public List<Course> getCoursesByCategoryAndType(String category, boolean premium) {
        logger.info("Fetching courses by category: " + category + " and premium: " + premium);
        try {
            return courseRepository.findByCategoryIgnoreCaseAndPremium(category, premium);
        } catch (Exception e) {
            logger.warning("Error in category and premium search: " + e.getMessage());
            // Fallback to the regular method if there's an issue
            return courseRepository.findByCategoryAndPremium(category, premium);
        }
    }

    public Course createCourse(Course course) {
        logger.info("Creating new course: " + course.getTitle());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        logger.info("Deleting course with ID: " + id);
        courseRepository.deleteById(id);
    }

    public Module addModuleToCourse(String courseId, Module module) {
        logger.info("Adding module to course: " + courseId);
        Course course = courseRepository.findByCourseId(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        module.setCourse(course);
        course.getModules().add(module);
        courseRepository.save(course);
        
        return module;
    }
}
