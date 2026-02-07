package com.example.skillforge.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

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

    @Column(nullable = false)
    private Integer completionPercentage = 0;

    @Column(nullable = false)
    private Boolean isCompleted = false;

    private LocalDateTime completedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    private LocalDateTime lastAccessedAt;

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
        lastAccessedAt = LocalDateTime.now();
    }
}
