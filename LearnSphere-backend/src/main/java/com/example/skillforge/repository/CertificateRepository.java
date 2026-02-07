package com.example.skillforge.repository;

import com.example.skillforge.model.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<Certificate> findByUid(String uid);

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    void deleteByStudentId(Long studentId);

    void deleteByCourseId(Long courseId);
}
