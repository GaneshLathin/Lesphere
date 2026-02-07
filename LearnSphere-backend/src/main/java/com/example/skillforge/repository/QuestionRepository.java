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
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizId(Long quizId);
    List<Question> findByQuizIdOrderByOrderIndexAsc(Long quizId);
    Long countByQuizId(Long quizId);

  

}