package com.example.skillforge.model.dto.analytics;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    @Data
    @Builder
    public static class StudentAnalytics {
        private List<CourseProgress> courseCompletion;
        private List<QuizPerformance> quizPerformance;
        private List<SkillGrowth> skillGrowth; // Mocked for now or derived from tags
        private List<WeeklyActivity> weeklyLearningTime;
        private Integer totalLearningMinutes; // Total lifetime learning
        // private List<CertificateTimeline> certificates; // Add later if needed
    }

    @Data
    @Builder
    public static class InstructorAnalytics {
        private List<SimpleMetric> totalStudents;
        private List<PieMetric> courseCompletionRate;
        private List<ActivityTrend> studentEngagement;
        private List<SimpleMetric> quizScoreDistribution;
        private SummaryMetrics summary;
    }

    @Data
    @Builder
    public static class SummaryMetrics {
        private Long totalStudents; // Distinct count
        private Long activeCourses;
        private Double avgRating;
        private String completionRate;
    }

    @Data
    @Builder
    public static class AdminAnalytics {
        private List<PieMetric> userRoleDistribution;
        private List<TimeMetric> platformGrowth;
        private List<TimeMetric> activeUsers;
        private SystemHealth systemHealth;
        private List<CoursePopularity> topCourses;
    }

    // Shared Helper Classes
    @Data
    @Builder
    public static class CourseProgress {
        private String courseName;
        private Integer completionPercentage;
    }

    @Data
    @Builder
    public static class QuizPerformance {
        private String quizTitle;
        private String courseName;
        private Double score;
        private Double average;
    }

    @Data
    @Builder
    public static class CoursePopularity {
        private String name;
        private Long students;
        private Double rating;
    }

    @Data
    @Builder
    public static class SkillGrowth {
        private String subject;
        private Integer score; // A
        private Integer fullMark;
    }

    @Data
    @Builder
    public static class WeeklyActivity {
        private String day;
        private Double hours;
    }

    @Data
    @Builder
    public static class SimpleMetric {
        private String name; // e.g. Course Name or Range
        private Number value; // e.g. Count
    }

    @Data
    @Builder
    public static class PieMetric {
        private String name;
        private Number value;
    }

    @Data
    @Builder
    public static class ActivityTrend {
        private String period; // Week/Month
        private Integer active;
        private Integer passive;
    }

    @Data
    @Builder
    public static class TimeMetric {
        private String time;
        private Number value;
    }

    @Data
    @Builder
    public static class SystemHealth {
        private Double serverLoad;
        private String dbLatency;
        private String uptime;
        private Double errors;
    }
}
