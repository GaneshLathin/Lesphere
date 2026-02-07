package com.example.skillforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {

    private Long id;

    private Long courseId;          // ⭐ Added for frontend
    private Long studentId;         // ⭐ Added for frontend

    private Integer completionPercentage;
    private Boolean isCompleted;

    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastAccessedAt;
    
    // Course Details
    private String courseTitle;
    private String instructorName;
}
