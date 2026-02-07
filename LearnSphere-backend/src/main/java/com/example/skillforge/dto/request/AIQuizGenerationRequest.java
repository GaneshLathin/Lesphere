package com.example.skillforge.dto.request;

import lombok.Data;

@Data
public class AIQuizGenerationRequest {

    private Long courseId;
    private Long topicId;

    private String topicName;
    private String difficulty;       // BEGINNER / INTERMEDIATE / ADVANCED
    private int numberOfQuestions;   // e.g., 5 or 10
}
