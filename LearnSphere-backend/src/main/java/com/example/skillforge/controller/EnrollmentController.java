//package com.example.skillforge.controller;
//
//import com.example.skillforge.model.entity.Enrollment;
//import com.example.skillforge.service.EnrollmentService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/enrollments")
//@CrossOrigin(origins = "*")
//@RequiredArgsConstructor
//public class EnrollmentController {
//
//    private final EnrollmentService enrollmentService;
//
//    /**
//     * Enroll a student in a course
//     */
//    @PostMapping
//    public ResponseEntity<Enrollment> enrollCourse(
//            @RequestParam Long studentId,
//            @RequestParam Long courseId
//    ) {
//        try {
//            Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);
//            return ResponseEntity.ok(enrollment);
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }
//
//    /**
//     * Get all enrollments for a student
//     */
//    @GetMapping("/student/{studentId}")
//    public ResponseEntity<List<Enrollment>> getStudentEnrollments(
//            @PathVariable Long studentId
//    ) {
//        try {
//            List<Enrollment> enrollments = enrollmentService.getStudentEnrollments(studentId);
//            return ResponseEntity.ok(enrollments);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    /**
//     * Get specific enrollment
//     */
//    @GetMapping
//    public ResponseEntity<Enrollment> getEnrollment(
//            @RequestParam Long studentId,
//            @RequestParam Long courseId
//    ) {
//        try {
//            Enrollment enrollment = enrollmentService.getEnrollment(studentId, courseId);
//            return ResponseEntity.ok(enrollment);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    /**
//     * Update enrollment progress
//     */
//    @PutMapping("/progress")
//    public ResponseEntity<Enrollment> updateProgress(
//            @RequestParam Long studentId,
//            @RequestParam Long courseId,
//            @RequestParam Integer completionPercentage
//    ) {
//        try {
//            Enrollment enrollment = enrollmentService.updateProgress(studentId, courseId, completionPercentage);
//            return ResponseEntity.ok(enrollment);
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }
//
//    /**
//     * Unenroll a student from a course
//     */
//    @DeleteMapping
//    public ResponseEntity<String> unenrollCourse(
//            @RequestParam Long studentId,
//            @RequestParam Long courseId
//    ) {
//        try {
//            enrollmentService.unenrollStudent(studentId, courseId);
//            return ResponseEntity.ok("Unenrolled successfully");
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
//
//    /**
//     * Check if student is enrolled
//     */
//    @GetMapping("/check")
//    public ResponseEntity<Boolean> checkEnrollment(
//            @RequestParam Long studentId,
//            @RequestParam Long courseId
//    ) {
//        boolean isEnrolled = enrollmentService.isEnrolled(studentId, courseId);
//        return ResponseEntity.ok(isEnrolled);
//    }
//
//    /**
//     * Get all enrollments for a course
//     */
//    @GetMapping("/course/{courseId}")
//    public ResponseEntity<List<Enrollment>> getCourseEnrollments(
//            @PathVariable Long courseId
//    ) {
//        List<Enrollment> enrollments = enrollmentService.getCourseEnrollments(courseId);
//        return ResponseEntity.ok(enrollments);
//    }
//}


package com.example.skillforge.controller;

import com.example.skillforge.dto.response.EnrollmentResponse;
import com.example.skillforge.model.entity.Enrollment;
import com.example.skillforge.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<Enrollment> enrollCourse(
            @RequestParam Long studentId,
            @RequestParam Long courseId
    ) {
        try {
            Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);
            return ResponseEntity.ok(enrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentResponse>> getStudentEnrollments(
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }

    @GetMapping
    public ResponseEntity<EnrollmentResponse> getEnrollment(
            @RequestParam Long studentId,
            @RequestParam Long courseId
    ) {
        return ResponseEntity.ok(enrollmentService.getEnrollment(studentId, courseId));
    }

    @PutMapping("/progress")
    public ResponseEntity<EnrollmentResponse> updateProgress(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam Integer completionPercentage
    ) {
        return ResponseEntity.ok(
                enrollmentService.updateProgress(studentId, courseId, completionPercentage)
        );
    }

    @DeleteMapping
    public ResponseEntity<String> unenrollCourse(
            @RequestParam Long studentId,
            @RequestParam Long courseId
    ) {
        try {
            enrollmentService.unenrollStudent(studentId, courseId);
            return ResponseEntity.ok("Unenrolled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkEnrollment(
            @RequestParam Long studentId,
            @RequestParam Long courseId
    ) {
        return ResponseEntity.ok(enrollmentService.isEnrolled(studentId, courseId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentResponse>> getCourseEnrollments(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(enrollmentService.getCourseEnrollments(courseId));
    }
}
