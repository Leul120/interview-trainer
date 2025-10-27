package com.interviewTrainer.userService.services.impl;



import com.interviewTrainer.userService.config.Patcher;
import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.entity.UserType;
import com.interviewTrainer.userService.repositories.UserRepository;
import com.interviewTrainer.userService.requests.UserRequest;
import com.interviewTrainer.userService.responses.UserResponse;
import com.interviewTrainer.userService.responses.UserResponseDTO;
import com.interviewTrainer.userService.services.UserService;
import jakarta.ws.rs.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service

public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    @Autowired
    Patcher patcher;
    @Autowired
    public UserServiceImpl(UserRepository userRepository){
        this.userRepository=userRepository;
    }
    @Override
    public List<User> getAllUser(){
        return userRepository.findAll();
    }
    @Override
    @Cacheable(value = "userResponseByEmail" ,key="#email",unless = "#result == null")
    public UserResponseDTO getUserByEmail(String email){
        User user=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User not found!"));
        return mapToDTO(user);

    }
    @Override
//    @Cacheable(value = "userResponse" ,key="#id",unless = "#result == null")
    public UserResponseDTO getUserById(UUID id){
        User user=userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found!"));
        return mapToDTO(user);

    }
    @Override
//    @Cacheable(value = "userResponse" ,key="#id",unless = "#result == null")
    public UserResponse getUser(UUID id){
        User user=userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found!"));
        return mapToUserResponse(user);

    }

    @Override
    public void setOnlineStatus(UUID userId,Boolean status){
        User user=userRepository.findById(userId).orElseThrow(()->new NotFoundException("User not found!"));
        user.setOnline(status);
        userRepository.save(user);

    }
    @Override
//    @Cacheable(value = "interviewers" ,unless = "#result == null")
    @Transactional
    public List<UserResponse> getInterviewers(){
        List<User> users =userRepository.findByType(UserType.INTERVIEWER);
        return users.stream().map(this::mapToUserResponse).collect(Collectors.toList());
    }
    @Override
    public void updateConfidenceScore(UUID userId,double confidenceScore,double overAllScore){
        User user=userRepository.findById(userId).orElseThrow(()->new NotFoundException("User not found!"));
        user.setConfidenceScore(confidenceScore);
        user.setOverallPerformanceScore(overAllScore);
        userRepository.save(user);
    }
    @Override
//    @Cacheable(value = "userResponses" ,key="#ids",unless = "#result == null")
    public List<UserResponseDTO> getUsersByIds(List<UUID> ids) {
        List<User> users = userRepository.findByIdIn(ids);
        return users.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private UserResponseDTO mapToDTO(User user) {
//        System.out.println(user.getExpertise().size());
       UserResponseDTO userResponseDTO= new UserResponseDTO();
               userResponseDTO.setId(user.getId());
        userResponseDTO.setName(user.getName());
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setProfilePicture(user.getProfilePicture());
        userResponseDTO.setRole(user.getRole().toString());
        userResponseDTO.setType(user.getType().toString());
        userResponseDTO.setOnline(user.isOnline());
        userResponseDTO.setWasOnlineAt(user.getWasOnlineAt());
        userResponseDTO.setIndustry(user.getIndustry());
        userResponseDTO.setExperiences(user.getExperiences());
        user.setAwards(user.getAwards());
        userResponseDTO.setConfidenceScore(user.getConfidenceScore());
        userResponseDTO.setOverallPerformanceScore(user.getOverallPerformanceScore());
        userResponseDTO.setAvailabilityStatus(user.getAvailabilityStatus().toString());
        if(user.getExpertise()!=null) {
            userResponseDTO.setExpertise(user.getExpertise().toString());
        }
        return userResponseDTO;
    }
    private UserResponse mapToUserResponse(User user) {
        System.out.println(user.getAwards().size()+user.getExperiences().size());
        UserResponse userResponseDTO= new UserResponse();
        userResponseDTO.setId(user.getId());
        userResponseDTO.setName(user.getName());
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setProfilePicture(user.getProfilePicture());
        userResponseDTO.setRole(user.getRole());
        userResponseDTO.setType(user.getType());
        userResponseDTO.setOnline(user.isOnline());
        userResponseDTO.setWasOnlineAt(user.getWasOnlineAt());
        userResponseDTO.setIndustry(user.getIndustry());
        userResponseDTO.setConfidenceScore(user.getConfidenceScore());
        userResponseDTO.setOverallPerformanceScore(user.getOverallPerformanceScore());
        userResponseDTO.setAvailabilityStatus(user.getAvailabilityStatus());
        userResponseDTO.setExpertise(user.getExpertise());
        userResponseDTO.setAwards(user.getAwards());
        userResponseDTO.setExperiences(user.getExperiences());
        userResponseDTO.setCompletedInterviews(user.getCompletedInterviews());
        userResponseDTO.setAverageRating(user.getAverageRating());
        userResponseDTO.setEmailVerified(user.isEmailVerified());
        userResponseDTO.setBiography(user.getBiography());
        userResponseDTO.setCreatedAt(user.getCreatedAt());
        userResponseDTO.setReviewCount(user.getReviewCount());
        userResponseDTO.setSubscribed(user.isSubscribed());
        userResponseDTO.setSubscriptionExpiryDate(user.getSubscriptionExpiryDate());
        userResponseDTO.setSubscriptionType(user.getSubscriptionType());
        userResponseDTO.setUpdatedAt(user.getUpdatedAt());
        userResponseDTO.setFailedInterviews(user.getFailedInterviews());
        userResponseDTO.setFailedLoginAttempts(user.getFailedLoginAttempts());
        return userResponseDTO;
    }
    @Override
    public User signupUser(User user){
        return userRepository.save(user);
    }

    @Override
    public Boolean checkUserByEmail(String email){
        Optional<User> user=userRepository.findByEmail(email);
        return user.isPresent();
    }

    @Override
    public User updateUser(UUID id, UserRequest userRequest) throws IllegalAccessException {
        User user=userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found!"));
        patcher.userPatcher(user,userRequest);
        return user;
    }
    @Override
    public UserDetailsService userDetailsService() {
        return new UserDetailsService() {
            @Override
            @Cacheable(value = "userDetails" ,key="#username",unless = "#result == null")
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                return userRepository.findByEmail(username).orElseThrow(()->new UsernameNotFoundException("User not found!"));
            }
        };
    }



}
