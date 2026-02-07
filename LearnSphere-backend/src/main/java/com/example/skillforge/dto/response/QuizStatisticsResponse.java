package com.example.skillforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for overall quiz statistics for a student in a course
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizStatisticsResponse {
    
    // Overall Statistics
    private Long studentId;
    private Long courseId;
    private String courseName;
    
    // Quiz Performance Metrics
    private Integer totalQuizzesTaken;
    private Integer totalQuizzesAvailable;
    private Double completionRate;
    
    // Score Statistics
    private Double averageScore;
    private Double totalScore;
    private Double highestScore;
    private Double lowestScore;
    
    // Performance Indicators
    private String performanceLevel;  // EXCELLENT, GOOD, AVERAGE, NEEDS_IMPROVEMENT
    private String performanceMessage;
    private String performanceColor;  // For UI styling
    
    // Time Statistics
    private Integer totalTimeSpent;  // in seconds
    private Integer averageTimePerQuiz;
    
    // Additional Metrics
    private Integer totalCorrectAnswers;
    private Integer totalQuestions;
    private Double accuracyRate;
    
    // Trend Data
    private Boolean isImproving;
    private Double improvementRate;
}
