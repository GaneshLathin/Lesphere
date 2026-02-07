package com.example.skillforge.service;

import com.example.skillforge.dto.request.TopicRequest;
import com.example.skillforge.exception.ResourceNotFoundException;
import com.example.skillforge.model.entity.Course;
import com.example.skillforge.model.entity.Topic;
import com.example.skillforge.repository.CourseRepository;
import com.example.skillforge.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;
    private final com.example.skillforge.repository.TopicProgressRepository topicProgressRepository;
    private final com.example.skillforge.repository.QuizRepository quizRepository;

    @Transactional
    public Topic createTopic(TopicRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        topic.setCourse(course); // Set mapped relationship
        topic.setLevel(request.getLevel());
        topic.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0);

        topic = topicRepository.save(topic);

        // Update course stats
        course.setTotalTopics(course.getTopics().size());
        courseRepository.save(course);

        return topic;
    }

    public List<Topic> getTopicsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return course.getTopics();
    }

    public Topic getTopicById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
    }

    @Transactional
    public Topic updateTopic(Long id, TopicRequest request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        topic.setLevel(request.getLevel());
        topic.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : topic.getOrderIndex());

        return topicRepository.save(topic);
    }

    @Transactional
    public void deleteTopic(Long topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new ResourceNotFoundException("Topic not found with ID: " + topicId);
        }
        
        // 1. Delete associated progress records
        topicProgressRepository.deleteByTopicId(topicId);
        
        // 2. Delete associated quizzes
        quizRepository.deleteByTopicId(topicId);
        
        // 3. Delete the topic (Materials should cascade via @OneToMany if properly set, else explicit delete might be needed)
        // Topic.java has @OneToMany(cascade = CascadeType.ALL) for materials, so this is safe.
        topicRepository.deleteById(topicId);
    }

}