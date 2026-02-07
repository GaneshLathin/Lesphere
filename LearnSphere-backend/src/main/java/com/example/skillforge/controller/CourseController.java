package com.example.skillforge.controller;

import com.example.skillforge.dto.request.CourseRequest;
import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.dto.response.CourseResponse;
import com.example.skillforge.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final com.example.skillforge.service.AdaptiveLearningService adaptiveLearningService;
    private final com.example.skillforge.service.CourseRecommendationService courseRecommendationService;

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request,
            @RequestParam Long instructorId) {
        CourseResponse course = courseService.createCourse(request, instructorId);
        return ResponseEntity.ok(ApiResponse.success("Course created successfully", course));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(
            @PathVariable Long id,
            @RequestParam(required = false) Long studentId) {
        CourseResponse course = courseService.getCourseById(id, studentId);
        return ResponseEntity.ok(ApiResponse.success("Course retrieved", course));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String durationRange,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Boolean published,
            @RequestParam(required = false) Long instructorId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Courses retrieved",
                        courseService.getAllCourses(
                                page, size, sortBy, direction,
                                difficulty, durationRange,
                                search, studentId, published, instructorId)));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getPublishedCourses(
            @RequestParam(required = false) Long studentId) {
        List<CourseResponse> courses = courseService.getPublishedCourses(studentId);
        return ResponseEntity.ok(ApiResponse.success("Published courses retrieved", courses));
    }

    @GetMapping("/instructor/{instructorId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getInstructorCourses(
            @PathVariable Long instructorId) {
        List<CourseResponse> courses = courseService.getCoursesByInstructor(instructorId);
        return ResponseEntity.ok(ApiResponse.success("Instructor courses retrieved", courses));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", course));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> publishCourse(@PathVariable Long id) {
        courseService.publishCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course published successfully", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }

    @PostMapping("/{id}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long id) {
        courseService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Upload course thumbnail image
     */
    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadCourseImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            // TODO: Implement S3 upload logic
            // For now, return a placeholder URL
            String imageUrl = "https://placeholder-url.com/" + file.getOriginalFilename();

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image upload endpoint ready - S3 integration pending");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- Adaptive Learning & Recommendations ---

    @GetMapping("/{courseId}/next-step")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<com.example.skillforge.dto.response.TopicRecommendationResponse>> getNextStep(
            @PathVariable Long courseId,
            @RequestParam Long studentId) {
        // Return Topic with potentially specialized message based on progress
        return ResponseEntity.ok(ApiResponse.success(
                "Next step calculated",
                adaptiveLearningService.recommendNextTopic(studentId, courseId)));
    }

    @GetMapping("/{courseId}/recommendation")
    public ResponseEntity<ApiResponse<CourseResponse>> getNextCourseRecommendation(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long studentId) {
        com.example.skillforge.model.entity.Course nextCourse = courseRecommendationService
                .recommendNextCourse(courseId, studentId);
        if (nextCourse == null) {
            return ResponseEntity.ok(ApiResponse.success("No specific recommendation found", null));
        }
        // Map to response (simplified mapping here, ideally use mapper)
        CourseResponse response = mapToResponse(nextCourse);
        return ResponseEntity.ok(ApiResponse.success("Next course recommendation", response));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getDashboardRecommendations(@RequestParam Long studentId) {
        List<com.example.skillforge.model.entity.Course> courses = courseRecommendationService
                .recommendCoursesForDashboard(studentId);
        List<CourseResponse> response = courses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Recommended courses", response));
    }

    private CourseResponse mapToResponse(com.example.skillforge.model.entity.Course course) {
        // Simple manual mapping or use existing mapper
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .difficultyLevel(course.getDifficultyLevel())
                .thumbnailUrl(course.getThumbnailUrl())
                // .instructorName(...) - skip complex fields for now or fetch properly
                .build();
    }
}
