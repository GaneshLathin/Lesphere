package com.example.skillforge.repository;

import com.example.skillforge.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCourseIdOrderByCreatedAtDesc(Long courseId);
    Optional<Review> findByStudentIdAndCourseId(Long studentId, Long courseId);
    void deleteByCourseId(Long courseId);
}
