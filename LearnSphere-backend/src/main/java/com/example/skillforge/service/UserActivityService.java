package com.example.skillforge.service;

import com.example.skillforge.model.entity.User;
import com.example.skillforge.model.UserActivity;
import com.example.skillforge.repository.UserActivityRepository;
import com.example.skillforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;
    private final UserRepository userRepository;

    /**
     * Increment the activity count for a user for today.
     */
    @Transactional
    public void logActivity(Long userId) {
        logTime(userId, 0);
    }
    
    @Transactional
    public void logTime(Long userId, int minutes) {
        LocalDate today = LocalDate.now();
        UserActivity activity = userActivityRepository.findByUserIdAndDate(userId, today)
                .orElse(UserActivity.builder()
                        .user(userRepository.getReferenceById(userId))
                        .date(today)
                        .count(0)
                        .minutesSpent(0)
                        .build());
        
        activity.setCount(activity.getCount() + 1);
        activity.setMinutesSpent(activity.getMinutesSpent() + minutes);
        userActivityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getUserActivity(Long userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        List<UserActivity> activities = userActivityRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        
        Map<String, Integer> result = new HashMap<>();
        for (UserActivity activity : activities) {
            result.put(activity.getDate().toString(), activity.getCount());
        }
        return result;
    }
    @Transactional(readOnly = true)
    public int calculateStreak(Long userId) {
        // Fetch all activity dates for the user
        List<LocalDate> activityDates = userActivityRepository.findActivityDatesByUserId(userId);

        if (activityDates.isEmpty()) {
            return 0;
        }

        // Sort descending
        activityDates.sort((d1, d2) -> d2.compareTo(d1));

        int streak = 0;
        LocalDate checkDate = LocalDate.now();

        // Check if user has activity today
        if (activityDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        } else {
            // If no activity today, check yesterday (streak might still be active)
            checkDate = checkDate.minusDays(1);
            if (!activityDates.contains(checkDate)) {
                return 0; // No activity today or yesterday -> streak broken
            }
        }

        // Count backwards
        while (activityDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }
}
