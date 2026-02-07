package com.example.skillforge.service.impl;

import com.example.skillforge.model.entity.Course;
import com.example.skillforge.model.entity.CourseProgress;
import com.example.skillforge.model.entity.Enrollment;
import com.example.skillforge.repository.CourseProgressRepository;
import com.example.skillforge.repository.EnrollmentRepository;
import com.example.skillforge.repository.TopicProgressRepository;
import com.example.skillforge.repository.TopicRepository;
import com.example.skillforge.service.CourseProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CourseProgressServiceImpl implements CourseProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final TopicProgressRepository topicProgressRepository;
    private final TopicRepository topicRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final com.example.skillforge.repository.StudentRepository studentRepository;
    private final com.example.skillforge.service.UserActivityService userActivityService;

    @Override
    public void updateProgress(Long studentId, Long courseId, Long lastCompletedTopicId) {

        // Fetch all topic IDs for the course
        java.util.List<com.example.skillforge.model.entity.Topic> topics = topicRepository.findByCourseId(courseId);
        if (topics.isEmpty()) return;
        
        long totalTopics = topics.size();
        java.util.List<Long> topicIds = topics.stream().map(com.example.skillforge.model.entity.Topic::getId).toList();

        // Fetch progress for these topics
        java.util.List<com.example.skillforge.model.entity.TopicProgress> progresses = 
            topicProgressRepository.findByStudentIdAndTopicIdIn(studentId, topicIds);
            
        long completedTopics = progresses.stream()
            .filter(tp -> Boolean.TRUE.equals(tp.getCompleted()))
            .count();

        int percent = (int) ((completedTopics * 100.0) / totalTopics);

        // find or create course progress row
        CourseProgress cp = courseProgressRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseGet(() -> {
                    CourseProgress c = new CourseProgress();
                    c.setStudentId(studentId);
                    c.setCourseId(courseId);
                    c.setProgressPercent(percent);
                    return c;
                });

        cp.setProgressPercent(percent);
        cp.setLastTopicId(lastCompletedTopicId);
        cp.setLastUpdated(LocalDateTime.now());
        
        System.out.println("DEBUG: CourseProgressServiceImpl: Saving progress for Student " + studentId + 
                           ", Course " + courseId + 
                           ", LastTopic " + lastCompletedTopicId + 
                           ", Percent " + percent);

        courseProgressRepository.save(cp);
         // ---------------- Enrollment (UI source of truth)
        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setCompletionPercentage(percent);

        if (percent >= 100) {
            enrollment.setIsCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
        } else {
            enrollment.setIsCompleted(false);
            enrollment.setCompletedAt(null);
        }

        enrollmentRepository.save(enrollment);

        // Log Activity
        try {
            studentRepository.findById(studentId).ifPresent(student -> {
                userActivityService.logActivity(student.getUser().getId());
            });
        } catch (Exception e) {
            // Silently fail logging to not disrupt progress update
        }
    }
    @Override
    public void addTimeSpent(Long studentId, Long courseId, int minutes) {
        System.out.println("DEBUG: addingTimeSpent - Student: " + studentId + ", Course: " + courseId + ", Minutes: " + minutes);
        CourseProgress cp = courseProgressRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseGet(() -> {
                    CourseProgress c = new CourseProgress();
                    c.setStudentId(studentId);
                    c.setCourseId(courseId);
                    c.setProgressPercent(0);
                    c.setTotalTimeMinutes(0);
                    return c;
                });

        int current = cp.getTotalTimeMinutes() != null ? cp.getTotalTimeMinutes() : 0;
        cp.setTotalTimeMinutes(current + minutes);
        cp.setLastUpdated(LocalDateTime.now());
        
        courseProgressRepository.save(cp);
    }
}
