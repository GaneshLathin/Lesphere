package com.example.skillforge.controller;

import com.example.skillforge.model.entity.Course;
import com.example.skillforge.model.entity.Enrollment;
import com.example.skillforge.model.enums.PaymentStatus;
import com.example.skillforge.repository.CourseRepository;
import com.example.skillforge.repository.EnrollmentRepository;
import com.example.skillforge.service.EnrollmentService;
import com.example.skillforge.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*") // Allow frontend access
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final EnrollmentService enrollmentService;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Value("${razorpay.key_id}")
    private String keyId;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestParam Long courseId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            if (course.getPrice() == null || course.getPrice() <= 0) {
                return ResponseEntity.badRequest().body("Course is free or price is not set");
            }

            Order order = paymentService.createOrder(course.getPrice());

            Map<String, Object> response = new HashMap<>();
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", keyId); // Send the injected key from properties
            // actually it's public key, safe to send. But let's verify if 'key' is needed
            // here,
            // usually frontend has key. We'll send it for convenience or let frontend env
            // handle it.

            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) {
        try {
            String razorpayOrderId = payload.get("razorpay_order_id");
            String razorpayPaymentId = payload.get("razorpay_payment_id");
            String razorpaySignature = payload.get("razorpay_signature");
            Long courseId = Long.parseLong(payload.get("courseId"));
            Long studentId = Long.parseLong(payload.get("studentId")); // This is userId from frontend, needs conversion

            boolean isValid = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

            if (isValid) {
                // Payment success, enroll student
                Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);

                // Update specific payment details
                enrollment.setTransactionId(razorpayPaymentId);
                enrollment.setPaymentStatus(PaymentStatus.COMPLETED);

                Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null) {
                    enrollment.setAmountPaid(course.getPrice());
                }

                enrollmentRepository.save(enrollment);

                return ResponseEntity.ok("Payment verified and enrollment successful");
            } else {
                return ResponseEntity.badRequest().body("Invalid payment signature");
            }

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error verifying payment: " + e.getMessage());
        }
    }
}
