package com.example.skillforge.controller;

import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.model.entity.Review;
import com.example.skillforge.service.ReviewService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Review>>> getCourseReviews(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched", reviewService.getReviewsForCourse(courseId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> addReview(@RequestBody ReviewRequest req) {
        if (req.getRating() < 1 || req.getRating() > 5) {
             return ResponseEntity.badRequest().body(ApiResponse.error("Rating must be between 1 and 5"));
        }
        
        Review review = new Review();
        review.setCourseId(req.getCourseId());
        review.setStudentId(req.getStudentId());
        review.setUserId(req.getUserId()); // Set userId
        review.setStudentName(req.getStudentName());
        review.setRating(req.getRating());
        review.setComment(req.getComment());

        try {
            Review saved = reviewService.addReview(review);
            return ResponseEntity.ok(ApiResponse.success("Review added", saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> updateReview(@PathVariable Long id, @RequestBody ReviewRequest req) {
        Review review = new Review();
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        
        try {
            Review updated = reviewService.updateReview(id, review);
            return ResponseEntity.ok(ApiResponse.success("Review updated", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }


    @Data
    public static class ReviewRequest {
        private Long courseId;
        private Long studentId;
        private Long userId; // Add userId
        private String studentName;
        private Integer rating;
        private String comment;
    }
}
