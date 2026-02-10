package com.example.skillforge.service;

import com.example.skillforge.model.entity.TopicMaterialProgress;
import com.example.skillforge.repository.TopicMaterialProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MaterialProgressService {

    private final TopicMaterialProgressRepository materialProgressRepository;
    private final com.example.skillforge.repository.MaterialRepository materialRepository;
    private final CourseProgressService courseProgressService;

    @Transactional
    public TopicMaterialProgress markMaterialCompleted(Long studentId, Long materialId) {
        TopicMaterialProgress mp = materialProgressRepository
                .findByStudentIdAndMaterialId(studentId, materialId)
                .orElseGet(() -> {
                    TopicMaterialProgress newMp = new TopicMaterialProgress();
                    newMp.setStudentId(studentId);
                    newMp.setMaterialId(materialId);
                    return newMp;
                });

        mp.setCompleted(true);
        mp.setCompletedAt(LocalDateTime.now());
        TopicMaterialProgress saved = materialProgressRepository.save(mp);

        // Trigger Course Progress Update
        materialRepository.findById(materialId).ifPresent(material -> {
            if (material.getTopic() != null && material.getTopic().getCourse() != null) {
                Long topicId = material.getTopic().getId();
                Long courseId = material.getTopic().getCourse().getId();
                courseProgressService.updateProgress(studentId, courseId, topicId);
            }
        });

        return saved;
    }

    public boolean hasCompletedAnyMaterialInTopic(Long studentId, java.util.List<Long> materialIds) {
        return materialProgressRepository.findByStudentIdAndMaterialIdIn(studentId, materialIds).stream()
                .anyMatch(TopicMaterialProgress::getCompleted);
    }
}
