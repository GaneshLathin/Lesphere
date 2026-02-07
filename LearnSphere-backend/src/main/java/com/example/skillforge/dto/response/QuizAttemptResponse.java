package com.example.skillforge.dto.response;

import com.example.skillforge.model.enums.QuizStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private BigDecimal score;
    private Integer totalMarks;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer timeSpent;
    private QuizStatus status;
    private Boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}

