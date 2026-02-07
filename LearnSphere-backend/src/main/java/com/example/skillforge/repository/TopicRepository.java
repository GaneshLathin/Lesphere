package com.example.skillforge.repository;

import com.example.skillforge.model.entity.*;
import com.example.skillforge.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByCourseId(Long courseId);
    List<Topic> findByCourseIdOrderByOrderIndexAsc(Long courseId);
    Long countByCourseId(Long courseId);
    List<Topic> findByCourse_Id(Long courseId);
   

}
