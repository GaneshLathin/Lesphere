package com.example.skillforge.controller;

import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.dto.response.QuizStatisticsResponse;
import com.example.skillforge.dto.response.QuizTrackingResponse;
import com.example.skillforge.service.QuizStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for quiz statistics and tracking
 */
@RestController
@RequestMapping("/api/quiz-statistics")
@RequiredArgsConstructor
public class QuizStatisticsController {

    private final QuizStatisticsService quizStatisticsService;

    /**
     * Get quiz statistics for a student in a specific course
     * GET /api/quiz-statistics/student/{studentId}/course/{courseId}
     */
    @GetMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<QuizStatisticsResponse>> getCourseQuizStatistics(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        
        QuizStatisticsResponse statistics = quizStatisticsService.getCourseQuizStatistics(studentId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Quiz statistics retrieved successfully", statistics));
    }

    /**
     * Get overall quiz statistics for a student (all courses)
     * GET /api/quiz-statistics/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<QuizStatisticsResponse>> getOverallQuizStatistics(
            @PathVariable Long studentId) {
        
        QuizStatisticsResponse statistics = quizStatisticsService.getOverallQuizStatistics(studentId);
        return ResponseEntity.ok(ApiResponse.success("Overall quiz statistics retrieved successfully", statistics));
    }

    /**
     * Get comprehensive quiz tracking (statistics + attempt history)
     * GET /api/quiz-statistics/student/{studentId}/course/{courseId}/tracking
     */
    @GetMapping("/student/{studentId}/course/{courseId}/tracking")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<QuizTrackingResponse>> getQuizTracking(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        
        QuizTrackingResponse tracking = quizStatisticsService.getQuizTracking(studentId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Quiz tracking retrieved successfully", tracking));
    }

    /**
     * Get quiz statistics by course ID for current student
     * GET /api/quiz-statistics/course/{courseId}/my-stats
     */
    @GetMapping("/course/{courseId}/my-stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<QuizStatisticsResponse>> getMyQuizStatistics(
            @PathVariable Long courseId,
            @RequestParam Long studentId) {
        
        QuizStatisticsResponse statistics = quizStatisticsService.getCourseQuizStatistics(studentId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Your quiz statistics retrieved successfully", statistics));
    }

    /**
     * Get my overall quiz statistics
     * GET /api/quiz-statistics/my-overall-stats
     */
    @GetMapping("/my-overall-stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<QuizStatisticsResponse>> getMyOverallStatistics(
            @RequestParam Long studentId) {
        
        QuizStatisticsResponse statistics = quizStatisticsService.getOverallQuizStatistics(studentId);
        return ResponseEntity.ok(ApiResponse.success("Your overall quiz statistics retrieved successfully", statistics));
    }
}
