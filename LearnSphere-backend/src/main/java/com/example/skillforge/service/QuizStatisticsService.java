package com.example.skillforge.service;

import com.example.skillforge.dto.response.QuizAttemptDetailResponse;
import com.example.skillforge.dto.response.QuizStatisticsResponse;
import com.example.skillforge.dto.response.QuizTrackingResponse;
import com.example.skillforge.model.entity.*;
import com.example.skillforge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for comprehensive quiz tracking and statistics
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuizStatisticsService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final QuestionRepository questionRepository;

    /**
     * Get comprehensive quiz statistics for a student in a specific course
     */
    /**
     * Get comprehensive quiz statistics for a student in a specific course
     */
    public QuizStatisticsResponse getCourseQuizStatistics(Long studentId, Long courseId) {
        
        // Get all quiz attempts for this student in this course
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdAndCourseId(studentId, courseId);
        
        if (attempts.isEmpty()) {
            return buildEmptyStatistics(studentId, courseId);
        }
        
        // Calculate statistics
        int totalAttempts = attempts.size();
        
        // Score statistics
        List<Double> scores = attempts.stream()
                .map(QuizAttempt::getScore)
                .filter(score -> score != null)
                .collect(Collectors.toList());
        
        // USE PEAK SCORE LOGIC (Average of Best Attempts)
        double averageScore = calculateAveragePeakScore(attempts);
        
        double totalScore = scores.stream()
                .mapToDouble(Double::doubleValue)
                .sum();
        
        double highestScore = scores.stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);
        
        double lowestScore = scores.stream()
                .mapToDouble(Double::doubleValue)
                .min()
                .orElse(0.0);
        
        // Time statistics
        int totalTimeSpent = attempts.stream()
                .map(QuizAttempt::getTimeSpent)
                .filter(time -> time != null)
                .mapToInt(Integer::intValue)
                .sum();
        
        int averageTime = totalAttempts > 0 ? totalTimeSpent / totalAttempts : 0;
        
        // Get total available quizzes in course
        int totalQuizzesAvailable = getTotalQuizzesInCourse(courseId);
        
        // Calculate completion rate
        double completionRate = totalQuizzesAvailable > 0 
                ? (totalAttempts * 100.0) / totalQuizzesAvailable 
                : 0.0;
        
        // Calculate total questions and correct answers
        int totalQuestions = calculateTotalQuestions(attempts);
        int totalCorrectAnswers = calculateTotalCorrectAnswers(attempts);
        double accuracyRate = totalQuestions > 0 
                ? (totalCorrectAnswers * 100.0) / totalQuestions 
                : 0.0;
        
        // Determine performance level
        PerformanceLevel performance = determinePerformanceLevel(averageScore);
        
        // Calculate improvement trend
        boolean isImproving = calculateImprovementTrend(attempts);
        double improvementRate = calculateImprovementRate(attempts);
        
        // Get course name
        String courseName = courseRepository.findById(courseId)
                .map(Course::getTitle)
                .orElse("Unknown Course");
        
        return QuizStatisticsResponse.builder()
                .studentId(studentId)
                .courseId(courseId)
                .courseName(courseName)
                .totalQuizzesTaken(totalAttempts)
                .totalQuizzesAvailable(totalQuizzesAvailable)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .averageScore(Math.round(averageScore * 100.0) / 100.0)
                .totalScore(Math.round(totalScore * 100.0) / 100.0)
                .highestScore(Math.round(highestScore * 100.0) / 100.0)
                .lowestScore(Math.round(lowestScore * 100.0) / 100.0)
                .performanceLevel(performance.getLevel())
                .performanceMessage(performance.getMessage())
                .performanceColor(performance.getColor())
                .totalTimeSpent(totalTimeSpent)
                .averageTimePerQuiz(averageTime)
                .totalCorrectAnswers(totalCorrectAnswers)
                .totalQuestions(totalQuestions)
                .accuracyRate(Math.round(accuracyRate * 100.0) / 100.0)
                .isImproving(isImproving)
                .improvementRate(Math.round(improvementRate * 100.0) / 100.0)
                .build();
    }

    /**
     * Get overall quiz statistics for a student (across all courses)
     */
    public QuizStatisticsResponse getOverallQuizStatistics(Long studentId) {
        
        List<QuizAttempt> allAttempts = quizAttemptRepository.findByStudentId(studentId);
        
        if (allAttempts.isEmpty()) {
            return buildEmptyOverallStatistics(studentId);
        }
        
        int totalAttempts = allAttempts.size();
        
        // Score statistics
        List<Double> scores = allAttempts.stream()
                .map(QuizAttempt::getScore)
                .filter(score -> score != null)
                .collect(Collectors.toList());
        
        // USE PEAK SCORE LOGIC (Average of Best Attempts)
        double averageScore = calculateAveragePeakScore(allAttempts);
        
        double totalScore = scores.stream()
                .mapToDouble(Double::doubleValue)
                .sum();
        
        double highestScore = scores.stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);
        
        double lowestScore = scores.stream()
                .mapToDouble(Double::doubleValue)
                .min()
                .orElse(0.0);
        
        // Time statistics
        int totalTimeSpent = allAttempts.stream()
                .map(QuizAttempt::getTimeSpent)
                .filter(time -> time != null)
                .mapToInt(Integer::intValue)
                .sum();
        
        int averageTime = totalAttempts > 0 ? totalTimeSpent / totalAttempts : 0;
        
        // Calculate total questions and correct answers
        int totalQuestions = calculateTotalQuestions(allAttempts);
        int totalCorrectAnswers = calculateTotalCorrectAnswers(allAttempts);
        double accuracyRate = totalQuestions > 0 
                ? (totalCorrectAnswers * 100.0) / totalQuestions 
                : 0.0;
        
        // Determine performance level
        PerformanceLevel performance = determinePerformanceLevel(averageScore);
        
        // Calculate improvement trend
        boolean isImproving = calculateImprovementTrend(allAttempts);
        double improvementRate = calculateImprovementRate(allAttempts);
        
        return QuizStatisticsResponse.builder()
                .studentId(studentId)
                .courseId(null)
                .courseName("All Courses")
                .totalQuizzesTaken(totalAttempts)
                .totalQuizzesAvailable(null)
                .completionRate(null)
                .averageScore(Math.round(averageScore * 100.0) / 100.0)
                .totalScore(Math.round(totalScore * 100.0) / 100.0)
                .highestScore(Math.round(highestScore * 100.0) / 100.0)
                .lowestScore(Math.round(lowestScore * 100.0) / 100.0)
                .performanceLevel(performance.getLevel())
                .performanceMessage(performance.getMessage())
                .performanceColor(performance.getColor())
                .totalTimeSpent(totalTimeSpent)
                .averageTimePerQuiz(averageTime)
                .totalCorrectAnswers(totalCorrectAnswers)
                .totalQuestions(totalQuestions)
                .accuracyRate(Math.round(accuracyRate * 100.0) / 100.0)
                .isImproving(isImproving)
                .improvementRate(Math.round(improvementRate * 100.0) / 100.0)
                .build();
    }

    /**
     * Helper to calculate Average of PEAK scores per quiz
     * (Avoids dragging down average with failed attempts)
     */
    private double calculateAveragePeakScore(List<QuizAttempt> attempts) {
        if (attempts.isEmpty()) return 0.0;

        // Group by Quiz ID and find max score for each
        java.util.Map<Long, Double> quizMaxScores = attempts.stream()
                .filter(a -> a.getQuiz() != null && a.getScore() != null)
                .collect(Collectors.toMap(
                        a -> a.getQuiz().getId(),
                        QuizAttempt::getScore,
                        Math::max
                ));

        return quizMaxScores.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    /**
     * Get comprehensive quiz tracking with statistics and attempt history
     */
    public QuizTrackingResponse getQuizTracking(Long studentId, Long courseId) {
        
        QuizStatisticsResponse statistics = getCourseQuizStatistics(studentId, courseId);
        
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdAndCourseId(studentId, courseId);
        
        // Get recent attempts (last 10)
        List<QuizAttemptDetailResponse> recentAttempts = attempts.stream()
                .limit(10)
                .map(this::convertToDetailResponse)
                .collect(Collectors.toList());
        
        // Get top performances (top 5)
        List<QuizAttemptDetailResponse> topPerformances = attempts.stream()
                .sorted(Comparator.comparing(QuizAttempt::getScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::convertToDetailResponse)
                .collect(Collectors.toList());
        
        // Get attempts that need improvement (bottom 5 by score)
        List<QuizAttemptDetailResponse> needsImprovement = attempts.stream()
                .filter(a -> a.getScore() != null && a.getScore() < 60.0)
                .sorted(Comparator.comparing(QuizAttempt::getScore, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(5)
                .map(this::convertToDetailResponse)
                .collect(Collectors.toList());
        
        return QuizTrackingResponse.builder()
                .statistics(statistics)
                .recentAttempts(recentAttempts)
                .topPerformances(topPerformances)
                .needsImprovement(needsImprovement)
                .build();
    }

    /**
     * Convert QuizAttempt to QuizAttemptDetailResponse
     */
    private QuizAttemptDetailResponse convertToDetailResponse(QuizAttempt attempt) {
        Quiz quiz = attempt.getQuiz();
        Topic topic = quiz != null ? quiz.getTopic() : null;
        
        long totalQuestions = quiz != null ? questionRepository.countByQuizId(quiz.getId()) : 0L;
        int correctAnswers = calculateCorrectAnswersForAttempt(attempt);
        
        double percentage = totalQuestions > 0 
                ? (correctAnswers * 100.0) / totalQuestions 
                : 0.0;
        
        PerformanceLevel performance = determinePerformanceLevel(attempt.getScore());
        
        return QuizAttemptDetailResponse.builder()
                .attemptId(attempt.getId())
                .quizId(quiz != null ? quiz.getId() : null)
                .quizTitle(quiz != null ? quiz.getTitle() : "Unknown Quiz")
                .topicId(topic != null ? topic.getId() : null)
                .topicName(topic != null ? topic.getName() : "Unknown Topic")
                .score(attempt.getScore())
                .correctAnswers(correctAnswers)
                .totalQuestions((int) totalQuestions)
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .timeSpent(attempt.getTimeSpent())
                .status(attempt.getStatus())
                .attemptTime(attempt.getAttemptTime())
                .performanceLevel(performance.getLevel())
                .performanceColor(performance.getColor())
                .build();
    }

    /**
     * Calculate total questions across all attempts
     */
    private int calculateTotalQuestions(List<QuizAttempt> attempts) {
        return attempts.stream()
                .mapToInt(attempt -> {
                    Quiz quiz = attempt.getQuiz();
                    Long count = quiz != null ? questionRepository.countByQuizId(quiz.getId()) : 0L;
                    return count != null ? count.intValue() : 0;
                })
                .sum();
    }

    /**
     * Calculate total correct answers across all attempts
     */
    private int calculateTotalCorrectAnswers(List<QuizAttempt> attempts) {
        return attempts.stream()
                .mapToInt(this::calculateCorrectAnswersForAttempt)
                .sum();
    }

    /**
     * Calculate correct answers for a single attempt
     */
    private int calculateCorrectAnswersForAttempt(QuizAttempt attempt) {
        Quiz quiz = attempt.getQuiz();
        if (quiz == null) return 0;
        
        Long totalQuestionsLong = questionRepository.countByQuizId(quiz.getId());
        int totalQuestions = totalQuestionsLong != null ? totalQuestionsLong.intValue() : 0;
        Double score = attempt.getScore();
        
        if (score == null || totalQuestions == 0) return 0;
        
        // Estimate correct answers based on score percentage
        return (int) Math.round((score / 100.0) * totalQuestions);
    }

    /**
     * Get total number of quizzes in a course
     */
    private int getTotalQuizzesInCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId).size();
    }

    /**
     * Determine performance level based on average score
     */
    private PerformanceLevel determinePerformanceLevel(Double score) {
        if (score == null) score = 0.0;
        
        if (score >= 90.0) {
            return new PerformanceLevel("EXCELLENT", "Outstanding Performance! 🌟", "#10b981");
        } else if (score >= 75.0) {
            return new PerformanceLevel("GOOD", "Great Job! Keep it up! 👍", "#3b82f6");
        } else if (score >= 60.0) {
            return new PerformanceLevel("AVERAGE", "Good effort, room for improvement 📈", "#f59e0b");
        } else {
            return new PerformanceLevel("NEEDS_IMPROVEMENT", "Keep practicing, you'll improve! 💪", "#ef4444");
        }
    }

    /**
     * Calculate if student is improving over time
     */
    private boolean calculateImprovementTrend(List<QuizAttempt> attempts) {
        if (attempts.size() < 2) return false;
        
        // Compare first half vs second half of attempts
        int midpoint = attempts.size() / 2;
        
        double firstHalfAvg = attempts.subList(0, midpoint).stream()
                .map(QuizAttempt::getScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
        
        double secondHalfAvg = attempts.subList(midpoint, attempts.size()).stream()
                .map(QuizAttempt::getScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
        
        return secondHalfAvg > firstHalfAvg;
    }

    /**
     * Calculate improvement rate percentage
     */
    private double calculateImprovementRate(List<QuizAttempt> attempts) {
        if (attempts.size() < 2) return 0.0;
        
        int midpoint = attempts.size() / 2;
        
        double firstHalfAvg = attempts.subList(0, midpoint).stream()
                .map(QuizAttempt::getScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
        
        double secondHalfAvg = attempts.subList(midpoint, attempts.size()).stream()
                .map(QuizAttempt::getScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
        
        if (firstHalfAvg == 0) return 0.0;
        
        return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100.0;
    }

    /**
     * Build empty statistics when no attempts exist
     */
    private QuizStatisticsResponse buildEmptyStatistics(Long studentId, Long courseId) {
        String courseName = courseRepository.findById(courseId)
                .map(Course::getTitle)
                .orElse("Unknown Course");
        
        int totalQuizzesAvailable = getTotalQuizzesInCourse(courseId);
        
        return QuizStatisticsResponse.builder()
                .studentId(studentId)
                .courseId(courseId)
                .courseName(courseName)
                .totalQuizzesTaken(0)
                .totalQuizzesAvailable(totalQuizzesAvailable)
                .completionRate(0.0)
                .averageScore(0.0)
                .totalScore(0.0)
                .highestScore(0.0)
                .lowestScore(0.0)
                .performanceLevel("NOT_STARTED")
                .performanceMessage("Start taking quizzes to track your progress!")
                .performanceColor("#6b7280")
                .totalTimeSpent(0)
                .averageTimePerQuiz(0)
                .totalCorrectAnswers(0)
                .totalQuestions(0)
                .accuracyRate(0.0)
                .isImproving(false)
                .improvementRate(0.0)
                .build();
    }

    /**
     * Build empty overall statistics
     */
    private QuizStatisticsResponse buildEmptyOverallStatistics(Long studentId) {
        return QuizStatisticsResponse.builder()
                .studentId(studentId)
                .courseId(null)
                .courseName("All Courses")
                .totalQuizzesTaken(0)
                .totalQuizzesAvailable(null)
                .completionRate(null)
                .averageScore(0.0)
                .totalScore(0.0)
                .highestScore(0.0)
                .lowestScore(0.0)
                .performanceLevel("NOT_STARTED")
                .performanceMessage("Start taking quizzes to track your progress!")
                .performanceColor("#6b7280")
                .totalTimeSpent(0)
                .averageTimePerQuiz(0)
                .totalCorrectAnswers(0)
                .totalQuestions(0)
                .accuracyRate(0.0)
                .isImproving(false)
                .improvementRate(0.0)
                .build();
    }

    /**
     * Inner class for performance level details
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    private static class PerformanceLevel {
        private String level;
        private String message;
        private String color;
    }
}
