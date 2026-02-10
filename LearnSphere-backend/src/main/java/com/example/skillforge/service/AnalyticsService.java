package com.example.skillforge.service;

import com.example.skillforge.model.dto.analytics.AnalyticsDTO;
import com.example.skillforge.model.enums.Role;
import com.example.skillforge.repository.EnrollmentRepository;
import com.example.skillforge.repository.QuizAttemptRepository;
import com.example.skillforge.repository.UserActivityRepository;
import com.example.skillforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.example.skillforge.model.entity.QuizAttempt;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final EnrollmentRepository enrollmentRepository;
        private final QuizAttemptRepository quizAttemptRepository;
        private final UserActivityRepository userActivityRepository;
        private final UserRepository userRepository;
        private final com.example.skillforge.repository.CourseRepository courseRepository;
        private final com.example.skillforge.repository.CourseProgressRepository courseProgressRepository;
        private final ProgressService progressService;

        public AnalyticsDTO.StudentAnalytics getStudentAnalytics(Long studentId) {
                // 1. Course Progress
                List<Object[]> progressData = enrollmentRepository.findCourseProgressByStudent(studentId);
                List<AnalyticsDTO.CourseProgress> courseProgress = progressData.stream()
                                .map(obj -> AnalyticsDTO.CourseProgress.builder()
                                                .courseName((String) obj[0])
                                                .completionPercentage((Integer) obj[1])
                                                .build())
                                .collect(Collectors.toList());

                // Get Total Learning Time from ProgressService (lifetime)
                var progressSummary = progressService.getStudentProgressSummary(studentId);

                // 2. Quiz Performance (Aggregated by Course)
                List<QuizAttempt> attempts = quizAttemptRepository.findByStudentId(studentId);

                Map<String, List<QuizAttempt>> attemptsByCourse = attempts.stream()
                                .filter(a -> a.getQuiz().getCourse() != null)
                                .collect(Collectors.groupingBy(a -> a.getQuiz().getCourse().getTitle()));

                List<AnalyticsDTO.QuizPerformance> quizPerformance = new ArrayList<>();

                for (Map.Entry<String, List<QuizAttempt>> entry : attemptsByCourse.entrySet()) {
                        String courseName = entry.getKey();
                        List<QuizAttempt> courseAttempts = entry.getValue();

                        // Average User Score for this Course (Based on Peak Performance per Quiz)
                        Map<Long, Double> maxQuizScores = courseAttempts.stream()
                                        .collect(Collectors.toMap(
                                                        a -> a.getQuiz().getId(),
                                                        QuizAttempt::getScore,
                                                        Math::max));

                        double userAvg = maxQuizScores.values().stream()
                                        .mapToDouble(Double::doubleValue)
                                        .average()
                                        .orElse(0.0);

                        // Average Class Score for these Quizzes
                        // (Naive approach: avg of avgs)
                        double classAvg = courseAttempts.stream()
                                        .mapToDouble(a -> {
                                                Double qAvg = quizAttemptRepository
                                                                .findAverageScoreByQuizId(a.getQuiz().getId());
                                                return qAvg != null ? qAvg : 0.0;
                                        })
                                        .average()
                                        .orElse(0.0);

                        quizPerformance.add(AnalyticsDTO.QuizPerformance.builder()
                                        .quizTitle("Overall") // Generic, not used for X-axis label anymore
                                        .courseName(courseName)
                                        .score(Math.round(userAvg * 10.0) / 10.0)
                                        .average(Math.round(classAvg * 10.0) / 10.0)
                                        .build());
                }

                // Sort by something? Maybe course name or score? Let's sort by Course Name for
                // consistency
                quizPerformance.sort((a, b) -> a.getCourseName().compareTo(b.getCourseName()));

                // 3. Skill Growth (Derived from Course Performance)
                List<AnalyticsDTO.SkillGrowth> skillGrowth = quizPerformance.stream()
                                .map(qp -> AnalyticsDTO.SkillGrowth.builder()
                                                .subject(qp.getCourseName())
                                                .score(qp.getScore().intValue())
                                                .fullMark(100)
                                                .build())
                                .collect(Collectors.toList());

                // 4. Weekly Activity
                List<AnalyticsDTO.WeeklyActivity> weeklyActivity = new ArrayList<>();
                LocalDate today = LocalDate.now();
                for (int i = 6; i >= 0; i--) {
                        LocalDate date = today.minusDays(i);
                        var activity = userActivityRepository.findByUserIdAndDate(studentId, date);

                        weeklyActivity.add(AnalyticsDTO.WeeklyActivity.builder()
                                        .day(date.getDayOfWeek().name().substring(0, 3))
                                        .hours(activity.map(a -> a.getMinutesSpent() / 60.0).orElse(0.0))
                                        .build());
                }

                return AnalyticsDTO.StudentAnalytics.builder()
                                .courseCompletion(courseProgress)
                                .quizPerformance(quizPerformance)
                                .skillGrowth(skillGrowth)
                                .weeklyLearningTime(weeklyActivity)
                                .totalLearningMinutes(progressSummary.getTotalLearningMinutes())
                                .build();
        }

        public java.util.List<AnalyticsDTO.StudentCourseProgressDTO> getInstructorStudentProgress(Long instructorId) {
                List<com.example.skillforge.model.entity.Course> courses = courseRepository
                                .findByInstructorId(instructorId);
                List<Long> courseIds = courses.stream().map(com.example.skillforge.model.entity.Course::getId)
                                .collect(Collectors.toList());

                if (courseIds.isEmpty()) {
                        return new ArrayList<>();
                }

                List<com.example.skillforge.model.entity.Enrollment> enrollments = enrollmentRepository
                                .findByCourseIdIn(courseIds);

                return enrollments.stream().map(enrollment -> {
                        com.example.skillforge.model.entity.CourseProgress cp = courseProgressRepository
                                        .findByStudentIdAndCourseId(
                                                        enrollment.getStudent().getId(), enrollment.getCourse().getId())
                                        .orElse(null);

                        String status = "YET_TO_START";
                        if (Boolean.TRUE.equals(enrollment.getIsCompleted())) {
                                status = "COMPLETED";
                        } else if (cp != null && cp.getProgressPercent() != null && cp.getProgressPercent() > 0) {
                                status = "IN_PROGRESS";
                        }

                        return AnalyticsDTO.StudentCourseProgressDTO.builder()
                                        .enrollmentId(enrollment.getId())
                                        .courseName(enrollment.getCourse().getTitle())
                                        .studentName(enrollment.getStudent().getUser().getName())
                                        .studentEmail(enrollment.getStudent().getUser().getEmail())
                                        .enrolledDate(enrollment.getEnrolledAt())
                                        .startDate(enrollment.getEnrolledAt())
                                        .completedDate(enrollment.getCompletedAt())
                                        .completionPercentage(enrollment.getCompletionPercentage())
                                        .timeSpentMinutes(cp != null && cp.getTotalTimeMinutes() != null
                                                        ? cp.getTotalTimeMinutes().longValue()
                                                        : 0L)
                                        .status(status)
                                        .build();
                }).collect(Collectors.toList());
        }

        public AnalyticsDTO.InstructorAnalytics getInstructorAnalytics(Long instructorId) {
                // 1. Total Students per Course
                List<Object[]> studentsPerCourse = enrollmentRepository.countStudentsPerCourse(instructorId);
                List<AnalyticsDTO.SimpleMetric> totalStudents = studentsPerCourse.stream()
                                .map(obj -> AnalyticsDTO.SimpleMetric.builder()
                                                .name((String) obj[0])
                                                .value((Long) obj[1])
                                                .build())
                                .collect(Collectors.toList());

                // 2. Completion Rate (Donut)
                List<Object[]> completionStatus = enrollmentRepository.countCompletionStatusByInstructor(instructorId);
                List<AnalyticsDTO.PieMetric> completionRate = completionStatus.stream()
                                .map(obj -> AnalyticsDTO.PieMetric.builder()
                                                .name((Boolean) obj[0] ? "Completed" : "In Progress")
                                                .value((Long) obj[1])
                                                .build())
                                .collect(Collectors.toList());

                // 3. Quiz Score Distribution
                List<Object[]> rawAttempts = quizAttemptRepository.findRawScoresByInstructor(instructorId);

                // Map<StudentId, MaxScore> - Track the absolute highest score a student
                // achieved on ANY quiz
                Map<Long, Double> studentPeakScores = new java.util.HashMap<>();

                for (Object[] row : rawAttempts) {
                        Long sId = (Long) row[0];
                        // Long qId = (Long) row[1];
                        Double sc = (Double) row[2];

                        if (sc == null)
                                sc = 0.0;

                        studentPeakScores.merge(sId, sc, Math::max);
                }

                int[] buckets = new int[5]; // 0-20, 20-40, 40-60, 60-80, 80-100
                for (Double score : studentPeakScores.values()) {
                        if (score < 20)
                                buckets[0]++;
                        else if (score < 40)
                                buckets[1]++;
                        else if (score < 60)
                                buckets[2]++;
                        else if (score < 80)
                                buckets[3]++;
                        else
                                buckets[4]++; // 80 to 100 (Inclusive of 80)
                }
                List<AnalyticsDTO.SimpleMetric> scoreDist = new ArrayList<>();
                scoreDist.add(AnalyticsDTO.SimpleMetric.builder().name("0-20%").value(buckets[0]).build());
                scoreDist.add(AnalyticsDTO.SimpleMetric.builder().name("20-40%").value(buckets[1]).build());
                scoreDist.add(AnalyticsDTO.SimpleMetric.builder().name("40-60%").value(buckets[2]).build());
                scoreDist.add(AnalyticsDTO.SimpleMetric.builder().name("60-80%").value(buckets[3]).build());
                scoreDist.add(AnalyticsDTO.SimpleMetric.builder().name("80-100%").value(buckets[4]).build());

                // 4. Summary Stats (Real Data)
                Long distinctStudents = enrollmentRepository.countTotalStudentsByInstructor(instructorId);
                Long activeCourses = courseRepository.countByInstructorIdAndIsPublished(instructorId, true);

                long totalEnrollments = 0;
                long completedEnrollments = 0;
                for (Object[] row : completionStatus) {
                        Long count = (Long) row[1];
                        totalEnrollments += count;
                        if ((Boolean) row[0]) {
                                completedEnrollments += count;
                        }
                }

                long completionPercentage = totalEnrollments > 0 ? (completedEnrollments * 100 / totalEnrollments) : 0;
                String completionRateStr = completionPercentage + "%";

                AnalyticsDTO.SummaryMetrics summary = AnalyticsDTO.SummaryMetrics.builder()
                                .totalStudents(distinctStudents)
                                .activeCourses(activeCourses)
                                .avgRating(4.8) // Mock for now until reviews are implemented
                                .completionRate(completionRateStr)
                                .build();

                return AnalyticsDTO.InstructorAnalytics.builder()
                                .totalStudents(totalStudents)
                                .courseCompletionRate(completionRate)
                                .studentEngagement(List.of())
                                .quizScoreDistribution(scoreDist)
                                .summary(summary)
                                .build();
        }

        public AnalyticsDTO.AdminAnalytics getAdminAnalytics() {
                // 1. User Role Distribution
                List<AnalyticsDTO.PieMetric> roleDist = new ArrayList<>();
                roleDist.add(AnalyticsDTO.PieMetric.builder().name("Students")
                                .value(userRepository.countByRole(Role.STUDENT)).build());
                roleDist.add(AnalyticsDTO.PieMetric.builder().name("Instructors")
                                .value(userRepository.countByRole(Role.INSTRUCTOR)).build());
                roleDist.add(AnalyticsDTO.PieMetric.builder().name("Admins")
                                .value(userRepository.countByRole(Role.ADMIN)).build());

                // 2. Platform Growth
                List<Object[]> growthData = userRepository.findUserGrowthByMonth();
                List<AnalyticsDTO.TimeMetric> growth = growthData.stream()
                                .map(obj -> AnalyticsDTO.TimeMetric.builder()
                                                .time((String) obj[0])
                                                .value((Long) obj[1])
                                                .build())
                                .limit(12)
                                .collect(Collectors.toList());

                // 3. Top Performing Courses (Real Data)
                List<Object[]> topCoursesData = enrollmentRepository.findTopPerformingCourses();
                List<AnalyticsDTO.CoursePopularity> topCourses = topCoursesData.stream()
                                .limit(5)
                                .map(obj -> AnalyticsDTO.CoursePopularity.builder()
                                                .name((String) obj[0])
                                                .students((Long) obj[1])
                                                .rating(4.5) // Default rating for now until Review system is linked
                                                .build())
                                .collect(Collectors.toList());

                // System Health (Still real-time mock as we don't have actuator metrics
                // accessible easily here)
                AnalyticsDTO.SystemHealth health = AnalyticsDTO.SystemHealth.builder()
                                .serverLoad(45.5)
                                .dbLatency("12ms")
                                .uptime("99.9%")
                                .errors(0.01)
                                .build();

                return AnalyticsDTO.AdminAnalytics.builder()
                                .userRoleDistribution(roleDist)
                                .platformGrowth(growth)
                                .activeUsers(List.of())
                                .systemHealth(health)
                                .topCourses(topCourses)
                                .build();
        }
}
