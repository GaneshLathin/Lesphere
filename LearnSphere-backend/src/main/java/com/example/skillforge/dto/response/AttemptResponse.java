package com.example.skillforge.dto.response;

import java.time.LocalDateTime;


public record AttemptResponse(
        Long id,
        Integer score,
        String status,
        Integer timeSpent,
        LocalDateTime attemptTime
) {}
