package com.example.skillforge.repository;

import com.example.skillforge.model.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {

    java.util.Optional<CourseProgress> findTopByStudentIdOrderByLastUpdatedDesc(Long studentId); // NEW

    Optional<CourseProgress> findByStudentIdAndCourseId(Long studentId, Long courseId);

    List<CourseProgress> findByStudentId(Long studentId);

    void deleteByCourseId(Long courseId);
}
