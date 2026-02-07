package com.example.skillforge.controller;

import com.example.skillforge.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Test controller for STUDENT role endpoints
 * All endpoints require STUDENT role
 */
@RestController
@RequestMapping("/api/student")
@lombok.RequiredArgsConstructor
public class StudentController {

    private final com.example.skillforge.service.UserActivityService userActivityService;
    private final com.example.skillforge.repository.StudentRepository studentRepository;

    /**
     * Get student dashboard data
     * Requires STUDENT role
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDashboard(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Welcome to Student Dashboard");
        data.put("user", authentication.getName());
        data.put("role", "STUDENT");
        data.put("features", new String[]{
            "View Enrolled Courses",
            "Track Learning Progress",
            "Take Quizzes",
            "View Adaptive Learning Path"
        });
        
        return ResponseEntity.ok(ApiResponse.success("Student dashboard data", data));
    }

    /**
     * Get student profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Student Profile");
        data.put("user", authentication.getName());
        
        return ResponseEntity.ok(ApiResponse.success("Student profile data", data));
    }

    /**
     * Get student learning stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(Authentication authentication) {
        // Find student by user email
        String email = authentication.getName();
        com.example.skillforge.model.entity.Student student = studentRepository.findAll().stream()
                .filter(s -> s.getUser().getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        int streak = userActivityService.calculateStreak(student.getUser().getId());

        Map<String, Object> data = new HashMap<>();
        data.put("coursesEnrolled", student.getCoursesEnrolled());
        data.put("coursesCompleted", 2); // TODO: Calculate real value
        data.put("quizzesTaken", student.getQuizzesAttempted());
        data.put("averageScore", student.getAverageScore());
        data.put("currentStreak", streak);
        data.put("totalPoints", student.getTotalPoints());
        
        return ResponseEntity.ok(ApiResponse.success("Student statistics", data));
    }
}
