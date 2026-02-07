package com.example.skillforge.repository;

import com.example.skillforge.model.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
       List<QuizAttempt> findByQuizId(Long quizId);

       List<QuizAttempt> findByStudentId(Long studentId);

       /**
        * Find all quiz attempts for a student in a specific course
        */
       @Query("SELECT qa FROM QuizAttempt qa " +
                     "JOIN qa.quiz q " +
                     "JOIN q.topic t " +
                     "JOIN t.course c " +
                     "WHERE qa.studentId = :studentId AND c.id = :courseId " +
                     "ORDER BY qa.attemptTime DESC")
       List<QuizAttempt> findByStudentIdAndCourseId(@Param("studentId") Long studentId,
                     @Param("courseId") Long courseId);

       /**
        * Find recent quiz attempts for a student (limit 10)
        */
       @Query(value = "SELECT * FROM quiz_attempts WHERE student_id = :studentId " +
                     "ORDER BY attempt_time DESC LIMIT 10", nativeQuery = true)
       List<QuizAttempt> findRecentAttemptsByStudentId(@Param("studentId") Long studentId);

       /**
        * Find top performing quiz attempts for a student
        */
       @Query("SELECT qa FROM QuizAttempt qa WHERE qa.studentId = :studentId " +
                     "ORDER BY qa.score DESC")
       List<QuizAttempt> findTopPerformancesByStudentId(@Param("studentId") Long studentId);

       List<QuizAttempt> findByQuizIdAndStudentId(Long quizId, Long studentId);

       // Analytics Queries
       @Query("SELECT AVG(qa.score) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId")
       Double findAverageScoreByQuizId(@Param("quizId") Long quizId);

       @Query("SELECT qa.quiz.title, AVG(qa.score) FROM QuizAttempt qa WHERE qa.quiz.course.instructor.id = :instructorId GROUP BY qa.quiz.title")
       List<Object[]> findAverageQuizScoresByInstructor(@Param("instructorId") Long instructorId);

       @Query("SELECT qa.studentId, qa.quiz.id, qa.score FROM QuizAttempt qa WHERE qa.quiz.course.instructor.id = :instructorId")
       List<Object[]> findRawScoresByInstructor(@Param("instructorId") Long instructorId);

       @Query("SELECT MAX(qa.score) FROM QuizAttempt qa WHERE qa.quiz.topic.id = :topicId AND qa.studentId = :studentId")
       Double findMaxScoreByTopicIdAndStudentId(@Param("topicId") Long topicId, @Param("studentId") Long studentId);

       void deleteByStudentId(Long studentId);
}