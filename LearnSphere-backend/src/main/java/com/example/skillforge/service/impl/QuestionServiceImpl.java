package com.example.skillforge.service.impl;

import com.example.skillforge.model.entity.Question;
import com.example.skillforge.repository.QuestionRepository;
import com.example.skillforge.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;

    @Override
    public List<Question> getQuestionsByQuizId(Long quizId) {
        return questionRepository.findByQuizIdOrderByOrderIndexAsc(quizId);
    }


}
