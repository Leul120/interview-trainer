package com.interviewTrainer.userService.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.interviewTrainer.userService.entity.*;
import com.interviewTrainer.userService.utils.StringListConverter;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class UserRequest {
    private UUID id;
    private String email;
    private String password;
    private String name;
    private String profilePicture;
    private Role role;
    private UserType type;
    private List<Award> awards;
    private List<Experience> experiences;
    private boolean isEmailVerified;
    private String verificationToken;
    private boolean isAccountLocked;
    private int failedLoginAttempts;
    private int completedInterviews;
    private int failedInterviews;
    private double overallPerformanceScore;
    private double confidenceScore;
    private boolean isSubscribed;
    private String subscriptionType;  // FREE, PREMIUM, PRO
    private LocalDate subscriptionExpiryDate;
    private String biography;
    private String industry;
    private List<String> expertise;
    private AvailabilityStatus availabilityStatus;
    private Double averageRating;
    private Integer reviewCount;
    private boolean online;
    private LocalDateTime wasOnlineAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
