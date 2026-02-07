package com.example.skillforge.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // student (one-to-one or many-to-one depending on your Student entity)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private Integer completionPercentage = 0;

    // current topic id for quick navigation
    private Long currentTopicId;

    // skill score computed by engine (0-100)
    private Integer skillScore = 0;

    private LocalDateTime lastAccessed;

    @PrePersist
    protected void onCreate() {
        lastAccessed = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastAccessed = LocalDateTime.now();
    }
}
