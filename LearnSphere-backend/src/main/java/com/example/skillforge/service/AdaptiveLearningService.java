package com.example.skillforge.service;

import com.example.skillforge.dto.response.ProgressResponse;
import com.example.skillforge.model.entity.CourseProgress;
import com.example.skillforge.model.entity.Progress;
import com.example.skillforge.model.entity.Topic;
import com.example.skillforge.repository.CourseProgressRepository;
import com.example.skillforge.repository.ProgressRepository;
import com.example.skillforge.repository.TopicRepository;
import com.example.skillforge.repository.QuizAttemptRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdaptiveLearningService {

    private final CourseProgressRepository courseProgressRepository;
    private final TopicRepository topicRepository;
    private final ProgressRepository progressRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public com.example.skillforge.dto.response.TopicRecommendationResponse recommendNextTopic(Long studentId, Long courseId) {

        // Load all topics for this course
        List<Topic> topics = topicRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        if (topics.isEmpty()) return null;

        // Load course progress
        Optional<CourseProgress> cpOpt =
                courseProgressRepository.findByStudentIdAndCourseId(studentId, courseId);

        // No progress → start with first topic
        if (cpOpt.isEmpty()) {
            System.out.println("DEBUG: AdaptiveLearning: CourseProgress NOT FOUND for Student " + studentId + ", Course " + courseId);
            return mapToResponse(topics.get(0), "NEXT_TOPIC", "Start your journey here!");
        }

        CourseProgress cp = cpOpt.get();
        Long lastTopicId = cp.getLastTopicId();

        // If last topic is null → start with first topic
        if (lastTopicId == null) {
            System.out.println("DEBUG: AdaptiveLearning: lastTopicId is NULL for Student " + studentId + ", Course " + courseId);
            return mapToResponse(topics.get(0), "NEXT_TOPIC", "Start your journey here!");
        }

        // Find index
        int index = -1;
        for (int i = 0; i < topics.size(); i++) {
            if (topics.get(i).getId().equals(lastTopicId)) {
                index = i;
                break;
            }
        }
        
        // Fallback if topic not found
        if (index == -1) index = 0;

        // ADAPTIVE LOGIC: Check Quiz Score for the last topic
        Double lastQuizScore = getLastQuizScore(studentId, lastTopicId);
        
        System.out.println("DEBUG: AdaptiveLearning: lastTopicId=" + lastTopicId);
        System.out.println("DEBUG: AdaptiveLearning: lastQuizScore=" + lastQuizScore);
        System.out.println("DEBUG: AdaptiveLearning: index=" + index);
        
        Topic nextTopic = null;
        String recType = "NEXT_TOPIC";
        String recReason = "Keep moving forward!";

        // 1. REVISION (< 30%): Stay on same topic
        if (lastQuizScore != null && lastQuizScore < 30.0) {
            recType = "REVISION";
            recReason = "Review logic: Your last quiz score was below 30%. Let's solidify the basics.";
            nextTopic = topics.get(index);
        }
        // 2. PRACTICE (30-70%): Suggest Practice or Next (for now, simply move next with warning, or stay)
        else if (lastQuizScore != null && lastQuizScore >= 30.0 && lastQuizScore < 70.0) {
             recType = "PRACTICE";
             recReason = "Good start! Correct answers show potential. Try some practice exercises before the main exam.";
             nextTopic = topics.get(Math.min(index + 1, topics.size() - 1));
        }
        // 3. MASTERY (> 70%) or No Quiz yet: Move Forward
        else {
            recType = "NEXT_TOPIC";
            recReason = "Mastery achieved! Moving to the next concept.";
            // If index is last one, we are done
            if (index >= topics.size() - 1) {
                 return null; // Course Completed
            }
            nextTopic = topics.get(index + 1);
        }

        // Save progress details
        cp.setCurrentRecommendationType(recType);
        cp.setRecommendationReason(recReason);
        courseProgressRepository.save(cp);
        
        return mapToResponse(nextTopic, recType, recReason);
    }
    
    private com.example.skillforge.dto.response.TopicRecommendationResponse mapToResponse(Topic topic, String type, String reason) {
        return com.example.skillforge.dto.response.TopicRecommendationResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .description(topic.getDescription())
                .level(topic.getLevel() != null ? topic.getLevel().name() : "BEGINNER")
                .duration(15) // Default duration as not present in entity
                .recommendationType(type)
                .recommendationReason(reason)
                .build();
    }
    


    private Double getLastQuizScore(Long studentId, Long topicId) {
        if (topicId == null) return null;
        return quizAttemptRepository.findMaxScoreByTopicIdAndStudentId(topicId, studentId);
    }

    @Transactional
    public ProgressResponse updateProgress(Progress progress) {
        Progress saved = progressRepository.save(progress);

        return ProgressResponse.builder()
                .id(saved.getId())
                .studentId(saved.getStudent().getId())
                .courseId(saved.getCourse().getId())
                .completionPercentage(saved.getCompletionPercentage())
                .currentTopicId(saved.getCurrentTopicId())
                .skillScore(saved.getSkillScore())
                .lastAccessed(saved.getLastAccessed())
                .build();
    }
}
