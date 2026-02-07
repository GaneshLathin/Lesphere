package com.example.skillforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Comprehensive dashboard response with all student performance metrics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverallDashboardResponse {
    
    // Course Statistics
    private Integer totalCoursesEnrolled;
    private Integer coursesCompleted;
    private Integer coursesInProgress;
    private Double averageCourseCompletion;
    
    // Quiz Statistics
    private QuizMetrics quizMetrics;
    
    // Topic Statistics
    private TopicMetrics topicMetrics;
    
    // Material Statistics (Videos, Documents, etc.)
    private MaterialMetrics materialMetrics;
    
    // Time Statistics
    private TimeMetrics timeMetrics;
    
    // Performance Overview
    private PerformanceOverview performanceOverview;
    
    // Recent Activity
    private List<RecentActivityItem> recentActivities;
    
    // Learning Streak
    private StreakInfo streakInfo;
    
    // Badges and Achievements
    private List<String> badges;
    
    // Course-wise breakdown
    private List<CoursePerformanceSummary> coursePerformances;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizMetrics {
        private Integer totalQuizzesTaken;
        private Integer totalQuizzesAvailable;
        private Double averageScore;
        private Double accuracyRate;
        private Integer totalQuestionsAnswered;
        private Integer totalCorrectAnswers;
        private Integer highestScore;
        private Integer lowestScore;
        private String performanceLevel; // EXCELLENT, GOOD, AVERAGE, NEEDS_IMPROVEMENT
        private Boolean isImproving;
        private Double improvementRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicMetrics {
        private Integer totalTopicsAvailable;
        private Integer topicsCompleted;
        private Integer topicsInProgress;
        private Double completionRate;
        private Integer totalTopicsEnrolled;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialMetrics {
        private Integer totalMaterialsAvailable;
        private Integer materialsCompleted;
        private Double completionRate;
        private VideoMetrics videos;
        private DocumentMetrics documents;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoMetrics {
        private Integer totalVideos;
        private Integer videosWatched;
        private Double completionRate;
        private Integer totalWatchTimeMinutes;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentMetrics {
        private Integer totalDocuments;
        private Integer documentsRead;
        private Double completionRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeMetrics {
        private Integer totalLearningTimeMinutes;
        private Integer averageSessionTimeMinutes;
        private Integer totalQuizTimeMinutes;
        private Integer thisWeekTimeMinutes;
        private Integer todayTimeMinutes;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceOverview {
        private Integer overallSkillScore; // 0-100
        private String skillLevel; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
        private String strongestArea; // QUIZZES, TOPICS, MATERIALS
        private String needsImprovement; // Area that needs work
        private Double overallProgress; // Overall completion percentage
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityItem {
        private String activityType; // QUIZ_COMPLETED, TOPIC_COMPLETED, MATERIAL_VIEWED, COURSE_ENROLLED
        private String title;
        private String courseName;
        private String timestamp;
        private String score; // for quizzes
        private String details;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StreakInfo {
        private Integer currentStreak;
        private Integer longestStreak;
        private List<String> activeDaysThisWeek;
        private Boolean isActiveToday;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoursePerformanceSummary {
        private Long courseId;
        private String courseName;
        private Double completionPercentage;
        private Integer quizzesTaken;
        private Double averageQuizScore;
        private Integer topicsCompleted;
        private Integer materialsCompleted;
        private String performanceLevel;
    }
}
