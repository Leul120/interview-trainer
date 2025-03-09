package com.interviewTrainer.userService.requests;

import com.interviewTrainer.userService.entity.Role;
import com.interviewTrainer.userService.entity.UserType;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.time.LocalDate;
@Data
public class UserRequest {
    private String email;
    private String password;

    private String name;
    private String profilePictureUrl;
    private Role role;
    private UserType type;

    // 🔹 Authentication & Security
    private boolean isEmailVerified;
    private String verificationToken;

    private boolean isAccountLocked;
    private int failedLoginAttempts;

    // 🔹 Interview Progress Tracking
    private int completedInterviews;
    private int failedInterviews;
    private double overallPerformanceScore;

    // 🔹 Subscription & Payments
    private boolean isSubscribed;
    private String subscriptionType;  // FREE, PREMIUM, PRO
    private LocalDate subscriptionExpiryDate;
}
