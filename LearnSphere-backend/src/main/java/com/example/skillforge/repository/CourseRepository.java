////package com.example.skillforge.repository;
////
////import com.example.skillforge.model.entity.*;
////import com.example.skillforge.model.enums.Role;
////import org.springframework.data.jpa.repository.JpaRepository;
////import org.springframework.data.jpa.repository.Query;
////import org.springframework.data.repository.query.Param;
////import org.springframework.stereotype.Repository;
////import java.util.List;
////import java.util.Optional;
////
////
////@Repository
////public interface CourseRepository extends JpaRepository<Course, Long> {
////    List<Course> findByInstructorId(Long instructorId);
////    List<Course> findByIsPublished(Boolean isPublished);
////
////    @Query("SELECT c FROM Course c WHERE c.isPublished = true")
////    List<Course> findAllPublishedCourses();
////
//////    @Query("SELECT c FROM Course c WHERE c.instructorId = :instructorId AND c.isPublished = :published")
//////    List<Course> findByInstructorAndPublished(@Param("instructorId") Long instructorId,
//////                                              @Param("published") Boolean published);
////
////    @Query("SELECT c FROM Course c WHERE c.instructor.id = :instructorId AND c.isPublished = :published")
////    List<Course> findByInstructorAndPublished(@Param("instructorId") Long instructorId,
////                                              @Param("published") Boolean published);
////    List<Course> findByEnrollmentsStudentId(Long studentId);
////
////
////    Optional<CourseProgress> findByStudentIdAndCourseId(Long studentId, Long courseId);
////}
//
//package com.example.skillforge.repository;
//
//import com.example.skillforge.model.entity.Course;
//import com.example.skillforge.model.entity.Enrollment;
//import com.example.skillforge.model.enums.DifficultyLevel;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface CourseRepository extends JpaRepository<Course, Long> {
//
//    // Instructor courses
//    List<Course> findByInstructorId(Long instructorId);
//
//    // Published / unpublished
//    List<Course> findByIsPublished(Boolean isPublished);
//
//    @Query("SELECT c FROM Course c WHERE c.isPublished = true")
//    List<Course> findAllPublishedCourses();
//
//    // Instructor + published filter
//    @Query("SELECT c FROM Course c WHERE c.instructor.id = :instructorId AND c.isPublished = :published")
//    List<Course> findByInstructorAndPublished(@Param("instructorId") Long instructorId,
//                                              @Param("published") Boolean published);
//
//    // STUDENT ENROLLED COURSES (uses join on enrollments)
//    List<Course> findByEnrollmentsStudentId(Long studentId);
//
//    // ------------------------------
//    // Pagination + Filters for Admin / non-student views (ALL courses)
//    // Includes search on title/description
//    // ------------------------------
//    @Query("""
//        SELECT c FROM Course c
//        WHERE (:difficulty IS NULL OR c.difficultyLevel = :difficulty)
//          AND (
//                :durationRange IS NULL
//                OR (:durationRange = 'SHORT' AND c.duration < 60)
//                OR (:durationRange = 'MEDIUM' AND c.duration BETWEEN 60 AND 180)
//                OR (:durationRange = 'LONG' AND c.duration > 180)
//          )
//          AND (
//                :search IS NULL
//                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
//                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
//          )
//    """)
//    Page<Course> findWithFilters(
//            @Param("difficulty") DifficultyLevel difficulty,
//            @Param("durationRange") String durationRange,
//            @Param("search") String search,
//            Pageable pageable
//    );
//
//    // ------------------------------
//    // Pagination + Filters for Students (ONLY published courses)
//    // ------------------------------
//    @Query("""
//        SELECT c FROM Course c
//        WHERE c.isPublished = true
//          AND (:difficulty IS NULL OR c.difficultyLevel = :difficulty)
//          AND (
//                :durationRange IS NULL
//                OR (:durationRange = 'SHORT' AND c.duration < 60)
//                OR (:durationRange = 'MEDIUM' AND c.duration BETWEEN 60 AND 180)
//                OR (:durationRange = 'LONG' AND c.duration > 180)
//          )
//          AND (
//                :search IS NULL
//                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
//                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
//          )
//    """)
//    Page<Course> findWithFiltersForStudents(
//            @Param("difficulty") DifficultyLevel difficulty,
//            @Param("durationRange") String durationRange,
//            @Param("search") String search,
//            Pageable pageable
//    );
//}

package com.example.skillforge.repository;

import com.example.skillforge.model.entity.Course;
import com.example.skillforge.model.enums.DifficultyLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Instructor courses
    List<Course> findByInstructorId(Long instructorId);

    // Published / unpublished
    List<Course> findByIsPublished(Boolean isPublished);
    
    Long countByInstructorIdAndIsPublished(Long instructorId, Boolean isPublished);

    @Query("SELECT c FROM Course c WHERE c.isPublished = true")
    List<Course> findAllPublishedCourses();

    // RECOMMENDATION HELPERS
    List<Course> findByCategoryAndDifficultyLevelAndIdNot(String category, DifficultyLevel difficultyLevel, Long excludeId);
    
    // Suggestion: Filter out multiple IDs (e.g. all completed courses)
    List<Course> findByCategoryAndDifficultyLevelAndIdNotIn(String category, DifficultyLevel difficultyLevel, List<Long> excludeIds);
    
    // Find popular courses in category
    List<Course> findTop3ByCategoryAndIsPublishedTrueOrderByTotalEnrollmentsDesc(String category);

    // Find courses with same tag (simple version)
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND c.category = :category AND c.id <> :excludeId")
    List<Course> findRelatedCourses(@Param("category") String category, @Param("excludeId") Long excludeId);

    // Instructor + published filter
    @Query("SELECT c FROM Course c WHERE c.instructor.id = :instructorId AND c.isPublished = :published")
    List<Course> findByInstructorAndPublished(@Param("instructorId") Long instructorId,
                                              @Param("published") Boolean published);

    // STUDENT ENROLLED COURSES (uses join on enrollments)
    List<Course> findByEnrollmentsStudentId(Long studentId);

    // ------------------------------
    // Pagination + Filters for Admin / non-student views (ALL courses)
    // Includes search on title/description
    // ------------------------------
    @Query("""
        SELECT c FROM Course c
        WHERE (:difficulty IS NULL OR c.difficultyLevel = :difficulty)
          AND (
                :durationRange IS NULL
                OR (:durationRange = 'SHORT' AND c.duration < 60)
                OR (:durationRange = 'MEDIUM' AND c.duration BETWEEN 60 AND 180)
                OR (:durationRange = 'LONG' AND c.duration > 180)
          )
          AND (
                :search IS NULL
                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
          )
    """)
    Page<Course> findWithFilters(
            @Param("difficulty") DifficultyLevel difficulty,
            @Param("durationRange") String durationRange,
            @Param("search") String search,
            Pageable pageable
    );

    // ------------------------------
    // Pagination + Filters for Students (ONLY published courses)
    // ------------------------------
    @Query("""
        SELECT c FROM Course c
        WHERE c.isPublished = true
          AND (:difficulty IS NULL OR c.difficultyLevel = :difficulty)
          AND (
                :durationRange IS NULL
                OR (:durationRange = 'SHORT' AND c.duration < 60)
                OR (:durationRange = 'MEDIUM' AND c.duration BETWEEN 60 AND 180)
                OR (:durationRange = 'LONG' AND c.duration > 180)
          )
          AND (
                :search IS NULL
                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
          )
    """)
    Page<Course> findWithFiltersForStudents(
            @Param("difficulty") DifficultyLevel difficulty,
            @Param("durationRange") String durationRange,
            @Param("search") String search,
            Pageable pageable
    );
    @Query("""
        SELECT c FROM Course c
        WHERE (:difficulty IS NULL OR c.difficultyLevel = :difficulty)
          AND (
                :durationRange IS NULL
                OR (:durationRange = 'SHORT' AND c.duration < 60)
                OR (:durationRange = 'MEDIUM' AND c.duration BETWEEN 60 AND 180)
                OR (:durationRange = 'LONG' AND c.duration > 180)
          )
          AND (
                :search IS NULL
                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
          )
          AND (:published IS NULL OR c.isPublished = :published)
          AND (:instructorId IS NULL OR c.instructor.id = :instructorId)
    """)
    Page<Course> findWithFiltersForAdmin(
            @Param("difficulty") DifficultyLevel difficulty,
            @Param("durationRange") String durationRange,
            @Param("search") String search,
            @Param("published") Boolean published,
            @Param("instructorId") Long instructorId,
            Pageable pageable
    );

}
