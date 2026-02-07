package com.example.skillforge.controller;

import com.example.skillforge.model.dto.analytics.AnalyticsDTO;
import com.example.skillforge.model.entity.User;
import com.example.skillforge.repository.UserRepository;
import com.example.skillforge.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    @GetMapping("/student")
    public ResponseEntity<AnalyticsDTO.StudentAnalytics> getStudentAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Assuming User entity has a direct relation to Student
        if (user.getStudent() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(user.getStudent().getId()));
    }

    @GetMapping("/instructor")
    public ResponseEntity<AnalyticsDTO.InstructorAnalytics> getInstructorAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getInstructor() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(analyticsService.getInstructorAnalytics(user.getInstructor().getId()));
    }

    @GetMapping("/admin")
    public ResponseEntity<AnalyticsDTO.AdminAnalytics> getAdminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }
}
