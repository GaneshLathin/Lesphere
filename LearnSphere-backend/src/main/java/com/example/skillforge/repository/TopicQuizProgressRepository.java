package com.example.skillforge.repository;

import com.example.skillforge.model.entity.TopicQuizProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicQuizProgressRepository extends JpaRepository<TopicQuizProgress, Long> {
    Optional<TopicQuizProgress> findByStudentIdAndTopicId(Long studentId, Long topicId);

    void deleteByTopicId(Long topicId);
}
