package com.example.skillforge.dto.request;

import java.util.List;
import lombok.Data;

@Data
public class ManualQuestion {
    private String questionText;
    private List<String> options;
    private String correctAnswer; // EXACT option text
}
