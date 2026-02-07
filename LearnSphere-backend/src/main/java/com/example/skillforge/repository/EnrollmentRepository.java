package com.example.skillforge.repository;

import com.example.skillforge.model.entity.*;
import com.example.skillforge.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByCourseId(Long courseId);
    Boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    Long countByCourseId(Long courseId);
    void deleteByCourse_Id(Long courseId);
    
    List<Enrollment> findByStudentIdAndIsCompletedTrue(Long studentId);

    // Analytics Queries
    @Query("SELECT COUNT(DISTINCT e.student) FROM Enrollment e WHERE e.course.instructor.id = :instructorId")
    Long countTotalStudentsByInstructor(@Param("instructorId") Long instructorId);

    @Query("SELECT e.course.title, COUNT(e) FROM Enrollment e WHERE e.course.instructor.id = :instructorId GROUP BY e.course.title")
    List<Object[]> countStudentsPerCourse(@Param("instructorId") Long instructorId);

    @Query("SELECT e.isCompleted, COUNT(e) FROM Enrollment e WHERE e.course.instructor.id = :instructorId GROUP BY e.isCompleted")
    List<Object[]> countCompletionStatusByInstructor(@Param("instructorId") Long instructorId);

    @Query("SELECT e.course.title, e.completionPercentage FROM Enrollment e WHERE e.student.id = :studentId")
    List<Object[]> findCourseProgressByStudent(@Param("studentId") Long studentId);


    @Query("SELECT e.course.title, COUNT(e) FROM Enrollment e GROUP BY e.course.title ORDER BY COUNT(e) DESC")
    List<Object[]> findTopPerformingCourses();
}