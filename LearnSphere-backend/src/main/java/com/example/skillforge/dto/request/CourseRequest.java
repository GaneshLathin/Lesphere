package com.example.skillforge.dto.request;

import com.example.skillforge.model.enums.DifficultyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficultyLevel;

    private String thumbnailUrl;
    private Integer duration;

    @NotBlank(message = "Category is required")
    private String category;

    private String tags;
    private Long courseAdminUserId;
}
