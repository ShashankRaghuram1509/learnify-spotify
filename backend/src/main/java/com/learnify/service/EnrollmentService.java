
package com.learnify.service;

import com.learnify.model.Course;
import com.learnify.model.Enrollment;
import com.learnify.model.User;
import com.learnify.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class EnrollmentService {
    private static final Logger logger = Logger.getLogger(EnrollmentService.class.getName());
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    public List<Enrollment> getEnrollmentsByUser(User user) {
        return enrollmentRepository.findByUser(user);
    }
    
    public Optional<Enrollment> getEnrollmentByUserAndCourse(User user, Course course) {
        return enrollmentRepository.findByUserAndCourse(user, course);
    }
    
    public Enrollment createEnrollment(User user, Course course) {
        logger.info("Creating enrollment for user: " + user.getEmail() + " in course: " + course.getTitle());
        
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setProgress(0.0);
        
        return enrollmentRepository.save(enrollment);
    }
    
    public Enrollment updateEnrollmentProgress(Long enrollmentId, double progress) {
        Optional<Enrollment> enrollmentOptional = enrollmentRepository.findById(enrollmentId);
        if (enrollmentOptional.isEmpty()) {
            throw new RuntimeException("Enrollment not found");
        }
        
        Enrollment enrollment = enrollmentOptional.get();
        enrollment.setProgress(progress);
        
        return enrollmentRepository.save(enrollment);
    }
}
