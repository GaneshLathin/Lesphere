package com.example.skillforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicRecommendationResponse {
    private Long id;
    private String name;
    private String description;
    private String level;
    private Integer duration;
    
    // Adaptive fields
    private String recommendationReason;
    private String recommendationType; // "REVISION", "PRACTICE", "NEXT_TOPIC"
}
