package com.example.skillforge.dto.request;

import com.example.skillforge.model.enums.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionRequest {
    @NotNull(message = "Quiz ID is required")
    private Long quizId;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType type;

    private String options; // JSON string for MCQ

    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;

    private Integer points;
    private String explanation;
}
