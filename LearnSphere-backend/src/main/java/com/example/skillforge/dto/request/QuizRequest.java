package com.example.skillforge.dto.request;

import com.example.skillforge.model.enums.DifficultyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    private Long topicId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private DifficultyLevel level;

    @NotNull(message = "Duration is required")
    private Integer duration;

    private Integer passingMarks;
}
