package com.example.skillforge.controller;

import com.example.skillforge.dto.request.UpdateProfileRequest;
import com.example.skillforge.dto.response.UserResponse;
import com.example.skillforge.service.S3StorageService;
import com.example.skillforge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.skillforge.model.entity.User;
import com.example.skillforge.repository.UserRepository;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ProfileController {

    private final UserService userService;
    private final S3StorageService s3StorageService;
    private final UserRepository userRepository;
    private final com.example.skillforge.service.UserActivityService userActivityService;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        UserResponse response = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        
        if (userDetails == null) return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse response = userService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/image")
    public ResponseEntity<UserResponse> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        
        if (userDetails == null) return ResponseEntity.status(401).build();

        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Upload to S3
            String imageUrl = s3StorageService.uploadProfileImage(file, user.getId());

            // Update DB
            UserResponse response = userService.updateProfileImage(user.getId(), imageUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/image")
    public ResponseEntity<UserResponse> deleteProfileImage(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProfileImage() != null) {
            // Remove from S3
            s3StorageService.deleteFile(user.getProfileImage());
            
            // Remove from DB
            UserResponse response = userService.updateProfileImage(user.getId(), null);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(userService.getUserById(user.getId()));
    }

    @PostMapping("/banner")
    public ResponseEntity<UserResponse> uploadBannerImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        
        if (userDetails == null) return ResponseEntity.status(401).build();

        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Upload to S3
            String imageUrl = s3StorageService.uploadBannerImage(file, user.getId());

            // Update DB
            UserResponse response = userService.updateBannerImage(user.getId(), imageUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/banner")
    public ResponseEntity<UserResponse> deleteBannerImage(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBannerImage() != null) {
            // Remove from S3
            s3StorageService.deleteFile(user.getBannerImage());
            
            // Remove from DB
            UserResponse response = userService.updateBannerImage(user.getId(), null);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(userService.getUserById(user.getId()));
    }

    @GetMapping("/activity")
    public ResponseEntity<java.util.Map<String, Integer>> getUserActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "2025") int year) {
        
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(userActivityService.getUserActivity(user.getId(), year));
    }

    @PostMapping("/activity/log")
    public ResponseEntity<String> logActivity(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        userActivityService.logActivity(user.getId());
        return ResponseEntity.ok("Activity logged");
    }
}
