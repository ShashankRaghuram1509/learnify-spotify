
package com.learnify.repository;

import com.learnify.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
