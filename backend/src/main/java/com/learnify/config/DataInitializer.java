
package com.learnify.config;

import com.learnify.model.Course;
import com.learnify.model.Module;
import com.learnify.model.Role;
import com.learnify.model.User;
import com.learnify.repository.CourseRepository;
import com.learnify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if it doesn't exist
        if (userRepository.findByEmail("admin@learnify.com").isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@learnify.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Collections.singleton(Role.ROLE_ADMIN));
            admin.setPremium(true);
            userRepository.save(admin);
        }
        
        // Create test user if it doesn't exist
        if (userRepository.findByEmail("user@learnify.com").isEmpty()) {
            User user = new User();
            user.setName("Test User");
            user.setEmail("user@learnify.com");
            user.setPassword(passwordEncoder.encode("password"));
            user.setRoles(Collections.singleton(Role.ROLE_USER));
            userRepository.save(user);
        }
        
        // Only add sample courses if none exist
        if (courseRepository.count() == 0) {
            createSampleCourses();
        }
    }
    
    private void createSampleCourses() {
        List<Course> courses = Arrays.asList(
            createCourse(
                "web-dev-101",
                "Web Development Fundamentals",
                "Sarah Johnson",
                4.8,
                1543,
                "8 weeks",
                "Beginner",
                89.99,
                49.99,
                "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
                true,
                "development",
                "Learn the basics of web development with HTML, CSS, and JavaScript.",
                Arrays.asList(
                    new Module(null, "Introduction to HTML", "Learn about HTML tags and structure.", null),
                    new Module(null, "CSS Styling", "Learn how to style your HTML with CSS.", null),
                    new Module(null, "JavaScript Basics", "Learn the fundamentals of JavaScript programming.", null)
                )
            ),
            createCourse(
                "ui-ux-design",
                "UI/UX Design Mastery",
                "Michael Chang",
                4.7,
                982,
                "10 weeks",
                "Intermediate",
                99.99,
                69.99,
                "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
                true,
                "design",
                "Master the principles of UI/UX design and create stunning user interfaces.",
                Arrays.asList(
                    new Module(null, "Design Principles", "Learn the fundamental principles of good design.", null),
                    new Module(null, "User Research", "Learn how to conduct effective user research.", null),
                    new Module(null, "Prototyping", "Create interactive prototypes with Figma.", null)
                )
            ),
            createCourse(
                "data-science-python",
                "Data Science with Python",
                "Emily Rodriguez",
                4.9,
                2102,
                "12 weeks",
                "Intermediate",
                119.99,
                79.99,
                "https://images.unsplash.com/photo-1551033406-611cf9a28f67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
                true,
                "data-science",
                "Learn how to analyze and visualize data using Python and popular libraries.",
                Arrays.asList(
                    new Module(null, "Python Basics", "Introduction to Python programming language.", null),
                    new Module(null, "Data Analysis with Pandas", "Learn how to manipulate and analyze data with Pandas.", null),
                    new Module(null, "Data Visualization", "Create insightful visualizations with Matplotlib and Seaborn.", null)
                )
            ),
            createCourse(
                "digital-marketing",
                "Digital Marketing Strategies",
                "Alex Thompson",
                4.6,
                1287,
                "6 weeks",
                "All Levels",
                79.99,
                39.99,
                "https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2326&q=80",
                true,
                "marketing",
                "Learn effective digital marketing strategies for growing your business online.",
                Arrays.asList(
                    new Module(null, "SEO Fundamentals", "Learn how to optimize your website for search engines.", null),
                    new Module(null, "Social Media Marketing", "Strategies for effective social media marketing.", null),
                    new Module(null, "Email Marketing", "Learn how to create effective email marketing campaigns.", null)
                )
            ),
            createCourse(
                "ai-machine-learning",
                "AI & Machine Learning Fundamentals",
                "David Chen",
                4.8,
                1843,
                "14 weeks",
                "Advanced",
                129.99,
                89.99,
                "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2301&q=80",
                true,
                "ai",
                "Understand the fundamentals of AI and machine learning algorithms.",
                Arrays.asList(
                    new Module(null, "Introduction to AI", "Learn about the history and applications of AI.", null),
                    new Module(null, "Machine Learning Basics", "Understand the core concepts of machine learning.", null),
                    new Module(null, "Neural Networks", "Learn how to build and train neural networks.", null)
                )
            ),
            createCourse(
                "mobile-app-dev",
                "Mobile App Development",
                "Jessica Lee",
                4.7,
                1204,
                "10 weeks",
                "Intermediate",
                99.99,
                59.99,
                "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
                true,
                "development",
                "Learn how to build mobile apps for iOS and Android using React Native.",
                Arrays.asList(
                    new Module(null, "React Native Basics", "Introduction to React Native framework.", null),
                    new Module(null, "Building UI Components", "Create reusable UI components for mobile apps.", null),
                    new Module(null, "State Management", "Learn how to manage state in React Native apps.", null)
                )
            )
        );
        
        courseRepository.saveAll(courses);
    }
    
    private Course createCourse(String courseId, String title, String instructor, double rating, 
                                int students, String duration, String level, double price, 
                                double discountPrice, String image, boolean featured, 
                                String category, String description, List<Module> modules) {
        Course course = new Course();
        course.setCourseId(courseId);
        course.setTitle(title);
        course.setInstructor(instructor);
        course.setRating(rating);
        course.setStudents(students);
        course.setDuration(duration);
        course.setLevel(level);
        course.setPrice(price);
        course.setDiscountPrice(discountPrice);
        course.setImage(image);
        course.setFeatured(featured);
        course.setCategory(category);
        course.setDescription(description);
        
        // Link modules to this course
        for (Module module : modules) {
            module.setCourse(course);
        }
        course.setModules(modules);
        
        return course;
    }
}
