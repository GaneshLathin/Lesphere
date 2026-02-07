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
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MANY-TO-ONE with Course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    // MANY-TO-ONE with Topic (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    @JsonIgnore
    private Topic topic;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean generatedByAI = false;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel level;

    @Column(nullable = false)
    private Integer duration = 30;

    @Column(nullable = false)
    private Integer totalQuestions = 0;

    @Column(nullable = false)
    private Integer totalMarks = 0;

    @Column(nullable = false)
    private Integer passingMarks = 0;

    @Column(nullable = false)
    private Boolean isPublished = false;

    @Column(nullable = false)
    private Integer totalAttempts = 0;

    // ONE-TO-MANY with Questions
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Question> questions = new ArrayList<>();

    // ONE-TO-MANY with QuizAttempts
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL,  orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<QuizAttempt> attempts = new ArrayList<>();


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

    @com.fasterxml.jackson.annotation.JsonProperty("courseId")
    public Long getExportedCourseId() {
        return course != null ? course.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("topicId")
    public Long getExportedTopicId() {
        return topic != null ? topic.getId() : null;
    }
}
