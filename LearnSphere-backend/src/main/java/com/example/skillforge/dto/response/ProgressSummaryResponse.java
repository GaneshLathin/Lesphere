// src/main/java/com/example/skillforge/dto/response/ProgressSummaryResponse.java
package com.example.skillforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressSummaryResponse {
    // global metrics for UI
    private Integer totalLearningMinutes;         // minutes across courses
    private Integer weeklyStreakDays;             // days in last 7-day streak (0..7)
    private Integer skillScore;                   // aggregated skill score (0..1000 or your scale)
    private List<String> badges;                  // badge identifiers or names
    private List<ProgressResponse> courseProgress; // course-level array (existing)
    private List<String> last7DaysActivity;       // ISO dates for the last 7 days with activity
}
