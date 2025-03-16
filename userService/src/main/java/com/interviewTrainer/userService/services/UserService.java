package com.interviewTrainer.userService.services;


import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.requests.UserRequest;
import com.interviewTrainer.userService.responses.UserResponse;
import com.interviewTrainer.userService.responses.UserResponseDTO;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserDetailsService userDetailsService();
    List<User> getAllUser();
    UserResponseDTO getUserByEmail(String email);
    User signupUser(User user);
    public Boolean checkUserByEmail(String email);
    User updateUser(UUID id, UserRequest userRequest) throws IllegalAccessException;
    UserResponseDTO getUserById(UUID id);
    List<UserResponse> getInterviewers();
    List<UserResponseDTO> getUsersByIds(List<UUID> ids);
    void setOnlineStatus(UUID userId,Boolean status);
    UserResponse getUser(UUID id);
    void updateConfidenceScore(UUID userId,double confidenceScore,double overAllScore);
}
