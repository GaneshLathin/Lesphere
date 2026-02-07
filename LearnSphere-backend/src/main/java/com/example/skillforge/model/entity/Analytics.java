package com.example.skillforge.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MANY-TO-ONE with Student
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    // MANY-TO-ONE with Course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Column(columnDefinition = "JSON")
    private String topicWiseScores;

    @Column(columnDefinition = "TEXT")
    private String strengthAreas;

    @Column(columnDefinition = "TEXT")
    private String weaknessAreas;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(nullable = false)
    private Double overallScore = 0.0;

    @Column(nullable = false)
    private Integer totalQuizzesTaken = 0;

    @Column(nullable = false)
    private Integer totalTimeSpent = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}