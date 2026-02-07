package com.example.skillforge.dto.response;

import com.example.skillforge.model.enums.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsDto {
    private Integer totalPoints;
    private Integer coursesEnrolled;
    private Integer quizzesAttempted;
    private Double averageScore;
    private DifficultyLevel currentLevel;
    private Integer totalLearningMinutes;
    private Integer weeklyStreak;
    private List<String> badges;
}
