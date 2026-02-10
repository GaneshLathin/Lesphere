package com.example.skillforge.service.impl;

import com.example.skillforge.model.entity.*;
import com.example.skillforge.repository.*;
import com.example.skillforge.service.CourseProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseProgressServiceImpl implements CourseProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final TopicRepository topicRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final com.example.skillforge.repository.StudentRepository studentRepository;
    private final com.example.skillforge.service.UserActivityService userActivityService;

    // Granular tracking repositories
    private final MaterialRepository materialRepository;
    private final QuizRepository quizRepository;
    private final TopicMaterialProgressRepository materialProgressRepository;
    private final TopicQuizProgressRepository quizProgressRepository;
    private final TopicProgressRepository topicProgressRepository; // Still needed for lastCompletedTopicId logic if any

    @Override
    public void updateProgress(Long studentId, Long courseId, Long lastCompletedTopicId) {

        // 1. Fetch all topics for the course
        List<Topic> topics = topicRepository.findByCourseId(courseId);
        if (topics.isEmpty())
            return;

        List<Long> topicIds = topics.stream().map(Topic::getId).toList();

        // 2. Calculate Total Items (Materials + Quizzes)
        // Note: This could be optimized with custom JPQL queries if performance becomes
        // an issue
        long totalMaterials = 0;
        long totalQuizzes = 0;

        for (Long topicId : topicIds) {
            totalMaterials += materialRepository.countByTopicId(topicId);
            totalQuizzes += quizRepository.findByTopicId(topicId).size();
        }

        long totalItems = totalMaterials + totalQuizzes;

        // 3. Calculate Completed Items
        long completedMaterials = 0;
        long completedQuizzes = 0;

        // Fetch all material progress for these topics (or student in general if
        // easier, but filtering by topic is safer)
        // Optimization: Fetch all material IDs for the course first
        List<Material> allMaterials = topics.stream()
                .flatMap(t -> materialRepository.findByTopicId(t.getId()).stream())
                .toList();
        List<Long> allMaterialIds = allMaterials.stream().map(Material::getId).toList();

        if (!allMaterialIds.isEmpty()) {
            completedMaterials = materialProgressRepository.findByStudentIdAndMaterialIdIn(studentId, allMaterialIds)
                    .stream()
                    .filter(TopicMaterialProgress::getCompleted)
                    .count();
        }

        // Fetch all quiz progress
        // Optimization: We can just check quiz progress for the topics
        for (Long topicId : topicIds) {
            // Check if quiz exists for topic
            List<Quiz> quizzes = quizRepository.findByTopicId(topicId);
            if (!quizzes.isEmpty()) {
                // Assuming 1 quiz per topic usually, but let's be generic
                // If the QuizProgress exists and is completed (or has score?), count it.
                // TopicQuizProgress is linked by topicId, not quizId directly in the current
                // entity structure?
                // Let's check TopicQuizProgress entity: it has topicId.
                // So if TopicQuizProgress exists for a topic, does it mean the quiz is done?
                // The entity has 'completed' boolean.
                boolean isTopicQuizCompleted = quizProgressRepository.findByStudentIdAndTopicId(studentId, topicId)
                        .map(TopicQuizProgress::getCompleted)
                        .orElse(false);

                if (isTopicQuizCompleted) {
                    completedQuizzes += quizzes.size(); // If topic quiz is done, all quizzes in topic are done?
                    // Actually TopicQuizProgress seems 1:1 with Topic.
                    // If there are multiple quizzes in a topic, the current model might be limited.
                    // But usually it's 1 quiz per topic.
                }

                System.out.println(
                        "DEBUG: Topic " + topicId + " -> Materials: " + materialRepository.countByTopicId(topicId) +
                                ", Quizzes: " + quizzes.size() +
                                " | Completed Quizzes: " + (isTopicQuizCompleted ? quizzes.size() : 0));
            } else {
                System.out.println("DEBUG: Topic " + topicId + " -> Materials: "
                        + materialRepository.countByTopicId(topicId) + ", Quizzes: 0");
            }
        }

        System.out.println("DEBUG: Total Materials: " + totalMaterials + ", Total Quizzes: " + totalQuizzes);
        System.out.println(
                "DEBUG: Completed Materials: " + completedMaterials + ", Completed Quizzes: " + completedQuizzes);
        System.out.println(
                "DEBUG: Total Items: " + totalItems + " | Completed Items: " + (completedMaterials + completedQuizzes));

        long completedItems = completedMaterials + completedQuizzes;

        int percent = 0;
        if (totalItems > 0) {
            percent = (int) ((completedItems * 100.0) / totalItems);
        } else {
            // If no content, maybe 100%? Or 0? Let's say 100 if course is empty?
            // Usually 0 if nothing to do.
            percent = (topics.isEmpty()) ? 0 : 100;
        }

        // Cap at 100
        if (percent > 100)
            percent = 100;

        // 4. Update CourseProgress
        int finalPercent = percent;
        CourseProgress cp = courseProgressRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseGet(() -> {
                    CourseProgress c = new CourseProgress();
                    c.setStudentId(studentId);
                    c.setCourseId(courseId);
                    c.setProgressPercent(finalPercent);
                    return c;
                });

        cp.setProgressPercent(percent);
        // We can still track last topic, but it's less relevant for calculation now
        if (lastCompletedTopicId != null) {
            cp.setLastTopicId(lastCompletedTopicId);
        }
        cp.setLastUpdated(LocalDateTime.now());

        System.out.println("DEBUG: Granular Progress - Student " + studentId +
                ", Course " + courseId +
                ", Materials " + completedMaterials + "/" + totalMaterials +
                ", Quizzes " + completedQuizzes + "/" + totalQuizzes +
                ", Total " + completedItems + "/" + totalItems +
                ", Percent " + percent);

        courseProgressRepository.save(cp);

        // 5. Update Enrollment
        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setCompletionPercentage(percent);

        if (percent >= 100) {
            if (!Boolean.TRUE.equals(enrollment.getIsCompleted())) {
                enrollment.setIsCompleted(true);
                enrollment.setCompletedAt(LocalDateTime.now());
            }
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
            // Silently fail logging
        }
    }

    @Override
    public void addTimeSpent(Long studentId, Long courseId, int minutes) {
        System.out.println(
                "DEBUG: addingTimeSpent - Student: " + studentId + ", Course: " + courseId + ", Minutes: " + minutes);
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
