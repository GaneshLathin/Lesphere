package com.example.skillforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO for individual quiz attempt details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptDetailResponse {
    
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Long topicId;
    private String topicName;
    
    private Double score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double percentage;
    
    private Integer timeSpent;
    private String status;
    private LocalDateTime attemptTime;
    
    private String performanceLevel;
    private String performanceColor;
}
