package com.example.skillforge.dto.response;

import com.example.skillforge.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response containing user details and JWT tokens
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;          // Access token
    private String refreshToken;   // Refresh token
    private String type = "Bearer";
    private Long userId;
    private Long studentId;
    private String name;
    private String email;
    private Role role;
}