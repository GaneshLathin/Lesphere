package com.example.skillforge.dto.request;

import java.util.List;
import lombok.Data;

@Data
public class ManualQuizRequest {
    private Long courseId;
    private Long topicId;
    private String title;
    private Integer duration;
    private List<ManualQuestion> questions;
}
