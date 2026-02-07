package com.example.skillforge.service;

import com.example.skillforge.model.entity.Question;
import java.util.List;

public interface QuestionService {

    List<Question> getQuestionsByQuizId(Long quizId);

}
