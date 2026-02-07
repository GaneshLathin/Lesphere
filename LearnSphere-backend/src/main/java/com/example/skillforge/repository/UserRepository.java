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
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    Optional<User> findByResetToken(String resetToken);
    
    // Analytics
    Long countByRole(Role role);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM users GROUP BY month ORDER BY month", nativeQuery = true)
    List<Object[]> findUserGrowthByMonth();
}
