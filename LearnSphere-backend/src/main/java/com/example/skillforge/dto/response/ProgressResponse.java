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
public class ProgressResponse {
    private Long id;
    private Long studentId;
    private Long courseId;
    private Integer completionPercentage;
    private Long currentTopicId;
    private Integer skillScore;
    private LocalDateTime lastAccessed;
    private String courseName;

}
