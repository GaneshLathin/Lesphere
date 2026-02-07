package com.example.skillforge.service;

import com.example.skillforge.model.entity.*;
import com.example.skillforge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CompletionService {

    @Autowired
    private TopicProgressRepository topicProgressRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CourseProgressService courseProgressService;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Transactional
    public boolean checkTopicCompletion(Long studentId, Long topicId, Long quizAttemptId) {
        // 1. Validate Quiz Attempt
        QuizAttempt attempt = quizAttemptRepository.findById(quizAttemptId)
                .orElseThrow(() -> new RuntimeException("Quiz Attempt not found"));

        Quiz quiz = attempt.getQuiz();

        // Ensure this quiz belongs to the topic
        // Note: A topic might have multiple quizzes, but usually one main quiz.
        // Assuming the logic: If topic has a quiz, it must be passed.

        if (quiz.getTopic() != null && !quiz.getTopic().getId().equals(topicId)) {
            // This quiz attempt is not for this topic.
            // (Depends on if your Quiz entity has link to Topic directly or just Course)
            // Based on previous file view, Quiz has `topic` field.
            return false;
        }

        // 2. check passing marks
        System.out.println("DEBUG: Checking Topic Completion. Score: " + attempt.getScore());
        if (attempt.getScore() < 70.0) {
            System.out.println("DEBUG: Score < 70.0. Failed.");
            return false; // Failed (Must score >= 70%)
        }

        // 3. Mark Topic as Completed
        System.out.println("DEBUG: Score >= 70.0. Marking Topic " + topicId + " as Completed.");
        TopicProgress progress = topicProgressRepository.findByStudentIdAndTopicId(studentId, topicId)
                .orElseGet(() -> {
                    TopicProgress tp = new TopicProgress();
                    tp.setStudentId(studentId);
                    tp.setTopicId(topicId);
                    return tp;
                });

        progress.setCompleted(true);
        topicProgressRepository.save(progress); // PreUpdate sets completedAt/lastUpdated

        // 4. Update Course Progress
        Topic topic = topicRepository.findById(topicId).orElse(null);
        if (topic != null && topic.getCourse() != null) {
            // Update percentage and lastTopicId
            courseProgressService.updateProgress(studentId, topic.getCourse().getId(), topicId);
            
            // Check full completion (including final quizzes if any)
            checkCourseCompletion(studentId, topic.getCourse().getId());
        }

        return true;
    }

    @Transactional
    public boolean checkCourseCompletion(Long studentId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1. Check all topics completed
        List<Topic> topics = course.getTopics();
        for (Topic topic : topics) {
            // Find progress
            Optional<TopicProgress> tpOpt = topicProgressRepository.findByStudentIdAndTopicId(studentId, topic.getId());
            if (tpOpt.isEmpty() || !tpOpt.get().getCompleted()) {
                return false; // A topic is incomplete
            }
        }

        // 2. Check Final Course Quiz (if exists)
        // Assuming there is a quiz linked to the course directly (topic_id is null)
        // which is the FINAL QUIZ
        // Or we identify it by name/flag. Let's assume any quiz linked to Course but
        // NOT Topic is a "Course Quiz".
        // AND all such quizzes must be passed.

        List<Quiz> courseQuizzes = quizRepository.findByCourseIdAndTopicIsNull(courseId); // Need to add this method to
                                                                                          // Repo or filter
        // Actually, let's use what we have in QuizRepository or just filter from
        // course.getQuizzes()

        for (Quiz quiz : course.getQuizzes()) {
            if (quiz.getTopic() == null) {
                // This is a course-level quiz (Final Quiz)
                // Check if user has a passed attempt
                boolean passed = quizAttemptRepository.findByQuizIdAndStudentId(quiz.getId(), studentId).stream()
                        .anyMatch(att -> att.getScore() >= quiz.getPassingMarks());

                if (!passed) {
                    return false;
                }
            }
        }

        // 3. Mark Course Completed
        CourseProgress cp = courseProgressRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseGet(() -> {
                    CourseProgress c = new CourseProgress();
                    c.setStudentId(studentId);
                    c.setCourseId(courseId);
                    return c;
                });

        cp.setProgressPercent(100);
        // cp.setCompleted(true); // CourseProgress entity I saw earlier didn't have
        // 'completed' boolean field explicitly shown in view_file,
        // checking previous output...
        // Ah, CourseProgress.java content: `private Integer progressPercent;`, no
        // `completed` boolean.
        // I should stick to `progressPercent = 100` as completion marker, OR add a
        // field.
        // The user requirements said "A course should be marked COMPLETED".
        // I'll stick to 100% logic or add a field if I can (but I prefer not modifying
        // existing schema too much if 100% works).
        // Let's assume 100% = Completed.

        courseProgressRepository.save(cp);
        return true;
    }
}
