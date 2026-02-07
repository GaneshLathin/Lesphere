package com.example.skillforge.repository;

import com.example.skillforge.model.entity.TopicMaterialProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface TopicMaterialProgressRepository extends JpaRepository<TopicMaterialProgress, Long> {
    Optional<TopicMaterialProgress> findByStudentIdAndMaterialId(Long studentId, Long materialId);
    List<TopicMaterialProgress> findByStudentIdAndMaterialIdIn(Long studentId, List<Long> materialIds);
}
