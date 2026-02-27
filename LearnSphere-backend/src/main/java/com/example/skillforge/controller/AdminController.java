package com.example.skillforge.controller;
//java
import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.dto.response.UserResponse;
import com.example.skillforge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for ADMIN role endpoints
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final com.example.skillforge.service.AuthService authService;

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<com.example.skillforge.dto.response.AuthResponse>> createUser(
            @RequestBody @jakarta.validation.Valid com.example.skillforge.dto.request.RegisterRequest request) {
        com.example.skillforge.dto.response.AuthResponse response = authService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", response));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Welcome to Admin Dashboard");
        data.put("user", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard data", data));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("All users retrieved", userService.getAllUsers()));
    }

    @PostMapping("/users/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> blockUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        String reason = (String) request.get("reason");
        int days = (Integer) request.get("days");

        return ResponseEntity
                .ok(ApiResponse.success("User blocked successfully", userService.blockUser(id, reason, days)));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Long id,
            @RequestParam String reason) {

        userService.deleteUser(id, reason);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAdminUsersList() {
        List<Map<String, Object>> adminUsers = userService.getAdminUsers();
        return ResponseEntity.ok(adminUsers);
    }
}
