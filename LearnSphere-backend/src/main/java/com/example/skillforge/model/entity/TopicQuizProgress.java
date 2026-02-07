package com.example.skillforge.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "topic_quiz_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "topic_id"})
})
@Data
@NoArgsConstructor
public class TopicQuizProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long topicId;
    private Double score;
    private Boolean completed = false;
    private LocalDateTime completedAt;
}
