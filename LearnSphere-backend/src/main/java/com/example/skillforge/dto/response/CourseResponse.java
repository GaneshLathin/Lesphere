package com.example.skillforge.dto.response;

import com.example.skillforge.model.enums.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Long instructorId;
    private String instructorName;
    private DifficultyLevel difficultyLevel;
    private String thumbnailUrl;
    private Integer duration;
    private Integer totalTopics;
    private Integer totalEnrollments;
    private Boolean isPublished;
    private Boolean isEnrolled; // For student view
    private String tags;
    private Integer viewsCount;
    private Long courseAdminUserId;
    private String courseAdminName;
    private LocalDateTime createdAt;
    private Integer progressPercent; // NEW FIELD

    // ⭐ NEW ⭐ (Needed for sorting dashboard courses)
    private LocalDateTime lastAccessed;

}