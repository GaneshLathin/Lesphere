package com.example.skillforge.repository;

import com.example.skillforge.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    Optional<UserActivity> findByUserIdAndDate(Long userId, LocalDate date);
    List<UserActivity> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT ua.date FROM UserActivity ua WHERE ua.user.id = :userId")
    List<LocalDate> findActivityDatesByUserId(Long userId);
}
