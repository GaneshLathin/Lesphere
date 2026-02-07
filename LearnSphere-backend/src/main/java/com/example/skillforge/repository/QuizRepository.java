package com.example.skillforge.repository;

import com.example.skillforge.model.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
  List<Quiz> findByCourseId(Long courseId);

  List<Quiz> findByCourseIdAndIsPublished(Long courseId, Boolean isPublished);

  @Query("SELECT q FROM Quiz q WHERE q.topic.id = :topicId")
  List<Quiz> findByTopicId(@Param("topicId") Long topicId);

  void deleteByTopicId(Long topicId);

  List<Quiz> findByCourseIdAndTopicIsNull(Long courseId);
}
