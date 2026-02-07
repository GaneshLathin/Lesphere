package com.example.skillforge.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
@Data
@NoArgsConstructor
public class CourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long courseId;

    private Integer progressPercent;
    private LocalDateTime lastUpdated;

    @Column(name = "last_topic_id")
    private Long lastTopicId;      // NEW FIELD

    @Column(name = "skill_score")
    private Integer skillScore;    // NEW FIELD

    @Column(name = "recommendation_type")
    private String currentRecommendationType; // REVISION, PRACTICE, NEXT_TOPIC

    @Column(name = "recommendation_reason")
    private String recommendationReason;

    private Integer totalTimeMinutes;


}
