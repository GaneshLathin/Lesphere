package com.example.skillforge.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.skillforge.model.enums.DifficultyLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category; // e.g., "Programming", "Data Science"

    private String tags; // e.g., "Java,Spring,Backend"

    // MANY-TO-ONE with Instructor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    @JsonIgnore
    private Instructor instructor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficultyLevel;

    private String thumbnailUrl;

    @Column(nullable = false)
    private Integer duration = 0;

    @Column(nullable = false)
    private Integer totalTopics = 0;

    @Column(nullable = false)
    private Integer totalEnrollments = 0;

    @Column(nullable = false)
    private Boolean isPublished = false;

    @Column(nullable = false)
    private Integer viewsCount = 0;

    private Long courseAdminUserId; // Responsible/Course Admin

    // ONE-TO-MANY with Topics
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Topic> topics = new ArrayList<>();

    // ONE-TO-MANY with Quizzes
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Quiz> quizzes = new ArrayList<>();

    // ONE-TO-MANY with Enrollments
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Enrollment> enrollments = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}