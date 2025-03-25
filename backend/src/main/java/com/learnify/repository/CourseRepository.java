
package com.learnify.repository;

import com.learnify.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseId(String courseId);
    List<Course> findByFeatured(boolean featured);
    List<Course> findByCategory(String category);
    List<Course> findByPremium(boolean premium);
    List<Course> findByCategoryAndPremium(String category, boolean premium);
    
    // Add a native query to ensure correct case sensitivity for the courseId
    @Query(value = "SELECT * FROM course WHERE course_id = ?1", nativeQuery = true)
    Optional<Course> findByCourseIdExact(String courseId);
    
    // Find featured courses by premium status
    @Query(value = "SELECT * FROM course WHERE featured = true AND premium = ?1", nativeQuery = true)
    List<Course> findFeaturedByPremium(boolean premium);
    
    // Find all courses with limit for better performance
    @Query(value = "SELECT * FROM course LIMIT 50", nativeQuery = true)
    List<Course> findAllCoursesWithLimit();
    
    // Find courses by category with case insensitive matching
    @Query(value = "SELECT * FROM course WHERE LOWER(category) = LOWER(?1)", nativeQuery = true)
    List<Course> findByCategoryIgnoreCase(String category);
    
    // Find courses by category and premium status with case insensitive matching
    @Query(value = "SELECT * FROM course WHERE LOWER(category) = LOWER(?1) AND premium = ?2", nativeQuery = true)
    List<Course> findByCategoryIgnoreCaseAndPremium(String category, boolean premium);
}
