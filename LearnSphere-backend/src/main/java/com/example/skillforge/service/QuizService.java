package com.example.skillforge.service;

import com.example.skillforge.dto.request.ManualQuizRequest;
import com.example.skillforge.dto.request.QuizRequest;
import com.example.skillforge.dto.response.AIQuizResponse;
import com.example.skillforge.model.entity.Quiz;

public interface QuizService {

    Quiz createQuiz(QuizRequest request);
    Quiz getQuizByTopic(Long topicId);
    Quiz getQuizById(Long quizId);
    Quiz createQuizFromAI(Long courseId, Long topicId, AIQuizResponse aiResp);
    Quiz createManualQuiz(ManualQuizRequest request);
    Quiz save(Quiz quiz);


}
