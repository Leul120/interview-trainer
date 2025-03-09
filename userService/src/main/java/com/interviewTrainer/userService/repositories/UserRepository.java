package com.interviewTrainer.userService.repositories;

import com.interviewTrainer.userService.entity.Role;
import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.entity.UserType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    User findByRole(Role role);
    List<User> findByType(UserType type);
    List<User> findByIdIn(List<UUID> ids);
}
