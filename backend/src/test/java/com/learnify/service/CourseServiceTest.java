package com.learnify.service;

import com.learnify.model.Course;
import com.learnify.repository.CourseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private CourseService courseService;

    @Test
    public void whenGetCourseById_withAmbiguousNumericId_thenReturnsCorrectCourse() {
        // Arrange
        Course courseWithNumericCourseId = new Course();
        courseWithNumericCourseId.setId(2L);
        courseWithNumericCourseId.setCourseId("1");
        courseWithNumericCourseId.setTitle("Course with numeric courseId");

        Course courseWithMatchingId = new Course();
        courseWithMatchingId.setId(1L);
        courseWithMatchingId.setCourseId("abc");
        courseWithMatchingId.setTitle("Course with matching id");

        when(courseRepository.findByCourseId("1")).thenReturn(Optional.of(courseWithNumericCourseId));

        // Act
        Optional<Course> result = courseService.getCourseById("1");

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getCourseId()).isEqualTo("1");
        assertThat(result.get().getTitle()).isEqualTo("Course with numeric courseId");
    }
}