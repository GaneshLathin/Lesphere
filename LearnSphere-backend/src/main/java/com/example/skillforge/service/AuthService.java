package com.example.skillforge.service;

import com.example.skillforge.dto.request.LoginRequest;
import com.example.skillforge.dto.request.RegisterRequest;
import com.example.skillforge.dto.response.AuthResponse;
import com.example.skillforge.dto.response.RefreshTokenResponse;
import com.example.skillforge.exception.InvalidTokenException;
import com.example.skillforge.model.entity.Instructor;
import com.example.skillforge.model.entity.Student;
import com.example.skillforge.model.entity.User;
import com.example.skillforge.model.enums.Role;
import com.example.skillforge.repository.StudentRepository;
import com.example.skillforge.repository.UserRepository;
import com.example.skillforge.security.JwtService;
import com.example.skillforge.service.EmailService;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * \n * Service handling authentication operations: login, register, and token
 * refresh\n
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final StudentRepository studentRepository;
    private final EmailService emailService;
    // Inject UserActivityService
    private final UserActivityService userActivityService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());
        user.setIsActive(true);

        // Create role-specific profile with proper mapping
        if (request.getRole() == Role.STUDENT) {
            Student student = new Student();
            student.setUser(user); // Set bidirectional relationship
            user.setStudent(student);
        } else if (request.getRole() == Role.INSTRUCTOR) {
            Instructor instructor = new Instructor();
            instructor.setUser(user); // Set bidirectional relationship
            instructor.setSpecialization(request.getSpecialization());
            user.setInstructor(instructor);
        }

        // Save user (cascade will save Student/Instructor)
        user = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Fetch student to get the generated ID
        Long studentId = null;
        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUserId(user.getId()).orElse(null);
            if (student != null) {
                studentId = student.getId();
            }
        }

        log.info("User registered successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .studentId(studentId) // return studentId
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    /** \n * Authenticate user and generate JWT tokens\n */
    public AuthResponse login(LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());

            // Check if user exists first
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.error("User not found with email: {}", request.getEmail());
                        return new RuntimeException("User not found with email: " + request.getEmail());
                    });

            log.info("User found: {}, attempting authentication", user.getEmail());

            // Authenticate user credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            Student student = studentRepository.findByUserId(user.getId()).orElse(null);

            // Log activity
            try {
                userActivityService.logActivity(user.getId());
            } catch (Exception e) {
                log.error("Failed to log activity for user: {}", user.getId(), e);
            }

            log.info("User logged in successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .studentId(student != null ? student.getId() : null)
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.error("Invalid password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            throw e;
        }
    }

    /** \n * Refresh access token using valid refresh token\n */
    public RefreshTokenResponse refreshToken(String refreshToken) {
        try {
            // Extract username from refresh token
            String username = jwtService.extractUsername(refreshToken);

            if (username == null) {
                throw new InvalidTokenException("Invalid refresh token");
            }

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate refresh token
            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                throw new InvalidTokenException("Invalid or expired refresh token");
            }

            // Generate new tokens
            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);

            log.info("Token refreshed successfully for user: {}", username);

            return RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();

        } catch (ExpiredJwtException e) {
            log.error("Refresh token expired");
            throw new InvalidTokenException("Refresh token has expired. Please login again.");
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid refresh token");
        }
    }

    /**
     * Send password reset link to user email
     */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15)); // 15 mins expiry
        userRepository.save(user);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        // Use a simple template for the email
        String emailContent = String.format(
                "<html>" +
                        "<body>" +
                        "<h2>Reset Your Password</h2>" +
                        "<p>Hello %s,</p>" +
                        "<p>You have requested to reset your password. Click the link below to set a new password:</p>"
                        +
                        "<p><a href=\"%s\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Reset Password</a></p>"
                        +
                        "<p>This link will expire in 15 minutes.</p>" +
                        "<p>If you didn't request this, you can safely ignore this email.</p>" +
                        "<p>Best regards,<br>LearnSphere-Platform Team</p>" +
                        "</body>" +
                        "</html>",
                user.getName(), resetLink);

        // Send email via EmailService (Assuming EmailService is injected via
        // @RequiredArgsConstructor)
        // Wait, I need to add EmailService dependency to this class first!
        // I will do that in a separate edit or handle it here if I check imports.
        // Since I can't see the imports right now in this chunk, I'll rely on a second
        // edit to add the field.
        // Actually, I should probably add the field and imports first.
        // But for this tool call, I'll just add the methods and then fix the
        // dependencies.

        // I'll add the field in the NEXT tool call or use multi_replace.
        // Let's assume emailService is available.
        emailService.sendSimpleMessage(email, "LearnSphere-Platform - Password Reset Request", emailContent);

        log.info("Password reset email sent to: {}", email);
    }

    /**
     * Reset password using valid token
     */
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }
}
