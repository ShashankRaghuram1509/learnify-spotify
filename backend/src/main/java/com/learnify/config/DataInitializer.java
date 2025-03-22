
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
        
        // Create instructor user if it doesn't exist
        if (userRepository.findByEmail("instructor@learnify.com").isEmpty()) {
            User instructor = new User();
            instructor.setName("Test Instructor");
            instructor.setEmail("instructor@learnify.com");
            instructor.setPassword(passwordEncoder.encode("password"));
            instructor.setRoles(Collections.singleton(Role.ROLE_INSTRUCTOR));
            userRepository.save(instructor);
        }
        
        // Only add sample courses if none exist
        if (courseRepository.count() == 0) {
            createSampleCourses();
        }
    }
    
    private void createSampleCourses() {
        // Free courses (GeeksForGeeks-style)
        List<Course> freeCourses = Arrays.asList(
            createCourse(
                "dsa-java",
                "Data Structures and Algorithms in Java",
                "Dr. Rajesh Kumar",
                4.8,
                3450,
                "10 weeks",
                "Intermediate",
                0.0,
                0.0,
                "https://media.geeksforgeeks.org/img-practice/banner/dsa-self-paced-thumbnail.png",
                true,
                "data-structures",
                false,
                "https://www.geeksforgeeks.org/data-structures/",
                "Master data structures and algorithms using Java with comprehensive lessons, examples, and practice problems.",
                Arrays.asList(
                    new Module(null, "Arrays and Strings", "Introduction to arrays, string manipulation and common problems.", null),
                    new Module(null, "Linked Lists", "Understanding singly and doubly linked lists with implementation.", null),
                    new Module(null, "Stacks and Queues", "Implementation and applications of stacks and queues.", null),
                    new Module(null, "Trees and Graphs", "Binary trees, BST, heaps and graph algorithms.", null)
                )
            ),
            createCourse(
                "python-basics",
                "Python Programming for Beginners",
                "Sarah Williams",
                4.7,
                5120,
                "6 weeks",
                "Beginner",
                0.0,
                0.0,
                "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20210322182256/Python-Programming-Language.png",
                true,
                "programming",
                false,
                "https://www.geeksforgeeks.org/python-programming-language/",
                "Start your programming journey with Python. Learn syntax, data types, control structures, and basic algorithms.",
                Arrays.asList(
                    new Module(null, "Python Basics", "Variables, data types and basic operations.", null),
                    new Module(null, "Control Flow", "Conditional statements and loops in Python.", null),
                    new Module(null, "Functions", "Creating and using functions in Python.", null),
                    new Module(null, "Data Structures", "Lists, dictionaries, sets and tuples in Python.", null)
                )
            ),
            createCourse(
                "web-fundamentals",
                "Web Development Fundamentals",
                "Mark Johnson",
                4.6,
                3890,
                "8 weeks",
                "Beginner",
                0.0,
                0.0,
                "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20230305182658/HTML-Tutorial.jpg",
                false,
                "web-development",
                false,
                "https://www.geeksforgeeks.org/html-tutorials/",
                "Learn the building blocks of web development: HTML, CSS, and JavaScript.",
                Arrays.asList(
                    new Module(null, "HTML5 Basics", "Document structure, elements and attributes.", null),
                    new Module(null, "CSS Styling", "Selectors, properties and responsive design.", null),
                    new Module(null, "JavaScript Foundations", "Variables, functions and DOM manipulation.", null)
                )
            ),
            createCourse(
                "cpp-programming",
                "C++ Programming Language",
                "Dr. Lisa Chen",
                4.7,
                2780,
                "9 weeks",
                "Intermediate",
                0.0,
                0.0,
                "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20230304231620/C-plus-plus-1.jpg",
                false,
                "programming",
                false,
                "https://www.geeksforgeeks.org/c-plus-plus/",
                "Comprehensive guide to C++ programming including OOP concepts, STL, and modern C++ features.",
                Arrays.asList(
                    new Module(null, "C++ Basics", "Syntax, data types and operators.", null),
                    new Module(null, "Object-Oriented Programming", "Classes, inheritance and polymorphism.", null),
                    new Module(null, "Standard Template Library", "Containers, algorithms and iterators.", null),
                    new Module(null, "Modern C++ Features", "Smart pointers, lambdas and move semantics.", null)
                )
            ),
            createCourse(
                "sql-database",
                "SQL and Database Management",
                "Andrew Martinez",
                4.5,
                3250,
                "7 weeks",
                "Beginner",
                0.0,
                0.0,
                "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20221215164456/SQL1.jpg",
                false,
                "database",
                false,
                "https://www.geeksforgeeks.org/sql-tutorial/",
                "Learn SQL queries, database design, normalization, and database management systems.",
                Arrays.asList(
                    new Module(null, "SQL Basics", "SELECT, INSERT, UPDATE and DELETE queries.", null),
                    new Module(null, "Database Design", "ER diagrams and normalization.", null),
                    new Module(null, "Joins and Subqueries", "Advanced query techniques.", null),
                    new Module(null, "Indexes and Optimization", "Performance tuning for databases.", null)
                )
            ),
            createCourse(
                "git-github",
                "Git and GitHub for Version Control",
                "James Wilson",
                4.6,
                2100,
                "4 weeks",
                "Beginner",
                0.0,
                0.0,
                "https://media.geeksforgeeks.org/wp-content/uploads/20220706122625/gfg1-600x314.jpg",
                false,
                "tools",
                false,
                "https://www.geeksforgeeks.org/git-tutorial/",
                "Master version control with Git and collaboration with GitHub.",
                Arrays.asList(
                    new Module(null, "Git Basics", "Repositories, commits and branches.", null),
                    new Module(null, "Branching and Merging", "Creating and managing branches.", null),
                    new Module(null, "GitHub Workflow", "Pull requests and collaboration.", null),
                    new Module(null, "Advanced Git", "Rebasing, cherry-picking and conflict resolution.", null)
                )
            )
        );
        
        // Premium courses (paid courses in GeeksForGeeks style)
        List<Course> premiumCourses = Arrays.asList(
            createCourse(
                "system-design",
                "Complete System Design Masterclass",
                "Alex Rodriguez, Senior Architect at Google",
                4.9,
                1200,
                "12 weeks",
                "Advanced",
                299.99,
                199.99,
                "https://media.geeksforgeeks.org/img-practice/banner/System-design-thumbnail.png",
                true,
                "system-design",
                true,
                null,
                "Comprehensive system design course covering scalability, distributed systems, microservices architecture, and real-world case studies from top tech companies.",
                Arrays.asList(
                    new Module(null, "Scalability Fundamentals", "Understanding scalable system design principles.", null),
                    new Module(null, "Distributed Systems", "CAP theorem, consistency models and fault tolerance.", null),
                    new Module(null, "Database Scaling", "Sharding, replication and NoSQL solutions.", null),
                    new Module(null, "Microservices Architecture", "Designing and implementing microservices.", null),
                    new Module(null, "Case Studies", "Real-world system designs from Google, Amazon and Netflix.", null)
                )
            ),
            createCourse(
                "advanced-dsa",
                "Advanced Algorithms and Competitive Programming",
                "Dr. Rajiv Khanna, ICPC World Finalist",
                4.9,
                850,
                "14 weeks",
                "Advanced",
                249.99,
                179.99,
                "https://media.geeksforgeeks.org/img-practice/banner/cp-maths-java-thumbnail.png",
                true,
                "algorithms",
                true,
                null,
                "Master advanced algorithms, competitive programming techniques, and solve complex coding challenges to ace technical interviews at top tech companies.",
                Arrays.asList(
                    new Module(null, "Advanced Data Structures", "Segment trees, Fenwick trees and Disjoint set union.", null),
                    new Module(null, "Dynamic Programming", "Advanced DP techniques and optimizations.", null),
                    new Module(null, "Graph Algorithms", "Network flow, matching algorithms and advanced graph problems.", null),
                    new Module(null, "Computational Geometry", "Convex hull, line sweep and geometric algorithms.", null),
                    new Module(null, "Contest Strategy", "Time management and problem-solving approaches for competitions.", null)
                )
            ),
            createCourse(
                "machine-learning",
                "Machine Learning and AI Fundamentals",
                "Dr. Maria Chen, AI Researcher",
                4.8,
                1540,
                "16 weeks",
                "Intermediate",
                349.99,
                249.99,
                "https://media.geeksforgeeks.org/img-practice/banner/machine-learning-live-thumbnail.png",
                true,
                "data-science",
                true,
                null,
                "Comprehensive course on machine learning algorithms, neural networks, deep learning, and practical AI applications with hands-on projects.",
                Arrays.asList(
                    new Module(null, "ML Foundations", "Statistical learning theory and algorithm types.", null),
                    new Module(null, "Supervised Learning", "Regression, classification and ensemble methods.", null),
                    new Module(null, "Unsupervised Learning", "Clustering, dimensionality reduction and anomaly detection.", null),
                    new Module(null, "Neural Networks", "Deep learning architectures and training techniques.", null),
                    new Module(null, "Applied AI", "Natural language processing and computer vision applications.", null),
                    new Module(null, "ML Engineering", "Model deployment, monitoring and maintenance.", null)
                )
            ),
            createCourse(
                "cloud-architecture",
                "Cloud Architecture and DevOps",
                "James Miller, Cloud Architect",
                4.7,
                980,
                "12 weeks",
                "Advanced",
                299.99,
                219.99,
                "https://media.geeksforgeeks.org/img-practice/banner/devops-thumbnail.png",
                false,
                "cloud",
                true,
                null,
                "Master cloud services, infrastructure as code, CI/CD pipelines, and DevOps practices with AWS, Azure, and Google Cloud.",
                Arrays.asList(
                    new Module(null, "Cloud Computing Fundamentals", "IaaS, PaaS, SaaS and cloud service models.", null),
                    new Module(null, "AWS Services", "EC2, S3, Lambda and other core AWS services.", null),
                    new Module(null, "Infrastructure as Code", "Terraform, CloudFormation and Ansible.", null),
                    new Module(null, "Containerization", "Docker, Kubernetes and orchestration.", null),
                    new Module(null, "CI/CD Pipelines", "Jenkins, GitHub Actions and automated deployment.", null),
                    new Module(null, "Monitoring and Logging", "Prometheus, Grafana and ELK stack.", null)
                )
            )
        );
        
        courseRepository.saveAll(freeCourses);
        courseRepository.saveAll(premiumCourses);
    }
    
    private Course createCourse(String courseId, String title, String instructor, double rating, 
                                int students, String duration, String level, double price, 
                                double discountPrice, String image, boolean featured, 
                                String category, boolean premium, String externalLink,
                                String description, List<Module> modules) {
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
        course.setPremium(premium);
        course.setExternalLink(externalLink);
        course.setDescription(description);
        
        // Link modules to this course
        for (Module module : modules) {
            module.setCourse(course);
        }
        course.setModules(modules);
        
        return course;
    }
}
