package com.example.skillforge.controller;

import com.example.skillforge.dto.request.TopicRequest;
import com.example.skillforge.model.entity.Topic;
import com.example.skillforge.service.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class TopicController {

    @Autowired
    private TopicService topicService;

    // ✅ Create a new Topic
    @PostMapping
    public ResponseEntity<Topic> createTopic(@RequestBody TopicRequest topicRequest) {
        Topic createdTopic = topicService.createTopic(topicRequest);
        return ResponseEntity.ok(createdTopic);
    }

    // ✅ Get all Topics by Course ID
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Topic>> getTopicsByCourseId(@PathVariable Long courseId) {
        List<Topic> topics = topicService.getTopicsByCourse(courseId);
        return ResponseEntity.ok(topics);
    }

    // ✅ Get Topic by ID
    @GetMapping("/{topicId}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long topicId) {
        Topic topic = topicService.getTopicById(topicId);
        return ResponseEntity.ok(topic);
    }

    // ✅ Delete Topic by ID
    @DeleteMapping("/{topicId}")
    public ResponseEntity<String> deleteTopic(@PathVariable Long topicId) {
        topicService.deleteTopic(topicId);
        return ResponseEntity.ok("Topic deleted successfully!");
    }
}
