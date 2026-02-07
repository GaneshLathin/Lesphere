package com.example.skillforge.dto.request;

import lombok.Data;

@Data
public class QuizCompletionRequest {
    private Long studentId;
    private Long topicId;
    private Double score;
}
