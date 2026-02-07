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
        return materialProgressRepository.save(mp);
    }

    public boolean hasCompletedAnyMaterialInTopic(Long studentId, java.util.List<Long> materialIds) {
        return materialProgressRepository.findByStudentIdAndMaterialIdIn(studentId, materialIds).stream()
                .anyMatch(TopicMaterialProgress::getCompleted);
    }
}
