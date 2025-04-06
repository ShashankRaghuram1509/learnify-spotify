package com.learnify.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String courseId;

    @Column(nullable = false)
    private String title;

    private String instructor;
    
    private double rating;
    
    private int students;
    
    private String duration;
    
    private String level;
    
    private double price;
    
    private double discountPrice;
    
    private String image;
    
    private boolean featured;
    
    private String category;
    
    private boolean premium = false;
    
    private String externalLink;
    
    @Column(length = 1000)
    private String description;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Module> modules = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Enrollment> enrollments = new HashSet<>();

    public double getFinalPrice() {
        return discountPrice > 0 ? discountPrice : price;
    }
}
