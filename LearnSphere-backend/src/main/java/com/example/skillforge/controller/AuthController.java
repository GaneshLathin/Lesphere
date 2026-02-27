package com.example.skillforge.controller;
//test
import com.example.skillforge.dto.request.LoginRequest;
import com.example.skillforge.dto.request.RefreshTokenRequest;
import com.example.skillforge.dto.request.RegisterRequest;
import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.dto.response.AuthResponse;
import com.example.skillforge.dto.response.RefreshTokenResponse;
import com.example.skillforge.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication operations
 * Handles login, registration, and token refresh
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    /**
     * Login and get JWT tokens
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Refresh access token using refresh token
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    /**
     * Forgot Password - Send Reset Link
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody com.example.skillforge.dto.request.ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Password reset link sent to your email", null));
    }

    /**
     * Reset Password - Update Password
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody com.example.skillforge.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    /**
     * Google Login
     * POST /api/auth/google
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody com.example.skillforge.dto.request.GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request.getToken());
        return ResponseEntity.ok(ApiResponse.success("Google login successful", response));
    }

    /**
     * Verify OTP
     * POST /api/auth/verify-otp
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(
            @Valid @RequestBody com.example.skillforge.dto.request.VerifyOtpRequest request) {
        authService.verifyAccount(request.getEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Account verified successfully", null));
    }

    /**
     * Resend OTP
     * POST /api/auth/resend-otp
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(
            @Valid @RequestBody com.example.skillforge.dto.request.ResendOtpRequest request) {
        authService.resendVerificationCode(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Verification code resent", null));
    }

    /**
     * Health check endpoint
     * GET /api/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("LearnSphere-Platform API is running!");
    }
}
