package com.example.skillforge.dto.response;

import com.example.skillforge.model.enums.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private DifficultyLevel level;
    private Integer duration;
    private Integer totalQuestions;
    private Integer totalMarks;
    private Integer passingMarks;
    private Boolean isPublished;
    private Integer totalAttempts;
    private Boolean hasAttempted; // For student view
    private LocalDateTime createdAt;
}
