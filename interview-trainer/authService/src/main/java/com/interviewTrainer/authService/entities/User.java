package com.interviewTrainer.authService.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User implements UserDetails  {
    private Long id;

    // 🔹 Basic User Info
    private String email;

    private String password;

    private String firstName;
    private String lastName;
    private String profilePictureUrl;

    // 🔹 User Roles (ADMIN, INTERVIEWEE)
    private Role role;

    // 🔹 Authentication & Security
    private boolean isEmailVerified;
    private String verificationToken;

    private boolean isAccountLocked;
    private int failedLoginAttempts;

    // 🔹 Interview Progress Tracking
    private int completedInterviews;
    private int failedInterviews;
    private double overallPerformanceScore;

    // 🔹 AI Analysis Storage
    private String lastFacialAnalysis;  // Stores JSON from DeepFace
    private String lastSpeechAnalysis;  // Stores JSON from Whisper AI

    // 🔹 Subscription & Payments
    private boolean isSubscribed;
    private String subscriptionType;  // FREE, PREMIUM, PRO
    private LocalDate subscriptionExpiryDate;

    // 🔹 Audit Fields

    private LocalDateTime createdAt;


    private LocalDateTime updatedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isAccountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Getters & Setters
}

