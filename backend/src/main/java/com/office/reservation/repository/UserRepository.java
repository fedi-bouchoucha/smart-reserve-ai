package com.office.reservation.repository;

import com.office.reservation.entity.User;
import com.office.reservation.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByUsername(String username);
    List<User> findByRole(Role role);
    List<User> findByManagerId(Long managerId);
    long countByRole(Role role);
    List<User> findByRoleAndManagerIsNull(Role role);
}
