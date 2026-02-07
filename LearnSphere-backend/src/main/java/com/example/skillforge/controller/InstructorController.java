package com.example.skillforge.controller;

import com.example.skillforge.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Test controller for INSTRUCTOR role endpoints
 * All endpoints require INSTRUCTOR role
 */
@RestController
@RequestMapping("/api/instructor")
public class InstructorController {

    /**
     * Get instructor dashboard data
     * Requires INSTRUCTOR role
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInstructorDashboard(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Welcome to Instructor Dashboard");
        data.put("user", authentication.getName());
        data.put("role", "INSTRUCTOR");
        data.put("features", new String[]{
            "Create & Manage Courses",
            "Upload Course Materials",
            "Create Quizzes",
            "View Student Progress",
            "Manage Enrollments"
        });
        
        return ResponseEntity.ok(ApiResponse.success("Instructor dashboard data", data));
    }

    /**
     * Get instructor's courses
     */
    @GetMapping("/courses")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCourses(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Instructor Courses");
        data.put("user", authentication.getName());
        data.put("totalCourses", 8);
        
        return ResponseEntity.ok(ApiResponse.success("Instructor courses", data));
    }

    /**
     * Get instructor analytics
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        data.put("totalStudents", 150);
        data.put("activeCourses", 8);
        data.put("completionRate", 78.5);
        data.put("averageRating", 4.6);
        
        return ResponseEntity.ok(ApiResponse.success("Instructor analytics", data));
    }
}
