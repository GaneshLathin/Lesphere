//package com.example.skillforge.repository;
//
//import com.example.skillforge.model.entity.*;
//import com.example.skillforge.model.enums.Role;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//import java.util.List;
//import java.util.Optional;
//
//
//@Repository
//public interface ProgressRepository extends JpaRepository<Progress, Long> {
//    Optional<Progress> findByStudentIdAndCourseId(Long studentId, Long courseId);
//    List<Progress> findByStudentId(Long studentId);
//    List<Progress> findByCourseId(Long courseId);
//}

package com.example.skillforge.repository;

import com.example.skillforge.model.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Progress> findByStudentId(Long studentId);
}
