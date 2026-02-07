package com.example.skillforge.controller;

import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.model.entity.Question;
import com.example.skillforge.repository.QuestionRepository;
import com.example.skillforge.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Slf4j
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final QuestionService questionService;

    /**
     * Get all questions (with answers) for a quiz
     * GET /api/questions/quiz/{quizId}
     */
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<ApiResponse<List<Question>>> getQuestionsByQuiz(@PathVariable Long quizId) {
        try {
            List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(quizId);
            return ResponseEntity.ok(ApiResponse.success("Questions fetched", questions));
        } catch (Exception e) {
            log.error("Failed to fetch questions", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error fetching questions: " + e.getMessage()));
        }
    }

    /**
     * Get single question by ID
     * GET /api/questions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Question>> getQuestionById(@PathVariable Long id) {
        return questionRepository.findById(id)
                .map(q -> ResponseEntity.ok(ApiResponse.success("Question fetched", q)))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(ApiResponse.error("Question not found")));
    }


}
