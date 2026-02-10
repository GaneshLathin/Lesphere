//package com.example.skillforge.service;
//
//import com.example.skillforge.model.entity.*;
//import com.example.skillforge.repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.*;
//
//@Service
//@RequiredArgsConstructor
//public class QuizAttemptService {
//
//    private final QuizAttemptRepository attemptRepository;
//    private final AttemptAnswerRepository attemptAnswerRepository;
//    private final QuestionRepository questionRepository;
//    private final TopicQuizProgressRepository topicQuizProgressRepository;
//    private final TopicProgressRepository topicProgressRepository;
//    private final CourseProgressRepository courseProgressRepository;
//    private final TopicRepository topicRepository;
//    private final MaterialRepository materialRepository;
//    private final TopicMaterialProgressRepository materialProgressRepository;
//    private final QuizRepository quizRepository;
//
//    @Transactional
//    public QuizAttempt evaluateAndSaveAttempt(
//            Long studentId,
//            Long quizId,
//            List<AnswerSubmission> answers,
//            int timeSpentSeconds,
//            Long topicId
//    ) {
//
//        // 1. Load quiz
//        Quiz quiz = quizRepository.findById(quizId)
//                .orElseThrow(() -> new RuntimeException("Quiz not found"));
//
//        // 2. Load all questions for quiz
//        List<Question> questions = questionRepository.findByQuizId(quizId);
//
//        Map<Long, Question> qmap = new HashMap<>();
//        double totalPoints = 0.0;
//
//        for (Question q : questions) {
//            qmap.put(q.getId(), q);
//            totalPoints += q.getPoints() == null ? 1 : q.getPoints();
//        }
//
//        // 3. Evaluate submissions
//        double earned = 0.0;
//        Map<Long, Integer> pointsMap = new HashMap<>();
//
//        for (AnswerSubmission sub : answers) {
//
//            Question q = qmap.get(sub.getQuestionId());
//            int pts = 0;
//
////            if (q != null && q.getCorrectAnswer() != null) {
////                if (q.getCorrectAnswer().trim().equalsIgnoreCase(
////                        sub.getAnswerText() == null ? "" : sub.getAnswerText().trim())) {
////                    pts = q.getPoints() == null ? 1 : q.getPoints();
////                }
////            }
//            if (q != null && q.getCorrectAnswer() != null) {
//                String correct = q.getCorrectAnswer().trim();
//                String submitted = sub.getAnswerText() == null ? "" : sub.getAnswerText().trim();
//
//                if (correct.equalsIgnoreCase(submitted)) {
//                    pts = q.getPoints() == null ? 1 : q.getPoints();
//                }
//            }
//
//
//            pointsMap.put(sub.getQuestionId(), pts);
//            earned += pts;
//        }
//
//        double scorePercent = totalPoints == 0 ? 0 : (earned / totalPoints) * 100;
//
//        // 4. Save QuizAttempt
//        QuizAttempt attempt = new QuizAttempt();
//        attempt.setQuiz(quiz);
//        attempt.setStudentId(studentId);
//        attempt.setScore(scorePercent);
//        attempt.setAttemptTime(LocalDateTime.now());
//        attempt.setTimeSpent(timeSpentSeconds);
//        attempt.setStatus("COMPLETED");
////        attempt.setCorrectAnswers((int) earned);
////        attempt.setCreatedAt(LocalDateTime.now());
//
//        attempt = attemptRepository.save(attempt);
//
//        // 5. Save each answer SAFELY (fixed null FK crash)
//        for (AnswerSubmission sub : answers) {
//
//            Question q = qmap.get(sub.getQuestionId());
//
//            if (q == null) {
//                // Skip invalid answers (prevents DB crash)
//                System.out.println("[WARN] Skipped answer for missing questionId: " + sub.getQuestionId());
//                continue;
//            }
//
//            AttemptAnswer aa = new AttemptAnswer();
//            aa.setAttempt(attempt);
//            aa.setQuestion(q);
//            aa.setStudentAnswer(sub.getAnswerText());
//            aa.setIsCorrect(pointsMap.get(sub.getQuestionId()) > 0);
//            aa.setPointsEarned(pointsMap.get(sub.getQuestionId()));
//
//            attemptAnswerRepository.save(aa);
//        }
//
//        // 6. Update progress (only if topicId provided)
//        if (topicId != null) {
//
//            // Topic Quiz Progress
//            TopicQuizProgress tqp =
//                    topicQuizProgressRepository
//                            .findByStudentIdAndTopicId(studentId, topicId)
//                            .orElseGet(() -> {
//                                TopicQuizProgress t = new TopicQuizProgress();
//                                t.setStudentId(studentId);
//                                t.setTopicId(topicId);
//                                return t;
//                            });
//
//            tqp.setScore(scorePercent);
//            tqp.setCompleted(true);
//            tqp.setCompletedAt(LocalDateTime.now());
//            topicQuizProgressRepository.save(tqp);
//
//            // Material completion check
//            List<Long> materialIds = materialRepository.findMaterialIdsByTopicId(topicId);
//
//            boolean materialDone =
//                    materialProgressRepository
//                            .findByStudentIdAndMaterialIdIn(studentId, materialIds)
//                            .stream()
//                            .anyMatch(TopicMaterialProgress::getCompleted);
//
//            if (materialDone) {
//                TopicProgress tp = topicProgressRepository
//                        .findByStudentIdAndTopicId(studentId, topicId)
//                        .orElseGet(() -> {
//                            TopicProgress t = new TopicProgress();
//                            t.setStudentId(studentId);
//                            t.setTopicId(topicId);
//                            return t;
//                        });
//
//                tp.setCompleted(true);
//                tp.setCompletedAt(LocalDateTime.now());
//                topicProgressRepository.save(tp);
//            }
//
//            // Update course progress
//            Topic topic = topicRepository.findById(topicId)
//                    .orElseThrow(() -> new RuntimeException("Topic not found"));
//
//            Long courseId = topic.getCourse().getId();
//
//            List<Topic> allTopics = topicRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
//            List<Long> allTopicIds = allTopics.stream().map(Topic::getId).toList();
//
//            int completedCount = topicProgressRepository
//                    .findByStudentIdAndTopicIdIn(studentId, allTopicIds)
//                    .stream()
//                    .filter(TopicProgress::getCompleted)
//                    .toList()
//                    .size();
//
//            int percent = allTopics.isEmpty()
//                    ? 0
//                    : (int) Math.round((completedCount * 100.0) / allTopics.size());
//
//            CourseProgress cp = courseProgressRepository
//                    .findByStudentIdAndCourseId(studentId, courseId)
//                    .orElseGet(() -> {
//                        CourseProgress c = new CourseProgress();
//                        c.setStudentId(studentId);
//                        c.setCourseId(courseId);
//                        return c;
//                    });
//
//            cp.setProgressPercent(percent);
//            cp.setLastUpdated(LocalDateTime.now());
//            courseProgressRepository.save(cp);
//        }
//
//        return attempt;
//    }
//
//
//    // DTO
//    public static class AnswerSubmission {
//        private Long questionId;
//        private String answerText;
//
//        public Long getQuestionId() { return questionId; }
//        public void setQuestionId(Long id) { this.questionId = id; }
//
//        public String getAnswerText() { return answerText; }
//        public void setAnswerText(String a) { this.answerText = a; }
//    }
//}

package com.example.skillforge.service;

import com.example.skillforge.model.entity.*;
import com.example.skillforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final QuestionRepository questionRepository;
    private final TopicQuizProgressRepository topicQuizProgressRepository;
    private final TopicProgressRepository topicProgressRepository;
    private final TopicRepository topicRepository;
    private final QuizRepository quizRepository;
    private final CourseProgressService courseProgressService;
    private final CompletionService completionService;
    private final UserActivityService userActivityService;
    private final StudentRepository studentRepository;

    @Transactional
    public QuizAttempt evaluateAndSaveAttempt(
            Long studentId,
            Long quizId,
            List<AnswerSubmission> answers,
            int timeSpentSeconds,
            Long topicId) {

        System.out.println("DEBUG: Evaluate Attempt - TimeSpent: " + timeSpentSeconds + "s, TopicId: " + topicId);

        // 1. Load quiz
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // 2. Load questions of this quiz
        List<Question> questions = questionRepository.findByQuizId(quizId);

        Map<Long, Question> qmap = new HashMap<>();
        double totalPoints = 0.0;

        for (Question q : questions) {
            qmap.put(q.getId(), q);
            totalPoints += q.getPoints() == null ? 1 : q.getPoints();
        }

        // 3. Evaluate each submitted answer
        double earned = 0.0;
        Map<Long, Integer> pointsMap = new HashMap<>();

        for (AnswerSubmission sub : answers) {

            Question q = qmap.get(sub.getQuestionId());
            int pts = 0;

            if (q != null && q.getCorrectAnswer() != null) {

                String correct = q.getCorrectAnswer().trim();
                String submitted = sub.getAnswerText() == null ? "" : sub.getAnswerText().trim();

                System.out.println("[QuizEval] QID: " + q.getId());
                System.out.println("[QuizEval] Correct: '" + correct + "'");
                System.out.println("[QuizEval] Submitted: '" + submitted + "'");

                if (correct.equalsIgnoreCase(submitted)) {
                    pts = q.getPoints() == null ? 1 : q.getPoints();
                    System.out.println("[QuizEval] Match! Points: " + pts);
                } else {
                    System.out.println("[QuizEval] Mismatch.");
                }
            }

            pointsMap.put(sub.getQuestionId(), pts);
            earned += pts;
        }

        double scorePercent = totalPoints == 0 ? 0 : (earned / totalPoints) * 100;

        // 4. Save QuizAttempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudentId(studentId);
        attempt.setScore(scorePercent);
        attempt.setAttemptTime(LocalDateTime.now());
        attempt.setTimeSpent(timeSpentSeconds);
        attempt.setStatus(scorePercent >= 60 ? "PASSED" : "FAILED"); // Assume 60% is passing for now, or use
                                                                     // quiz.passingMarks

        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        attempt = savedAttempt;

        // --- GAMIFICATION: AWARD POINTS ---
        if ("PASSED".equals(savedAttempt.getStatus())) {

            // 🔥 FIXED BUG: Mark TopicQuizProgress as completed if passed
            // This ensures overall course progress sees the quiz as done.
            if (topicId != null) {
                TopicQuizProgress tqp = topicQuizProgressRepository
                        .findByStudentIdAndTopicId(studentId, topicId)
                        .orElseGet(() -> {
                            TopicQuizProgress t = new TopicQuizProgress();
                            t.setStudentId(studentId);
                            t.setTopicId(topicId);
                            return t;
                        });

                if (!Boolean.TRUE.equals(tqp.getCompleted())) {
                    tqp.setCompleted(true);
                    tqp.setCompletedAt(LocalDateTime.now());
                    tqp.setScore(scorePercent);
                    topicQuizProgressRepository.save(tqp);
                    System.out.println("DEBUG: Marked TopicQuiz for Topic " + topicId + " as COMPLETED.");
                }
            }

            // Check if student already passed this quiz previously
            List<QuizAttempt> previousAttempts = attemptRepository.findByQuizIdAndStudentId(quizId, studentId);
            boolean alreadyPassed = previousAttempts.stream()
                    .anyMatch(a -> !a.getId().equals(savedAttempt.getId()) && "PASSED".equals(a.getStatus()));

            if (!alreadyPassed) {
                // Calculate attempt number (this is the Nth attempt)
                int attemptCount = previousAttempts.size(); // Includes current attempt since we just saved it?
                // Wait, findByQuizIdAndStudentId might include current if transaction
                // committed?
                // Let's rely on size. If DB consistency is strict, count might be 0 if not
                // committed yet?
                // Actually, let's use the list size.
                // If we just saved 'attempt', and findBy... returns it, size is N.

                int pointsToAward = 0;
                if (attemptCount <= 1)
                    pointsToAward = quiz.getRewardFirstTry();
                else if (attemptCount == 2)
                    pointsToAward = quiz.getRewardSecondTry();
                else if (attemptCount == 3)
                    pointsToAward = quiz.getRewardThirdTry();
                else
                    pointsToAward = quiz.getRewardFourthPlus();

                if (pointsToAward > 0) {
                    Student student = studentRepository.findById(studentId).orElse(null);
                    if (student != null) {
                        student.setTotalPoints(student.getTotalPoints() + pointsToAward);
                        studentRepository.save(student);
                        System.out.println("Awarded " + pointsToAward + " points to Student " + studentId);
                    }
                }
            }
        }

        // 5. Save all answers
        for (AnswerSubmission sub : answers) {

            Question q = qmap.get(sub.getQuestionId());
            if (q == null)
                continue; // skip invalid questionIds

            AttemptAnswer aa = new AttemptAnswer();
            aa.setAttempt(attempt);
            aa.setQuestion(q);
            aa.setStudentAnswer(sub.getAnswerText());
            aa.setIsCorrect(pointsMap.get(sub.getQuestionId()) > 0);
            aa.setPointsEarned(pointsMap.get(sub.getQuestionId()));

            attemptAnswerRepository.save(aa);
        }

        // 6. Update progress via CompletionService (Strict Rules)
        if (topicId != null) {
            // Check Topic Completion (Passing marks required)
            completionService.checkTopicCompletion(studentId, topicId, attempt.getId());

            // If topic completed, or always, check Course Completion
            Topic topic = topicRepository.findById(topicId).orElse(null);
            if (topic != null) {
                completionService.checkCourseCompletion(studentId, topic.getCourse().getId());

                // 🔥 Add Time Spent to Course Progress
                if (timeSpentSeconds > 0) {
                    int mins = (int) Math.ceil(timeSpentSeconds / 60.0);
                    courseProgressService.addTimeSpent(studentId, topic.getCourse().getId(), mins);
                }
            }
        } else {
            // This might be a Course Quiz (Final Quiz)
            Long courseId = quiz.getCourse().getId();
            completionService.checkCourseCompletion(studentId, courseId);

            // 🔥 Add Time Spent to Course Progress
            if (timeSpentSeconds > 0) {
                int mins = (int) Math.ceil(timeSpentSeconds / 60.0);
                courseProgressService.addTimeSpent(studentId, courseId, mins);
            }
        }

        // 🔥 Log Activity Time for Analytics
        if (timeSpentSeconds > 0) {
            int mins = (int) Math.ceil(timeSpentSeconds / 60.0);
            try {
                studentRepository.findById(studentId).ifPresent(student -> {
                    userActivityService.logTime(student.getUser().getId(), mins);
                });
            } catch (Exception e) {
                System.err.println("Failed to log activity time: " + e.getMessage());
            }
        }

        return attempt;
    }

    public List<QuizAttempt> getAttempts(Long studentId, Long quizId) {
        return attemptRepository.findByQuizIdAndStudentId(quizId, studentId);
    }

    // DTO for incoming answers
    public static class AnswerSubmission {
        private Long questionId;
        private String answerText;

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long id) {
            this.questionId = id;
        }

        public String getAnswerText() {
            return answerText;
        }

        public void setAnswerText(String a) {
            this.answerText = a;
        }
    }
}
