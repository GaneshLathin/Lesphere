package com.example.skillforge.service.impl;

import com.example.skillforge.dto.request.ManualQuestion;
import com.example.skillforge.dto.request.ManualQuizRequest;
import com.example.skillforge.dto.request.QuizRequest;
import com.example.skillforge.dto.response.AIQuizResponse;
import com.example.skillforge.model.entity.*;
import com.example.skillforge.repository.*;
import com.example.skillforge.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final com.example.skillforge.service.CourseService courseService;

    @Override
    public Quiz getQuizByTopic(Long topicId) {
        System.out.println("Fetching quizzes for topic ID: " + topicId);

        // Get ALL quizzes for the topic
        var quizzes = quizRepository.findByTopicId(topicId);

        System.out.println("Found quizzes count: " + (quizzes == null ? "null" : quizzes.size()));

        if (quizzes == null || quizzes.isEmpty()) {
            return null; // no quiz found
        }

        // Return the latest quiz (last one created)
        return quizzes.get(quizzes.size() - 1);
    }

    @Override
    public Quiz createQuiz(QuizRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTitle(request.getTitle());
        quiz.setDuration(request.getDuration());
        quiz.setGeneratedByAI(false);
        quiz.setCreatedAt(LocalDateTime.now());

        Quiz savedQuiz = quizRepository.save(quiz);

        courseService.recalculateCourseDuration(course.getId());
        return savedQuiz;
    }

    @Override
    public Quiz createQuizFromAI(Long courseId, Long topicId, AIQuizResponse aiResp) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        // CREATE QUIZ ENTRY
        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTopic(topic);
        quiz.setGeneratedByAI(true);
        quiz.setTitle("AI Generated Quiz");
        quiz.setDuration(30); // Default duration for AI quiz
        quiz.setCreatedAt(LocalDateTime.now());

        quiz = quizRepository.save(quiz);

        // SAVE ALL QUESTIONS + OPTIONS
        for (AIQuizResponse.AIQuestion q : aiResp.getQuestions()) {

            Question question = new Question();
            question.setQuiz(quiz);
            question.setQuestionText(q.getQuestionText());
            question.setPoints(q.getPoints());

            String correctKey = q.getCorrectAnswer().trim().toUpperCase(); // "A" / "B" / "C" / "D"
            String correctValue = null;

            // Convert options to list
            List<String> options = q.getOptions();

            // Convert A→0, B→1, C→2, D→3
            int index = correctKey.charAt(0) - 'A';
            if (index >= 0 && index < options.size()) {
                correctValue = options.get(index).trim(); // REAL text ("main()")
            }

            question.setCorrectAnswer(correctValue);
            questionRepository.save(question);

            // Save each option
            for (String opt : options) {
                Answer answer = new Answer();
                answer.setQuestion(question);
                answer.setOptionText(opt.trim());
                answer.setIsCorrect(opt.trim().equalsIgnoreCase(correctValue));
                answerRepository.save(answer);
            }
        }
        
        courseService.recalculateCourseDuration(courseId);

        return quiz;
    }

    @Override
    public Quiz createManualQuiz(ManualQuizRequest req) {

        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Topic topic = topicRepository.findById(req.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTopic(topic);
        quiz.setTitle(req.getTitle());
        quiz.setDuration(req.getDuration());
        quiz.setGeneratedByAI(false);
        quiz.setCreatedAt(LocalDateTime.now());

        quiz = quizRepository.save(quiz);

        for (ManualQuestion q : req.getQuestions()) {

            Question question = new Question();
            question.setQuiz(quiz);
            question.setQuestionText(q.getQuestionText());
            question.setCorrectAnswer(q.getCorrectAnswer()); // 🔥 VERY IMPORTANT
            questionRepository.save(question);

            for (String opt : q.getOptions()) {
                Answer ans = new Answer();
                ans.setQuestion(question);
                ans.setOptionText(opt);
                ans.setIsCorrect(opt.equals(q.getCorrectAnswer())); // 🔥 VERY IMPORTANT
                answerRepository.save(ans);
            }
        }

        courseService.recalculateCourseDuration(course.getId());

        return quiz;
    }

    public Quiz getQuizById(Long quizId) {
        return quizRepository.findById(quizId).orElse(null);
    }

    @Override
    public Quiz save(Quiz quiz) {
        Quiz saved = quizRepository.save(quiz);
        if (quiz.getCourse() != null) {
            courseService.recalculateCourseDuration(quiz.getCourse().getId());
        }
        return saved;
    }

}
