// package com.example.skillforge.service;

// import com.example.skillforge.dto.request.CourseRequest;
// import com.example.skillforge.dto.response.CourseResponse;
// import com.example.skillforge.model.entity.*;
// import com.example.skillforge.model.enums.DifficultyLevel;
// import com.example.skillforge.repository.*;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageRequest;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.domain.Sort;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// public class CourseService {

//     private final CourseRepository courseRepository;
//     private final InstructorRepository instructorRepository;
//     private final EnrollmentRepository enrollmentRepository;
//     private final UserRepository userRepository;
//     private final CourseProgressRepository courseProgressRepository;
//     private final StudentRepository studentRepository;

//     @Transactional
//     public CourseResponse createCourse(CourseRequest request, Long userId) {
//         // Find instructor by user ID
//         Instructor instructor = instructorRepository.findByUserId(userId)
//                 .orElseThrow(() -> new RuntimeException("Instructor not found"));

//         Course course = new Course();
//         course.setTitle(request.getTitle());
//         course.setDescription(request.getDescription());
//         course.setInstructor(instructor); // Set mapped relationship
//         course.setDifficultyLevel(request.getDifficultyLevel());
//         course.setThumbnailUrl(request.getThumbnailUrl());
//         course.setDuration(request.getDuration() != null ? request.getDuration() : 0);
//         course.setIsPublished(false);

//         course = courseRepository.save(course);

//         // Update instructor stats
//         instructor.setCoursesCreated(instructor.getCoursesCreated() + 1);
//         instructorRepository.save(instructor);

//         return mapToCourseResponse(course, null);
//     }

//     public CourseResponse getCourseById(Long id, Long userId) {
//         Course course = courseRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Course not found"));
//         return mapToCourseResponse(course, userId);
//     }

//     public List<CourseResponse> getAllCourses(Long userId) {
//         return courseRepository.findAll().stream()
//                 .map(course -> mapToCourseResponse(course, userId))
//                 .collect(Collectors.toList());
//     }

//     public Page<CourseResponse> getAllCourses(
//             int page,
//             int size,
//             String sortBy,
//             String direction,
//             String difficulty,
//             String durationRange,
//             String search,
//             Long studentUserId
//     ) {

//         // Difficulty filter
//         DifficultyLevel level = null;
//         if (difficulty != null && !difficulty.isBlank()) {
//             level = DifficultyLevel.valueOf(difficulty.toUpperCase());
//         }

//         // Sorting
//         Sort sort = direction.equalsIgnoreCase("asc")
//                 ? Sort.by(sortBy).ascending()
//                 : Sort.by(sortBy).descending();

//         Pageable pageable = PageRequest.of(page, size, sort);

//         // Fetch raw course page
//         Page<Course> coursePage = courseRepository.findWithFilters(
//                 level,
//                 durationRange,
//                 (search == null || search.isBlank()) ? null : search.trim(),
//                 pageable
//         );

//         // Map to response + include enrolled/progress
//         return coursePage.map(course -> mapToCourseResponse(course, studentUserId));
//     }

//     public List<CourseResponse> getCoursesByInstructor(Long userId) {
//         Instructor instructor = instructorRepository.findByUserId(userId)
//                 .orElseThrow(() -> new RuntimeException("Instructor not found"));

//         return instructor.getCourses().stream()
//                 .map(course -> mapToCourseResponse(course, null))
//                 .collect(Collectors.toList());
//     }

//     public List<CourseResponse> getPublishedCourses(Long userId) {
//         return courseRepository.findByIsPublished(true).stream()
//                 .map(course -> mapToCourseResponse(course, userId))
//                 .collect(Collectors.toList());
//     }

//     @Transactional
//     public CourseResponse updateCourse(Long id, CourseRequest request) {
//         Course course = courseRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Course not found"));

//         course.setTitle(request.getTitle());
//         course.setDescription(request.getDescription());
//         course.setDifficultyLevel(request.getDifficultyLevel());
//         course.setThumbnailUrl(request.getThumbnailUrl());
//         course.setDuration(request.getDuration() != null ? request.getDuration() : course.getDuration());

//         if (request.getIsPublished() != null) {
//             course.setIsPublished(request.getIsPublished());
//         }

//         course = courseRepository.save(course);
//         return mapToCourseResponse(course, null);
//     }

//     @Transactional
//     public void publishCourse(Long id) {
//         Course course = courseRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Course not found"));
//         course.setIsPublished(true);
//         courseRepository.save(course);
//     }

//     @Transactional
//     public void deleteCourse(Long id) {
//         Course course = courseRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Course not found"));

//         // Update instructor stats
//         Instructor instructor = course.getInstructor();
//         instructor.setCoursesCreated(Math.max(0, instructor.getCoursesCreated() - 1));
//         instructorRepository.save(instructor);

//         courseRepository.delete(course);
//     }

// private CourseResponse mapToCourseResponse(Course course, Long userId) {

//     User instructorUser = course.getInstructor().getUser();

//     // defaults
//     Boolean isEnrolled = false;
//     Integer progressPercent = 0;
//     LocalDateTime lastAccessed = null;

//     if (userId != null) {

//         // 1️⃣ Fetch Student using userId → get internal student.id
//         Student student = studentRepository.findByUserId(userId)
//                 .orElseThrow(() -> new RuntimeException("Student Not Found"));
//         Long studentInternalId = student.getId();

//         // 2️⃣ Check enrollment correctly using internal student.id
//         Enrollment enrollment = enrollmentRepository
//                 .findByStudentIdAndCourseId(studentInternalId, course.getId())
//                 .orElse(null);

//         isEnrolled = (enrollment != null);

//         // 3️⃣ Find CourseProgress with dual fallback (userId → studentId)
//         CourseProgress cp = courseProgressRepository
//                 .findByStudentIdAndCourseId(userId, course.getId())
//                 .orElse(null);

//         if (cp == null) {
//             cp = courseProgressRepository
//                     .findByStudentIdAndCourseId(studentInternalId, course.getId())
//                     .orElse(null);
//         }

//         // 4️⃣ Extract progress + lastAccessed
//         if (cp != null) {
//             progressPercent = cp.getProgressPercent() != null ? cp.getProgressPercent() : 0;
//             lastAccessed = cp.getLastUpdated();
//         } else if (enrollment != null) {
//             // fallback (if old data in enrollment table)
//             progressPercent = enrollment.getCompletionPercentage() != null
//                     ? enrollment.getCompletionPercentage()
//                     : 0;

//             lastAccessed = enrollment.getLastAccessedAt();
//         }

//         System.out.println("🔥 Progress for course " + course.getId() +
//                 " | userId=" + userId +
//                 " | studentInternalId=" + studentInternalId +
//                 " | progress=" + progressPercent +
//                 " | lastAccessed=" + lastAccessed);
//     }

//     return CourseResponse.builder()
//             .id(course.getId())
//             .title(course.getTitle())
//             .description(course.getDescription())
//             .instructorId(instructorUser.getId())
//             .instructorName(instructorUser.getName())
//             .difficultyLevel(course.getDifficultyLevel())
//             .thumbnailUrl(course.getThumbnailUrl())
//             .duration(course.getDuration())
//             .totalTopics(course.getTopics().size())
//             .totalEnrollments(course.getTotalEnrollments())
//             .isPublished(course.getIsPublished())
//             .isEnrolled(isEnrolled)
//             .createdAt(course.getCreatedAt())
//             .progressPercent(progressPercent)
//             .lastAccessed(lastAccessed)
//             .build();
// }

// }

package com.example.skillforge.service;

import com.example.skillforge.dto.request.CourseRequest;
import com.example.skillforge.dto.response.CourseResponse;
import com.example.skillforge.model.entity.*;
import com.example.skillforge.model.enums.DifficultyLevel;
import com.example.skillforge.model.enums.AccessRule;
import com.example.skillforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final S3StorageService s3StorageService;
    private final TopicMaterialProgressRepository topicMaterialProgressRepository;
    private final ReviewRepository reviewRepository;
    private final CertificateRepository certificateRepository;
    private final AnalyticsRepository analyticsRepository;

    @Transactional
    public CourseResponse createCourse(CourseRequest request, Long userId) {
        // Validate price if access rule is ON_PAYMENT
        if (request.getAccessRule() == AccessRule.ON_PAYMENT) {
            if (request.getPrice() == null || request.getPrice() <= 0) {
                throw new RuntimeException(
                        "Price is required and must be greater than 0 when Access Rule is ON_PAYMENT");
            }
        }

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
        course.setVisibility(request.getVisibility());
        course.setAccessRule(request.getAccessRule());
        course.setPrice(request.getPrice());
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
        // Validate price if access rule is ON_PAYMENT
        if (request.getAccessRule() == AccessRule.ON_PAYMENT) {
            if (request.getPrice() == null || request.getPrice() <= 0) {
                throw new RuntimeException(
                        "Price is required and must be greater than 0 when Access Rule is ON_PAYMENT");
            }
        }

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
        course.setVisibility(request.getVisibility());
        course.setAccessRule(request.getAccessRule());
        course.setPrice(request.getPrice());

        course = courseRepository.save(course);
        return mapToCourseResponse(course, null);
    }

    @Transactional
    public boolean togglePublish(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setIsPublished(!course.getIsPublished());
        courseRepository.save(course);
        return course.getIsPublished();
    }

    @Transactional
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')") // Ensure security
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1. Manually cleanup progress and other related data to avoid FK violations
        
        // Cleanup Reviews
        reviewRepository.deleteByCourseId(id);
        
        // Cleanup Certificates
        certificateRepository.deleteByCourseId(id);
        
        // Cleanup Course Progress
        courseProgressRepository.deleteByCourseId(id);
        
        // Cleanup Analytics
        analyticsRepository.deleteByCourseId(id);
        
        // Cleanup Topic-level progress
        for (Topic topic : course.getTopics()) {
            // Delete Topic Quiz Progress
            topicQuizProgressRepository.deleteByTopicId(topic.getId());
            
            // Delete Topic Material Progress
            for (Material material : topic.getMaterials()) {
                topicMaterialProgressRepository.deleteByMaterialId(material.getId());
            }
            
            // Delete Topic Progress
            topicProgressRepository.deleteByTopicId(topic.getId());
        }

        // 2. Adjust Instructor stats
        Instructor instructor = course.getInstructor();
        if (instructor != null) {
            instructor.setCoursesCreated(Math.max(0, instructor.getCoursesCreated() - 1));
            instructorRepository.save(instructor);
        }

        // 3. Delete the Course (cascades to Topics, Quizzes, Enrollments)
        courseRepository.delete(course);
        
        System.out.println("Successfully deleted course and all associated student data for ID: " + id);
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

        // ⭐ NEW: Fetch Rating Stats ⭐
        Double avgRating = reviewRepository.getAverageRating(course.getId());
        Long totalReviews = reviewRepository.countByCourseId(course.getId());

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
                .category(course.getCategory())
                .visibility(course.getVisibility())
                .accessRule(course.getAccessRule())
                .price(course.getPrice())
                .createdAt(course.getCreatedAt())
                .progressPercent(progressPercent)
                .lastAccessed(lastAccessed)
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews != null ? totalReviews.intValue() : 0)
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

    /**
     * Upload course thumbnail image
     */
    @Transactional
    public String uploadCourseImage(Long courseId, org.springframework.web.multipart.MultipartFile file) {
        try {
            // Find the course
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            // Delete old image if exists (only if it's an S3 URL)
            if (course.getThumbnailUrl() != null && !course.getThumbnailUrl().isEmpty()
                    && course.getThumbnailUrl().contains("s3.amazonaws.com")) {
                try {
                    s3StorageService.deleteFile(course.getThumbnailUrl());
                } catch (Exception e) {
                    // Log but don't fail if old image deletion fails
                    System.err.println("Failed to delete old image: " + e.getMessage());
                }
            }

            String imageUrl;

            // Try S3 upload first, fallback to local storage if S3 fails
            try {
                imageUrl = s3StorageService.uploadFile(file, "course-thumbnails");
            } catch (Exception s3Exception) {
                System.err.println("S3 upload failed, using local storage: " + s3Exception.getMessage());

                // Fallback to local file storage
                String uploadDir = "uploads/course-thumbnails/";
                java.io.File directory = new java.io.File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                String fileName = courseId + "-" + System.currentTimeMillis() + "-" + file.getOriginalFilename();
                String filePath = uploadDir + fileName;

                java.io.File dest = new java.io.File(filePath);
                file.transferTo(dest);

                // Return relative URL for local files
                imageUrl = "/uploads/course-thumbnails/" + fileName;
            }

            // Update course with new image URL
            course.setThumbnailUrl(imageUrl);
            courseRepository.save(course);

            return imageUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload course image: " + e.getMessage(), e);
        }
    }

    public java.util.List<java.util.Map<String, Object>> getPotentialCourseAdmins() {
        java.util.List<User> admins = userRepository.findByRole(com.example.skillforge.model.enums.Role.ADMIN);
        java.util.List<User> instructors = userRepository
                .findByRole(com.example.skillforge.model.enums.Role.INSTRUCTOR);

        java.util.List<User> all = new java.util.ArrayList<>(admins);
        all.addAll(instructors);

        return all.stream()
                .distinct()
                .map(user -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("userId", user.getId());
                    map.put("name", user.getName());
                    map.put("email", user.getEmail());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
