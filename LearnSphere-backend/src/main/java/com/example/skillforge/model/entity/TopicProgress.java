package com.example.skillforge.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "topic_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "topic_id"})
})
@Data
@NoArgsConstructor
public class TopicProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long topicId;
    private Boolean completed = false;
    private LocalDateTime completedAt;

    // NEW: cumulative seconds spent on this topic
    @Column(name = "time_spent_seconds", nullable = false)
    private Long timeSpentSeconds = 0L;

    private LocalDateTime lastUpdated;

    @PrePersist
    protected void onCreate() {
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
