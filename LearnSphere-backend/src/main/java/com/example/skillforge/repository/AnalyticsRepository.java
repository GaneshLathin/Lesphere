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
public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    Optional<Analytics> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Analytics> findByStudentId(Long studentId);
    List<Analytics> findByCourseId(Long courseId);
}