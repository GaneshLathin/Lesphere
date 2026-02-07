package com.example.skillforge.service;

public interface CourseProgressService {
    void updateProgress(Long studentId, Long courseId, Long lastCompletedTopicId);
    void addTimeSpent(Long studentId, Long courseId, int minutes);
}
