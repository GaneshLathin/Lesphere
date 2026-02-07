package com.example.skillforge.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.skillforge.model.enums.DifficultyLevel;
import com.example.skillforge.model.enums.MaterialType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MANY-TO-ONE with Topic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnore
    private Topic topic;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType materialType;

    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;

    @Column(length = 1000)
    private String externalUrl;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;

    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer orderIndex = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}