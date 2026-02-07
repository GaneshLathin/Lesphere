package com.example.skillforge.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "student_id", "course_id" }),
        @UniqueConstraint(columnNames = "uid")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid; // UUID for verification

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    private String pdfUrl; // Optional: if stored in S3/Cloudinary

    // To ensure idempotency and prevent duplicate generation logic
    @Column(nullable = false)
    private String studentNameSnapshot;

    @Column(nullable = false)
    private String courseNameSnapshot;

    @PrePersist
    protected void onCreate() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
    }
}
