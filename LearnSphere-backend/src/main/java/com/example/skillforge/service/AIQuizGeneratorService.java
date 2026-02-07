package com.example.skillforge.service;

import com.example.skillforge.dto.request.AIQuizGenerationRequest;
import com.example.skillforge.dto.response.AIQuizResponse;

public interface AIQuizGeneratorService {

//    AIQuizResponse generateQuiz(AIQuizGenerationRequest request);
    AIQuizResponse generateQuiz(AIQuizGenerationRequest req);
    // Alias method (for your existing QuizController)
    default AIQuizResponse generateQuestions(AIQuizGenerationRequest request) {
        return generateQuiz(request);
    }
}
