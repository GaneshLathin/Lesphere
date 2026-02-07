package com.example.skillforge.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "topic_material_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "material_id"})
})
@Data
@NoArgsConstructor
public class TopicMaterialProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long materialId;
    private Boolean completed = false;
    private LocalDateTime completedAt;
}
