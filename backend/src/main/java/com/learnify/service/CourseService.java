
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
        Optional<Course> course = courseRepository.findByCourseId(courseId);
        if (course.isPresent()) {
            return course;
        }
        // Try the alternative method with native query if the first attempt fails
        return courseRepository.findByCourseIdExact(courseId);
    }

    public List<Course> getFeaturedCourses() {
        return courseRepository.findByFeatured(true);
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category);
    }
    
    public List<Course> getCoursesByCategoryAndType(String category, boolean premium) {
        return courseRepository.findByCategoryAndPremium(category, premium);
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
