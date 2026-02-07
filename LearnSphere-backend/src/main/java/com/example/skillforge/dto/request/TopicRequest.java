package com.example.skillforge.dto.request;

import com.example.skillforge.model.enums.DifficultyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TopicRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Topic name is required")
    private String name;

    private String description;
    private DifficultyLevel level;
    private Integer orderIndex;
}