package com.example.skillforge.repository;

import com.example.skillforge.model.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    // Get all materials for topic
    List<Material> findByTopicId(Long topicId);

    // Ordered materials (if needed by UI)
    List<Material> findByTopicIdOrderByOrderIndexAsc(Long topicId);

    // Count of materials
    Long countByTopicId(Long topicId);

    // ✔ FIX: Return only IDs (used in QuizAttemptService)
    @Query("SELECT m.id FROM Material m WHERE m.topic.id = :topicId")
    List<Long> findMaterialIdsByTopicId(Long topicId);
}
