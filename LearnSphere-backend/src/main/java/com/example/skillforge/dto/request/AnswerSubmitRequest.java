package com.example.skillforge.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class AnswerSubmitRequest {
    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Answer is required")
    private String answer;
}

@Data
class QuizSubmitRequest {
    @NotNull(message = "Quiz ID is required")
    private Long quizId;

    @NotNull(message = "Attempt ID is required")
    private Long attemptId;

    @NotNull(message = "Answers are required")
    private List<AnswerSubmitRequest> answers;

    private Integer timeSpent; // in seconds
}