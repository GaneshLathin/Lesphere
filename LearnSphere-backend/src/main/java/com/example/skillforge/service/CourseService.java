//package com.example.skillforge.service;
//
//import com.example.skillforge.dto.request.CourseRequest;
//import com.example.skillforge.dto.response.CourseResponse;
//import com.example.skillforge.model.entity.*;
//import com.example.skillforge.model.enums.DifficultyLevel;
//import com.example.skillforge.repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class CourseService {
//
//    private final CourseRepository courseRepository;
//    private final InstructorRepository instructorRepository;
//    private final EnrollmentRepository enrollmentRepository;
//    private final UserRepository userRepository;
//    private final CourseProgressRepository courseProgressRepository;
//    private final StudentRepository studentRepository;
//
//    @Transactional
//    public CourseResponse createCourse(CourseRequest request, Long userId) {
//        // Find instructor by user ID
//        Instructor instructor = instructorRepository.findByUserId(userId)
//                .orElseThrow(() -> new RuntimeException("Instructor not found"));
//
//        Course course = new Course();
//        course.setTitle(request.getTitle());
//        course.setDescription(request.getDescription());
//        course.setInstructor(instructor); // Set mapped relationship
//        course.setDifficultyLevel(request.getDifficultyLevel());
//        course.setThumbnailUrl(request.getThumbnailUrl());
//        course.setDuration(request.getDuration() != null ? request.getDuration() : 0);
//        course.setIsPublished(false);
//
//        course = courseRepository.save(course);
//
//        // Update instructor stats
//        instructor.setCoursesCreated(instructor.getCoursesCreated() + 1);
//        instructorRepository.save(instructor);
//
//        return mapToCourseResponse(course, null);
//    }
//
//    public CourseResponse getCourseById(Long id, Long userId) {
//        Course course = courseRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Course not found"));
//        return mapToCourseResponse(course, userId);
//    }
//
//    public List<CourseResponse> getAllCourses(Long userId) {
//        return courseRepository.findAll().stream()
//                .map(course -> mapToCourseResponse(course, userId))
//                .collect(Collectors.toList());
//    }
//
//
//    public Page<CourseResponse> getAllCourses(
//            int page,
//            int size,
//            String sortBy,
//            String direction,
//            String difficulty,
//            String durationRange,
//            String search,
//            Long studentUserId
//    ) {
//
//        // Difficulty filter
//        DifficultyLevel level = null;
//        if (difficulty != null && !difficulty.isBlank()) {
//            level = DifficultyLevel.valueOf(difficulty.toUpperCase());
//        }
//
//        // Sorting
//        Sort sort = direction.equalsIgnoreCase("asc")
//                ? Sort.by(sortBy).ascending()
//                : Sort.by(sortBy).descending();
//
//        Pageable pageable = PageRequest.of(page, size, sort);
//
//        // Fetch raw course page
//        Page<Course> coursePage = courseRepository.findWithFilters(
//                level,
//                durationRange,
//                (search == null || search.isBlank()) ? null : search.trim(),
//                pageable
//        );
//
//        // Map to response + include enrolled/progress
//        return coursePage.map(course -> mapToCourseResponse(course, studentUserId));
//    }
//
//
//    public List<CourseResponse> getCoursesByInstructor(Long userId) {
//        Instructor instructor = instructorRepository.findByUserId(userId)
//                .orElseThrow(() -> new RuntimeException("Instructor not found"));
//
//        return instructor.getCourses().stream()
//                .map(course -> mapToCourseResponse(course, null))
//                .collect(Collectors.toList());
//    }
//
//    public List<CourseResponse> getPublishedCourses(Long userId) {
//        return courseRepository.findByIsPublished(true).stream()
//                .map(course -> mapToCourseResponse(course, userId))
//                .collect(Collectors.toList());
//    }
//
//    @Transactional
//    public CourseResponse updateCourse(Long id, CourseRequest request) {
//        Course course = courseRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Course not found"));
//
//        course.setTitle(request.getTitle());
//        course.setDescription(request.getDescription());
//        course.setDifficultyLevel(request.getDifficultyLevel());
//        course.setThumbnailUrl(request.getThumbnailUrl());
//        course.setDuration(request.getDuration() != null ? request.getDuration() : course.getDuration());
//
//        course = courseRepository.save(course);
//        return mapToCourseResponse(course, null);
//    }
//
//    @Transactional
//    public void publishCourse(Long id) {
//        Course course = courseRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Course not found"));
//        course.setIsPublished(true);
//        courseRepository.save(course);
//    }
//
//    @Transactional
//    public void deleteCourse(Long id) {
//        Course course = courseRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Course not found"));
//
//        // Update instructor stats
//        Instructor instructor = course.getInstructor();
//        instructor.setCoursesCreated(Math.max(0, instructor.getCoursesCreated() - 1));
//        instructorRepository.save(instructor);
//
//        courseRepository.delete(course);
//    }
//
//private CourseResponse mapToCourseResponse(Course course, Long userId) {
//
//    User instructorUser = course.getInstructor().getUser();
//
//    // defaults
//    Boolean isEnrolled = false;
//    Integer progressPercent = 0;
//    LocalDateTime lastAccessed = null;
//
//    if (userId != null) {
//
//        // 1️⃣ Fetch Student using userId → get internal student.id
//        Student student = studentRepository.findByUserId(userId)
//                .orElseThrow(() -> new RuntimeException("Student Not Found"));
//        Long studentInternalId = student.getId();
//
//        // 2️⃣ Check enrollment correctly using internal student.id
//        Enrollment enrollment = enrollmentRepository
//                .findByStudentIdAndCourseId(studentInternalId, course.getId())
//                .orElse(null);
//
//        isEnrolled = (enrollment != null);
//
//        // 3️⃣ Find CourseProgress with dual fallback (userId → studentId)
//        CourseProgress cp = courseProgressRepository
//                .findByStudentIdAndCourseId(userId, course.getId())
//                .orElse(null);
//
//        if (cp == null) {
//            cp = courseProgressRepository
//                    .findByStudentIdAndCourseId(studentInternalId, course.getId())
//                    .orElse(null);
//        }
//
//        // 4️⃣ Extract progress + lastAccessed
//        if (cp != null) {
//            progressPercent = cp.getProgressPercent() != null ? cp.getProgressPercent() : 0;
//            lastAccessed = cp.getLastUpdated();
//        } else if (enrollment != null) {
//            // fallback (if old data in enrollment table)
//            progressPercent = enrollment.getCompletionPercentage() != null
//                    ? enrollment.getCompletionPercentage()
//                    : 0;
//
//            lastAccessed = enrollment.getLastAccessedAt();
//        }
//
//        System.out.println("🔥 Progress for course " + course.getId() +
//                " | userId=" + userId +
//                " | studentInternalId=" + studentInternalId +
//                " | progress=" + progressPercent +
//                " | lastAccessed=" + lastAccessed);
//    }
//
//    return CourseResponse.builder()
//            .id(course.getId())
//            .title(course.getTitle())
//            .description(course.getDescription())
//            .instructorId(instructorUser.getId())
//            .instructorName(instructorUser.getName())
//            .difficultyLevel(course.getDifficultyLevel())
//            .thumbnailUrl(course.getThumbnailUrl())
//            .duration(course.getDuration())
//            .totalTopics(course.getTopics().size())
//            .totalEnrollments(course.getTotalEnrollments())
//            .isPublished(course.getIsPublished())
//            .isEnrolled(isEnrolled)
//            .createdAt(course.getCreatedAt())
//            .progressPercent(progressPercent)
//            .lastAccessed(lastAccessed)
//            .build();
//}
//
//
//}

package com.example.skillforge.service;

import com.example.skillforge.dto.request.CourseRequest;
import com.example.skillforge.dto.response.CourseResponse;
import com.example.skillforge.model.entity.*;
import com.example.skillforge.model.enums.DifficultyLevel;
import com.example.skillforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final StudentRepository studentRepository;
    private final TopicProgressRepository topicProgressRepository;
    private final QuizRepository quizRepository;
    private final TopicRepository topicRepository;
    private final TopicQuizProgressRepository topicQuizProgressRepository;

    @Transactional
    public CourseResponse createCourse(CourseRequest request, Long userId) {
        Instructor instructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setInstructor(instructor);
        course.setDifficultyLevel(request.getDifficultyLevel());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setDuration(request.getDuration() != null ? request.getDuration() : 0);
        course.setCategory(request.getCategory());
        course.setTags(request.getTags());
        course.setCourseAdminUserId(request.getCourseAdminUserId());
        course.setIsPublished(false);

        course = courseRepository.save(course);

        instructor.setCoursesCreated(instructor.getCoursesCreated() + 1);
        instructorRepository.save(instructor);

        return mapToCourseResponse(course, null);
    }

    public CourseResponse getCourseById(Long id, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return mapToCourseResponse(course, userId);
    }

    public List<CourseResponse> getAllCourses(Long userId) {
        return courseRepository.findAll().stream()
                .map(course -> mapToCourseResponse(course, userId))
                .collect(Collectors.toList());
    }

    /**
     * Paginated + filtered list for Browse courses.
     *
     * If studentId != null -> return only published courses (student view)
     * Otherwise return all courses (admin/general)
     *
     * @return Page<CourseResponse>
     */

    public Page<CourseResponse> getAllCourses(
            int page,
            int size,
            String sortBy,
            String direction,
            String difficulty,
            String durationRange,
            String search,
            Long studentId,
            Boolean published,
            Long instructorId) {

        // Convert difficulty → enum
        DifficultyLevel level = null;
        if (difficulty != null && !difficulty.isBlank()) {
            try {
                level = DifficultyLevel.valueOf(difficulty.toUpperCase().trim());
            } catch (Exception e) {
                throw new RuntimeException("Invalid difficulty. Use BEGINNER, INTERMEDIATE, ADVANCED");
            }
        }

        // Sorting logic
        String sortField;
        switch ((sortBy == null ? "createdAt" : sortBy).toLowerCase()) {
            case "oldest":
                sortField = "createdAt";
                direction = "asc";
                break;
            case "duration":
                sortField = "duration";
                break;
            case "title":
            case "az":
                sortField = "title";
                break;
            case "most_enrolled":
                sortField = "totalEnrollments";
                break;
            default:
                sortField = "createdAt";
        }

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortField).ascending()
                : Sort.by(sortField).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        // Clean search
        String cleanedSearch = (search == null || search.isBlank()) ? null : search.trim();

        Page<Course> coursePage;

        // STUDENT LOGIC (Published only)
        if (studentId != null) {
            coursePage = courseRepository.findWithFiltersForStudents(
                    level,
                    durationRange,
                    cleanedSearch,
                    pageable);
        }

        // ADMIN LOGIC (All courses + published + instructor filters)
        else {
            coursePage = courseRepository.findWithFiltersForAdmin(
                    level,
                    durationRange,
                    cleanedSearch,
                    published, // NEW
                    instructorId, // NEW
                    pageable);
        }

        return coursePage.map(course -> mapToCourseResponse(course, studentId));
    }

    public List<CourseResponse> getCoursesByInstructor(Long userId) {
        Instructor instructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        return instructor.getCourses().stream()
                .map(course -> mapToCourseResponse(course, null))
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getPublishedCourses(Long userId) {
        return courseRepository.findByIsPublished(true).stream()
                .map(course -> mapToCourseResponse(course, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setDifficultyLevel(request.getDifficultyLevel());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setDuration(request.getDuration() != null ? request.getDuration() : course.getDuration());
        course.setCategory(request.getCategory());
        course.setTags(request.getTags());
        course.setCourseAdminUserId(request.getCourseAdminUserId());

        course = courseRepository.save(course);
        return mapToCourseResponse(course, null);
    }

    @Transactional
    public void publishCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setIsPublished(true);
        courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Instructor instructor = course.getInstructor();
        instructor.setCoursesCreated(Math.max(0, instructor.getCoursesCreated() - 1));
        instructorRepository.save(instructor);

        courseRepository.delete(course);
    }

    private CourseResponse mapToCourseResponse(Course course, Long userId) {
        User instructorUser = course.getInstructor().getUser();

        Boolean isEnrolled = false;
        Integer progressPercent = 0;
        LocalDateTime lastAccessed = null;

        if (userId != null) {
            Student student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Student Not Found"));
            Long studentInternalId = student.getId();

            Enrollment enrollment = enrollmentRepository
                    .findByStudentIdAndCourseId(studentInternalId, course.getId())
                    .orElse(null);

            isEnrolled = (enrollment != null);

            CourseProgress cp = courseProgressRepository
                    .findByStudentIdAndCourseId(userId, course.getId())
                    .orElse(null);

            if (cp == null) {
                cp = courseProgressRepository
                        .findByStudentIdAndCourseId(studentInternalId, course.getId())
                        .orElse(null);
            }

            if (cp != null) {
                progressPercent = cp.getProgressPercent() != null ? cp.getProgressPercent() : 0;
                lastAccessed = cp.getLastUpdated();
            } else if (enrollment != null) {
                progressPercent = enrollment.getCompletionPercentage() != null
                        ? enrollment.getCompletionPercentage()
                        : 0;
                lastAccessed = enrollment.getLastAccessedAt();
            }
        }

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorId(instructorUser.getId())
                .instructorName(instructorUser.getName())
                .difficultyLevel(course.getDifficultyLevel())
                .thumbnailUrl(course.getThumbnailUrl())
                .duration(course.getDuration())
                .totalTopics(course.getTopics().size())
                .totalEnrollments(course.getTotalEnrollments())
                .isPublished(course.getIsPublished())
                .isEnrolled(isEnrolled)
                .tags(course.getTags())
                .viewsCount(course.getViewsCount())
                .courseAdminUserId(course.getCourseAdminUserId())
                .createdAt(course.getCreatedAt())
                .progressPercent(progressPercent)
                .lastAccessed(lastAccessed)
                .build();
    }

    @Transactional
    public void recalculateCourseDuration(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        int totalMinutes = 0;

        // 1. Sum up Material Durations (via Topics)
        for (Topic topic : course.getTopics()) {
            for (Material material : topic.getMaterials()) {
                if (material.getDurationMinutes() != null) {
                    totalMinutes += material.getDurationMinutes();
                }
            }
        }

        // 2. Sum up Quiz Durations (Linked directly to Course)
        List<Quiz> quizzes = quizRepository.findByCourseId(courseId);
        for (Quiz quiz : quizzes) {
            if (quiz.getDuration() != null) {
                totalMinutes += quiz.getDuration();
            }
        }

        course.setDuration(totalMinutes);
        courseRepository.save(course);
        System.out.println("Updated Course Duration for ID " + courseId + ": " + totalMinutes + " minutes");
    }

    @Transactional
    public void incrementViewCount(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setViewsCount(course.getViewsCount() + 1);
        courseRepository.save(course);
    }
}
