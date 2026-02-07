package com.example.skillforge.dto.response;

import com.example.skillforge.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String bio;
    private String profileImage;
    private String bannerImage;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private StudentStatsDto studentStats;

    // Admin fields
    private Boolean isBlocked;
    private String blockReason;
    private LocalDateTime blockExpiry;
}
