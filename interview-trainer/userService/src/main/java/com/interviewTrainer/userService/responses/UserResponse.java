package com.interviewTrainer.userService.responses;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.interviewTrainer.userService.entity.*;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
public class UserResponse {

    private UUID id;

    private String email;
    private String password;

    private String name;
    private String profilePicture;
    private Role role;
    private UserType type;
    private boolean isEmailVerified;
    private String verificationToken;

    private boolean isAccountLocked;
    private int failedLoginAttempts;

    // 🔹 Interview Progress Tracking
    private int completedInterviews;
    private int failedInterviews;
    private double overallPerformanceScore;
    private double confidenceScore;
    private List<Award> awards;
    private List<Experience> experiences;

    // 🔹 Subscription & Payments
    private boolean isSubscribed;
    private String subscriptionType;  // FREE, PREMIUM, PRO
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDate subscriptionExpiryDate;
    private String biography;
    private String industry;
//    @JsonSerialize(as = Set.class)
    private List<String> expertise;
    private AvailabilityStatus availabilityStatus;

    private Double averageRating;

    // Total number of reviews received
    private Integer reviewCount;
    private boolean online;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime wasOnlineAt;
    // 🔹 Audit Fields
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
