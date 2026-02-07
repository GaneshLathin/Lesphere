package com.example.skillforge.model;

import com.example.skillforge.model.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_activities", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "date"})
})
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private int count;

    @Column(nullable = false)
    @Builder.Default
    private int minutesSpent = 0;
}
