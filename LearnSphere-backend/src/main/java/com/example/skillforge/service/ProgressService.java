//package com.example.skillforge.service;
//
//import com.example.skillforge.dto.response.ProgressResponse;
//import com.example.skillforge.model.entity.CourseProgress;
//import com.example.skillforge.repository.CourseProgressRepository;
//import com.example.skillforge.repository.CourseRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import java.util.*;
//
//@Service
//@RequiredArgsConstructor
//public class ProgressService {
//
//    private final CourseProgressRepository courseProgressRepository;
//    private final CourseRepository courseRepository;
//
//    public List<ProgressResponse> getProgressForStudent(Long studentId) {
//
//        List<CourseProgress> courseList =
//                courseProgressRepository.findByStudentId(studentId);
//
//        List<ProgressResponse> result = new ArrayList<>();
//
//        for (CourseProgress cp : courseList) {
//
//            String courseName = courseRepository.findById(cp.getCourseId())
//                    .map(c -> c.getTitle())
//                    .orElse("Unknown Course");
//
//            result.add(
//                    ProgressResponse.builder()
//                            .courseId(cp.getCourseId())
//                            .courseName(courseName)
//                            .completionPercentage(cp.getProgressPercent())
//                            .studentId(studentId)
//                            .build()
//            );
//        }
//
//        return result;
//    }
//
//    public ProgressResponse getProgressForCourse(Long studentId, Long courseId) {
//
//        CourseProgress cp =
//                courseProgressRepository.findByStudentIdAndCourseId(studentId, courseId)
//                        .orElse(null);
//
//        if (cp == null) return null;
//
//        return ProgressResponse.builder()
//                .courseId(courseId)
//                .studentId(studentId)
//                .completionPercentage(cp.getProgressPercent())
//                .build();
//    }
//}


//To Work on for Streak....
// inside ProgressService.java (add these methods)
package com.example.skillforge.service;
import com.example.skillforge.dto.response.ProgressResponse;
import com.example.skillforge.dto.response.ProgressSummaryResponse;
import com.example.skillforge.model.entity.CourseProgress;
import com.example.skillforge.model.entity.TopicProgress;
import com.example.skillforge.repository.CourseProgressRepository;
import com.example.skillforge.repository.CourseRepository;
import com.example.skillforge.repository.EnrollmentRepository;
import com.example.skillforge.repository.TopicProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final CourseProgressRepository courseProgressRepository;
    private final CourseRepository courseRepository;
    private final TopicProgressRepository topicProgressRepository; // you'll need this repository
    private final EnrollmentRepository enrollmentRepository;

    // existing methods...

    public ProgressSummaryResponse getStudentProgressSummary(Long studentId) {
        // 1) course-level progress rows (existing)
        List<CourseProgress> cps = courseProgressRepository.findByStudentId(studentId);
        List<ProgressResponse> courseResponses = new ArrayList<>();
        int totalMinutes = 0;
        int aggregateSkill = 0;
        int skillCount = 0;

        for (CourseProgress cp : cps) {
            String courseName = courseRepository.findById(cp.getCourseId()).map(c -> c.getTitle()).orElse("Unknown Course");
            ProgressResponse pr = ProgressResponse.builder()
                    .id(cp.getId())
                    .studentId(cp.getStudentId())
                    .courseId(cp.getCourseId())
                    .completionPercentage(cp.getProgressPercent() == null ? 0 : cp.getProgressPercent())
                    .currentTopicId(cp.getLastTopicId())
                    .skillScore(cp.getSkillScore())
                    .lastAccessed(cp.getLastUpdated())
                    .courseName(courseName)
                    .build();

            courseResponses.add(pr);

            // accumulate time and skill
            if (cp.getSkillScore() != null) {
                aggregateSkill += cp.getSkillScore();
                skillCount++;
            }
            if (cp.getTotalTimeMinutes() != null) {
                totalMinutes += cp.getTotalTimeMinutes();
            }
        }

        // 2) compute last 7 days activity from TopicProgress table
        // topicProgressRepository should have a method findCompletedByStudentSince(studentId, sinceDate)
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        LocalDate sevenDaysAgo = today.minusDays(6); // include today -> 7 days total
        List<TopicProgress> recentTopicProgress = topicProgressRepository.findCompletedByStudentSince(studentId, sevenDaysAgo.atStartOfDay());

        // build set of days with activity (ISO date strings)
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        Set<String> daysWithActivity = recentTopicProgress.stream()
                .map(tp -> tp.getCompletedAt().toLocalDate().format(fmt))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<String> last7DaysActivity = new ArrayList<>(daysWithActivity);

        // 3) compute weekly streak — consecutive days ending today
        int streak = computeConsecutiveStreak(today, daysWithActivity);

        // 4) aggregate skillScore — simple average or fallback
        int finalSkillScore = skillCount > 0 ? Math.round((float) aggregateSkill / skillCount) : estimateSkillFromProgress(courseResponses);

        // 5) badges — simple rules
        List<String> badges = computeBadges(studentId, totalMinutes, streak, courseResponses);

        // build response
        ProgressSummaryResponse summary = ProgressSummaryResponse.builder()
                .totalLearningMinutes(totalMinutes)
                .weeklyStreakDays(streak)
                .skillScore(finalSkillScore)
                .badges(badges)
                .courseProgress(courseResponses)
                .last7DaysActivity(last7DaysActivity)
                .build();

        return summary;
    }

    private int computeConsecutiveStreak(LocalDate today, Set<String> daysWithActivity) {
        int streak = 0;
        LocalDate cursor = today;
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        while (streak < 7) {
            String iso = cursor.format(fmt);
            if (daysWithActivity.contains(iso)) {
                streak++;
                cursor = cursor.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    private int estimateSkillFromProgress(List<ProgressResponse> prs) {
        if (prs.isEmpty()) return 0;
        double avg = prs.stream().mapToInt(p -> p.getCompletionPercentage() == null ? 0 : p.getCompletionPercentage()).average().orElse(0);
        // scale to 0..100 maybe multiply by 10 if you keep larger scale; we'll return 0..100
        return (int)Math.round(avg);
    }

    private List<String> computeBadges(Long studentId, int totalMinutes, int streak, List<ProgressResponse> courses) {
        List<String> badges = new ArrayList<>();
        // rules (example)
        if (totalMinutes >= 60) badges.add("First Hour");
        if (totalMinutes >= 300) badges.add("5-hour Learner");
        if (streak >= 7) badges.add("7-day Streak");
        // course completion badges
        long completedCourses = courses.stream().filter(p -> p.getCompletionPercentage() != null && p.getCompletionPercentage() >= 100).count();
        if (completedCourses >= 1) badges.add("Course Completed");
        if (completedCourses >= 5) badges.add("5 Courses Master");
        return badges;
    }
}
