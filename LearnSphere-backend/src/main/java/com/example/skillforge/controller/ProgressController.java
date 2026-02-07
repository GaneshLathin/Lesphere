package com.example.skillforge.controller;

import com.example.skillforge.dto.request.TopicCompleteRequest;
import com.example.skillforge.dto.response.ProgressResponse;
import com.example.skillforge.dto.response.ProgressSummaryResponse;
import com.example.skillforge.model.entity.CourseProgress;
import com.example.skillforge.model.entity.Topic;
import com.example.skillforge.model.entity.TopicProgress;
import com.example.skillforge.repository.CourseRepository;
import com.example.skillforge.repository.CourseProgressRepository;
import com.example.skillforge.repository.TopicProgressRepository;
import com.example.skillforge.repository.TopicRepository;
import com.example.skillforge.service.CourseProgressService;
import com.example.skillforge.service.ProgressService;
import com.example.skillforge.service.TopicProgressService;
import com.example.skillforge.dto.response.ApiResponse;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final TopicProgressService topicProgressService;
    private final CourseProgressService courseProgressService;
    private final CourseProgressRepository courseProgressRepository;
    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final ProgressService progressService;
    private final TopicProgressRepository topicProgressRepository;

    public ProgressController(TopicProgressService topicProgressService, CourseProgressService courseProgressService,
            CourseProgressRepository courseProgressRepository,
            CourseRepository courseRepository,
            TopicRepository topicRepository, ProgressService progressService,
            TopicProgressRepository topicProgressRepository) {
        this.topicProgressService = topicProgressService;
        this.courseProgressService = courseProgressService;
        this.courseProgressRepository = courseProgressRepository;
        this.courseRepository = courseRepository;
        this.topicRepository = topicRepository;
        this.progressService = progressService;
        this.topicProgressRepository = topicProgressRepository;

    }

    /**
     * Get progress rows for a student.
     * Returns an array of ProgressResponse (course-level progress).
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getProgressForStudent(@PathVariable Long studentId) {
        List<CourseProgress> cps = courseProgressRepository.findByStudentId(studentId);
        List<ProgressResponse> resp = new ArrayList<>();

        for (CourseProgress cp : cps) {
            ProgressResponse p = new ProgressResponse();
            p.setId(cp.getId());
            p.setStudentId(cp.getStudentId());
            p.setCourseId(cp.getCourseId());
            p.setCompletionPercentage(cp.getProgressPercent() == null ? 0 : cp.getProgressPercent());
            p.setSkillScore(null); // if you have skillScore in CourseProgress, set here
            p.setLastAccessed(cp.getLastUpdated());

            // fetch course name if possible
            Optional<com.example.skillforge.model.entity.Course> courseOpt = courseRepository
                    .findById(cp.getCourseId());
            courseOpt.ifPresent(c -> p.setCourseName(c.getTitle()));

            resp.add(p);
        }

        return ResponseEntity.ok(ApiResponse.success("Progress fetched", resp));
    }

    // ✅ MAIN WORKING ENDPOINT (Replace your old one)
    @PostMapping("/topic/complete")
    public ResponseEntity<ApiResponse<TopicProgress>> completeTopic(@RequestBody TopicCompleteRequest req) {

        Long studentId = req.getStudentId();
        Long topicId = req.getTopicId();

        if (studentId == null || topicId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("studentId and topicId are required"));
        }

        // Mark topic completed
        TopicProgress tp = topicProgressService.markCompleted(studentId, topicId);

        // Find courseId for this topic
        Topic topic = topicRepository.findById(topicId).orElse(null);
        if (topic != null) {
            Long courseId = topic.getCourse().getId();

            // Update parent course progress also
            // courseProgressService.updateProgress(studentId, courseId);
        }

        return ResponseEntity.ok(ApiResponse.success("Topic completed", tp));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<ApiResponse<ProgressSummaryResponse>> getStudentSummary(@PathVariable Long studentId) {

        ProgressSummaryResponse summary = progressService.getStudentProgressSummary(studentId);

        return ResponseEntity.ok(ApiResponse.success("Student progress summary", summary));
    }

    // new endpoint
    @PostMapping("/topic/add-time")
    public ResponseEntity<ApiResponse<TopicProgress>> addTimeToTopic(@RequestBody AddTimeRequest req) {
        if (req.getStudentId() == null || req.getTopicId() == null || req.getSeconds() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("studentId, topicId, and seconds are required"));
        }
        TopicProgress updated = topicProgressService.addTimeToTopic(req.getStudentId(), req.getTopicId(),
                req.getSeconds());
        return ResponseEntity.ok(ApiResponse.success("Time added", updated));
    }

    @GetMapping("/student/{studentId}/topics")
    public ResponseEntity<ApiResponse<List<TopicProgress>>> getTopicProgressForStudent(@PathVariable Long studentId) {
        List<TopicProgress> list = topicProgressService.getProgressForStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Topic progress fetched", list));
    }

    // DTO
    @Data
    public static class TopicCompleteRequest {
        private Long studentId;
        private Long topicId;
    }

    // DTO for adding time:
    @Data
    public static class AddTimeRequest {
        private Long studentId;
        private Long topicId;
        private Long seconds; // seconds to add
    }
}
