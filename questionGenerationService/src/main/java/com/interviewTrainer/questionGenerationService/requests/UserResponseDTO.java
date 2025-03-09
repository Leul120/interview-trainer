package com.interviewTrainer.questionGenerationService.requests;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponseDTO {
    private UUID id;
    private String name;
    private String email;
    private String profilePicture;
    private String role;
    private String type;
    private String industry;
    private double overallPerformanceScore;
    private double confidenceScore;
    private String availabilityStatus;
    private String expertise;
    private boolean online;
    private LocalDateTime wasOnlineAt;

}
