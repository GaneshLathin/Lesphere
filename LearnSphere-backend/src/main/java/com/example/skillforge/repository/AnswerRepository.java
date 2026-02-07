package com.example.skillforge.repository;

import com.example.skillforge.model.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

List<Answer> findByQuestion_Id(Long questionId);
}