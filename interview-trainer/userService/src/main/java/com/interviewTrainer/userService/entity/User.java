package com.interviewTrainer.userService.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.interviewTrainer.userService.utils.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "_user")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // 🔹 Basic User Info
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;
    private String profilePicture;

    // 🔹 User Roles (ADMIN, INTERVIEWEE)
    @Enumerated(EnumType.STRING)
    private Role role;
    private UserType type;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.EAGER)
    private List<Award> awards;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.EAGER)
    private List<Experience> experiences;

    // 🔹 Authentication & Security
    private boolean isEmailVerified;
    private String verificationToken;

    private boolean isAccountLocked;
    private int failedLoginAttempts;

    // 🔹 Interview Progress Tracking
    private int completedInterviews;
    private int failedInterviews;
    private double overallPerformanceScore;
    private double confidenceScore;


    // 🔹 Subscription & Payments
    private boolean isSubscribed;
    private String subscriptionType;  // FREE, PREMIUM, PRO
    private LocalDate subscriptionExpiryDate;

    @Column(length = 2000)
    private String biography;

    // The industry or field the interviewer specializes in (e.g., "Tech", "Finance")
    private String industry;

    // A set of areas of expertise (e.g., "Java", "System Design", "Behavioral")
    @Convert(converter = StringListConverter.class)
    private List<String> expertise;

    // Availability status to help users select interviewers (AVAILABLE, UNAVAILABLE, BUSY)
    @Enumerated(EnumType.STRING)
    private AvailabilityStatus availabilityStatus;

    // Average rating received from user reviews
    private Double averageRating;

    // Total number of reviews received
    private Integer reviewCount;
    private boolean online;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime wasOnlineAt;
    // 🔹 Audit Fields
    @CreationTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;



    @UpdateTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
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
        return !isAccountLocked;
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

