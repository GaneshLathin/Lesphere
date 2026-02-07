package com.example.skillforge.service;

import com.example.skillforge.dto.request.UpdateProfileRequest;
import com.example.skillforge.dto.response.StudentStatsDto;
import com.example.skillforge.dto.response.UserResponse;
import com.example.skillforge.model.entity.User;
import com.example.skillforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class UserService {

    private final UserRepository userRepository;
    private final com.example.skillforge.repository.TopicProgressRepository topicProgressRepository;
    private final com.example.skillforge.repository.QuizAttemptRepository quizAttemptRepository;
    private final com.example.skillforge.repository.CertificateRepository certificateRepository;
    private final ProgressService progressService;
    private final EmailService emailService;

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUser(Long id, User userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(userRequest.getName());
        user.setPhone(userRequest.getPhone());
        user.setBio(userRequest.getBio());
        user.setProfileImage(userRequest.getProfileImage());

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public UserResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public UserResponse updateProfileImage(Long id, String imageUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfileImage(imageUrl);
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public UserResponse updateBannerImage(Long id, String imageUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBannerImage(imageUrl);
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public UserResponse blockUser(Long id, String reason, int days) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBlocked(true);
        user.setBlockReason(reason);
        user.setBlockExpiry(java.time.LocalDateTime.now().plusDays(days));

        userRepository.save(user);

        // Send Email
        try {
            String subject = "Account Temporarily Blocked - LearnSphere-Platform";
            String message = String.format(
                    "Dear %s,\n\nYour account has been temporarily blocked for %d days.\nReason: %s\n\nBlock Expiry: %s\n\nIf you believe this is a mistake, please contact support.",
                    user.getName(), days, reason, user.getBlockExpiry());
            emailService.sendSimpleMessage(user.getEmail(), subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send block email: " + e.getMessage());
        }

        return mapToUserResponse(user);
    }

    public void deleteUser(Long id, String reason) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Capture email before delete for notification
        String userEmail = user.getEmail();
        String userName = user.getName();

        // Manual Cleanup for Student specific orphaned records
        if (user.getRole() == com.example.skillforge.model.enums.Role.STUDENT && user.getStudent() != null) {
            Long studentId = user.getStudent().getId();
            // Delete Topic Progress
            topicProgressRepository.deleteByStudentId(studentId);
            // Delete Quiz Attempts
            quizAttemptRepository.deleteByStudentId(studentId);
            // Delete Certificates (Note: Certificate maps student_id to User ID, so we pass
            // user.getId())
            certificateRepository.deleteByStudentId(user.getId());
        }

        userRepository.delete(user);

        // Send Email
        try {
            String subject = "Account Deleted - LearnSphere-Platform";
            String message = String.format(
                    "Dear %s,\n\nYour account has been permanently deleted by the administrator.\nReason: %s\n\nIf you have any questions, please contact support.",
                    userName, reason);
            emailService.sendSimpleMessage(userEmail, subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send delete email: " + e.getMessage());
        }
    }

    private UserResponse mapToUserResponse(User user) {
        StudentStatsDto stats = null;
        if (user.getStudent() != null) {
            // Fetch extra stats from ProgressService
            var progressSummary = progressService.getStudentProgressSummary(user.getStudent().getId());

            stats = StudentStatsDto.builder()
                    .totalPoints(user.getStudent().getTotalPoints())
                    .coursesEnrolled(user.getStudent().getCoursesEnrolled())
                    .quizzesAttempted(user.getStudent().getQuizzesAttempted())
                    .averageScore(user.getStudent().getAverageScore())
                    .currentLevel(user.getStudent().getCurrentLevel())
                    .totalLearningMinutes(progressSummary.getTotalLearningMinutes())
                    .weeklyStreak(progressSummary.getWeeklyStreakDays())
                    .badges(progressSummary.getBadges())
                    .build();
        }

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .bannerImage(user.getBannerImage())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .studentStats(stats)
                .isBlocked(user.isBlocked())
                .blockReason(user.getBlockReason())
                .blockExpiry(user.getBlockExpiry())
                .build();
    }
}