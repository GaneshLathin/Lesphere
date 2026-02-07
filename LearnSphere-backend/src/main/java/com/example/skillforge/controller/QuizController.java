package com.example.skillforge.controller;

import com.example.skillforge.dto.request.AIQuizGenerationRequest;
import com.example.skillforge.dto.request.ManualQuizRequest;
import com.example.skillforge.dto.response.AIQuizResponse;
import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.model.entity.Question;
import com.example.skillforge.model.entity.Quiz;
import com.example.skillforge.model.entity.QuizAttempt;
import com.example.skillforge.repository.QuestionRepository;
import com.example.skillforge.service.AIQuizGeneratorService;
import com.example.skillforge.service.QuestionService;
import com.example.skillforge.service.QuizAttemptService;
import com.example.skillforge.service.QuizService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * QuizController - final version
 *
 * Endpoints:
 * POST /api/quizzes/generate -> generate AI quiz (returns AIQuizResponse)
 * POST /api/quizzes/save-from-ai -> save AI quiz to DB (requires instructorId,
 * courseId, topicId, title)
 * GET /api/quizzes/topic/{topicId} -> get latest quiz for topic
 * POST /api/quizzes/{quizId}/attempt -> submit quiz attempt
 */
@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Slf4j
public class QuizController {

    private final AIQuizGeneratorService aiService;
    private final QuizService quizService;
    private final QuizAttemptService quizAttemptService;
    private final QuestionRepository questionRepository;
    // Activity Tracking
    private final com.example.skillforge.service.UserActivityService userActivityService;
    private final com.example.skillforge.repository.StudentRepository studentRepository;
    // private final QuestionService questionService;

    /**
     * Generate questions from AI (Gemini).
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<AIQuizResponse>> generateAIQuiz(@RequestBody AIQuizGenerationRequest request) {
        try {
            // controller will call whatever alias exists on service
            AIQuizResponse resp = aiService.generateQuestions(request);
            return ResponseEntity.ok(ApiResponse.success("AI generated quiz", resp));
        } catch (Exception ex) {
            log.error("AI generation failed", ex);
            return ResponseEntity.status(500).body(ApiResponse.error("AI generation failed: " + ex.getMessage()));
        }
    }

    /**
     * Save AI-generated quiz into DB.
     *
     * Example call:
     * POST
     * /api/quizzes/save-from-ai?instructorId=5&courseId=10&topicId=20&title=My%20Quiz
     * Body: AIQuizResponse JSON returned by /generate
     */
    @PostMapping("/save-from-ai")
    public ResponseEntity<ApiResponse<Quiz>> saveAIQuiz(
            @RequestParam Long instructorId,
            @RequestParam Long courseId,
            @RequestParam Long topicId,
            @RequestParam Integer duration, // 🔥 REQUIRED
            @RequestParam(required = false, defaultValue = "AI Generated Quiz") String title,
            @RequestBody AIQuizResponse aiResponse) {
        try {
            // QuizService implementation should attach courseId/topicId and persist
            // questions.
            Quiz created = quizService.createQuizFromAI(courseId, topicId, aiResponse);

            // Optional: set title/instructor if your Quiz entity supports them via service
            // method.
            if (created != null) {
                created.setTitle(title);
                // If your Quiz entity has instructorId field, set it here (uncomment if
                // applicable)
                // created.setInstructorId(instructorId);
                // Save update (if createQuizFromAI didn't set title)
                // created = quizService.save(created);
            }
            created.setDuration(duration); // 🔥 STORE
            quizService.save(created);
            return ResponseEntity.ok(ApiResponse.success("Quiz saved", created));
        } catch (Exception ex) {
            log.error("Save AI quiz failed", ex);
            return ResponseEntity.status(500).body(ApiResponse.error("Save AI quiz failed: " + ex.getMessage()));
        }
    }

    /**
     * Get latest quiz by topic id.
     */
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<ApiResponse<Quiz>> getQuizByTopic(@PathVariable Long topicId) {
        try {
            Quiz quiz = quizService.getQuizByTopic(topicId);
            if (quiz == null) {
                return ResponseEntity.ok(ApiResponse.success("No quiz found for topic", null));
            }
            return ResponseEntity.ok(ApiResponse.success("Quiz retrieved", quiz));
        } catch (Exception ex) {
            log.error("Get quiz by topic failed", ex);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to get quiz: " + ex.getMessage()));
        }
    }

    @PostMapping("/{quizId}/attempt")
    public ResponseEntity<ApiResponse<QuizAttempt>> submitAttempt(
            @PathVariable Long quizId,
            @RequestBody AttemptRequest payload) {
        try {
            if (payload == null || payload.getStudentId() == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("studentId is required"));
            }

            Long studentId = payload.getStudentId();
            int timeSpent = payload.getTimeSpent() == null ? 0 : payload.getTimeSpent();
            Long topicId = payload.getTopicId();
            
            System.out.println("DEBUG: QuizController: Received attempt for Quiz " + quizId + 
                               " from Student " + studentId + 
                               ", Topic " + topicId + 
                               ", Time " + timeSpent);

            // Map answers to service DTO
            List<QuizAttemptService.AnswerSubmission> submissions = new ArrayList<>();
            if (payload.getAnswers() != null) {
                for (Map<String, Object> map : payload.getAnswers()) {
                    Object qidObj = map.get("questionId");
                    Object ansObj = map.get("answerText");
                    if (qidObj == null)
                        continue;
                    QuizAttemptService.AnswerSubmission s = new QuizAttemptService.AnswerSubmission();
                    s.setQuestionId(Long.valueOf(String.valueOf(qidObj)));
                    s.setAnswerText(ansObj == null ? null : String.valueOf(ansObj));
                    submissions.add(s);
                }
            }

            // Evaluate and persist the attempt (service will handle scoring, answers,
            // progress updates)
            QuizAttempt attempt = quizAttemptService.evaluateAndSaveAttempt(studentId, quizId, submissions, timeSpent,
                    topicId);

            // Log User Activity
            try {
                studentRepository.findById(studentId).ifPresent(student -> {
                    userActivityService.logActivity(student.getUser().getId());
                });
            } catch (Exception e) {
                log.error("Failed to log activity for student: {}", studentId, e);
            }

            return ResponseEntity.ok(ApiResponse.success("Attempt saved", attempt));
        } catch (Exception ex) {
            log.error("Submit attempt failed", ex);
            return ResponseEntity.status(500).body(ApiResponse.error("Submit attempt failed: " + ex.getMessage()));
        }
    }

    @GetMapping("/{quizId}/attempts/{studentId}")
    public ResponseEntity<ApiResponse<List<com.example.skillforge.dto.response.AttemptResponse>>> getAttempts(
            @PathVariable Long quizId,
            @PathVariable Long studentId) {
        try {
            List<QuizAttempt> attempts = quizAttemptService.getAttempts(studentId, quizId);

            // Convert to DTO to avoid recursion and infinite nesting
            List<com.example.skillforge.dto.response.AttemptResponse> responseList = attempts.stream()
                    .map(a -> new com.example.skillforge.dto.response.AttemptResponse(
                            a.getId(),
                            a.getScore() != null ? a.getScore().intValue() : 0,
                            a.getStatus(),
                            a.getTimeSpent(),
                            a.getAttemptTime()))
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Attempts retrieved", responseList));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to load attempts: " + ex.getMessage()));
        }
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<ApiResponse<Quiz>> getQuizById(@PathVariable Long quizId) {
        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Quiz not found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Quiz retrieved", quiz));
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<ApiResponse<List<Question>>> getQuestionsByQuiz(@PathVariable Long quizId) {
        try {
            List<Question> questions = questionRepository.findByQuizId(quizId);
            return ResponseEntity.ok(ApiResponse.success("Questions retrieved", questions));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to load questions: " + ex.getMessage()));
        }
    }

    @PostMapping("/manual")
    public ResponseEntity<ApiResponse<Quiz>> saveManualQuiz(
            @RequestBody ManualQuizRequest request) {
        try {
            Quiz quiz = quizService.createManualQuiz(request);
            return ResponseEntity.ok(ApiResponse.success("Manual quiz saved", quiz));
        } catch (Exception ex) {
            log.error("Save manual quiz failed", ex);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Manual quiz save failed: " + ex.getMessage()));
        }
    }

    // --- DTO for attempt payload ---
    @Data
    public static class AttemptRequest {
        private Long studentId;
        private Long topicId;
        private Integer timeSpent;
        private List<Map<String, Object>> answers;
    }
}
