package com.example.skillforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Comprehensive quiz tracking response combining statistics and attempt history
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizTrackingResponse {
    
    private QuizStatisticsResponse statistics;
    private List<QuizAttemptDetailResponse> recentAttempts;
    private List<QuizAttemptDetailResponse> topPerformances;
    private List<QuizAttemptDetailResponse> needsImprovement;
}
