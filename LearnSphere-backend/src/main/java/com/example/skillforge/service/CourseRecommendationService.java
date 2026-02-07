package com.example.skillforge.service;

import com.example.skillforge.model.entity.Course;
import com.example.skillforge.model.enums.DifficultyLevel;
import com.example.skillforge.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseRecommendationService {

    private final CourseRepository courseRepository;
    private final com.example.skillforge.repository.EnrollmentRepository enrollmentRepository;
    private final com.example.skillforge.repository.CourseProgressRepository courseProgressRepository;

    private List<Long> getCompletedCourseIds(Long studentId) {
        // 1. From CourseProgress (>= 99%)
        List<com.example.skillforge.model.entity.CourseProgress> allProgress = courseProgressRepository.findByStudentId(studentId);
        List<Long> progressCompleted = allProgress.stream()
                .filter(p -> p.getProgressPercent() != null && p.getProgressPercent() >= 99.0)
                .map(com.example.skillforge.model.entity.CourseProgress::getCourseId)
                .collect(java.util.stream.Collectors.toList());

        // 2. From Enrollments (isCompleted = true) - definitive
        List<com.example.skillforge.model.entity.Enrollment> completedEnrollments = enrollmentRepository.findByStudentIdAndIsCompletedTrue(studentId);
        List<Long> enrollmentCompleted = completedEnrollments.stream()
                .map(e -> e.getCourse().getId())
                .collect(java.util.stream.Collectors.toList());

        // Union
        java.util.Set<Long> set = new java.util.HashSet<>(progressCompleted);
        set.addAll(enrollmentCompleted);
        return new java.util.ArrayList<>(set);
    }

    public Course recommendNextCourse(Long completedCourseId, Long studentId) {
        System.out.println("DEBUG: recommendNextCourse called for course " + completedCourseId + " student " + studentId);
        Course completedCourse = courseRepository.findById(completedCourseId).orElse(null);
        if (completedCourse == null) return null;

        // 1. Get all completed course IDs to EXCLUDE
        List<Long> completedCourseIds = getCompletedCourseIds(studentId);
        
        System.out.println("DEBUG: Found " + completedCourseIds.size() + " completed courses for student " + studentId + ": " + completedCourseIds);

        // Also exclude the current one explicitly
        if (!completedCourseIds.contains(completedCourseId)) {
            completedCourseIds.add(completedCourseId);
        }

        DifficultyLevel currentLevel = completedCourse.getDifficultyLevel();
        String category = completedCourse.getCategory();

        // Level Up Logic
        DifficultyLevel nextLevel = getNextLevel(currentLevel);

        // 2. Try to find same category, NEXT level
        List<Course> nextLevelCourses = courseRepository.findByCategoryAndDifficultyLevelAndIdNotIn(
                category, nextLevel, completedCourseIds
        );

        if (!nextLevelCourses.isEmpty()) {
            return nextLevelCourses.get(0);
        }

        // 2b. Try to find same category, SAME level (e.g., Testing 1 -> Testing 2, both Beginner)
        // If the user finishes a Beginner course, and no Intermediate exists, suggest another Beginner one in same category
        List<Course> sameLevelCourses = courseRepository.findByCategoryAndDifficultyLevelAndIdNotIn(
                category, currentLevel, completedCourseIds
        );
        if (!sameLevelCourses.isEmpty()) {
            // Ideally sort by something, but default order is likely ID or creation
             return sameLevelCourses.get(0);
        }


        // 3. If no next/same level, suggest popular in same category (side-grade or deep dive)
        List<Course> similarCourses = courseRepository.findRelatedCourses(category, completedCourseId);
        for (Course c : similarCourses) {
            if (!completedCourseIds.contains(c.getId())) {
                return c;
            }
        }

        // 4. Fallback: Top popular globally, excluding completed
        List<Course> popular = courseRepository.findTop3ByCategoryAndIsPublishedTrueOrderByTotalEnrollmentsDesc(category); 
        for (Course c : popular) {
            if (!completedCourseIds.contains(c.getId())) {
                return c;
            }
        }
        
        // 5. Ultimate Fallback -> Any published course not completed
        List<Course> allPublished = courseRepository.findAllPublishedCourses();
        for(Course c : allPublished) {
             if (!completedCourseIds.contains(c.getId())) {
                return c;
            }
        }

        return null; // No recommendation found
    }



    public List<Course> recommendCoursesForDashboard(Long studentId) {
        // 1. Find last interacted course
         var lastProgress = courseProgressRepository.findTopByStudentIdOrderByLastUpdatedDesc(studentId);
         
         if (lastProgress.isPresent()) {
             Long lastCourseId = lastProgress.get().getCourseId();
             // If completed, suggest next based on THAT course
             if (lastProgress.get().getProgressPercent() >= 99.0) {
                 Course next = recommendNextCourse(lastCourseId, studentId);
                 return next != null ? List.of(next) : Collections.emptyList();
             }
             
             // If active, suggest related/similar
             Course active = courseRepository.findById(lastCourseId).orElse(null);
             if (active != null) {
                  List<Long> completedIds = getCompletedCourseIds(studentId);
                  
                   if(!completedIds.contains(lastCourseId)) completedIds.add(lastCourseId); // Exclude current active self

                 List<Course> related = courseRepository.findRelatedCourses(active.getCategory(), lastCourseId);
                  return related.stream()
                        .filter(c -> !completedIds.contains(c.getId()))
                        .limit(3)
                        .collect(java.util.stream.Collectors.toList());
             }
         }
         
         // 2. Fallback: Popular courses (filter out completed)
         List<Long> completedIds = getCompletedCourseIds(studentId);

         List<Course> popular = courseRepository.findTop3ByCategoryAndIsPublishedTrueOrderByTotalEnrollmentsDesc("Programming"); 
         return popular.stream()
                .filter(c -> !completedIds.contains(c.getId()))
                .collect(java.util.stream.Collectors.toList()); 
    }

    private DifficultyLevel getNextLevel(DifficultyLevel level) {
        if (level == null) return DifficultyLevel.INTERMEDIATE;
        switch (level) {
            case BEGINNER: return DifficultyLevel.INTERMEDIATE;
            case INTERMEDIATE: return DifficultyLevel.ADVANCED;
            case ADVANCED: return DifficultyLevel.ADVANCED; // Stay at advanced or find specialized
            default: return DifficultyLevel.BEGINNER;
        }
    }
}
