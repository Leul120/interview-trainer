package com.interviewTrainer.feedbackAndScoringService.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class InterviewScore {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId;
    private UUID userId;

    private double overallScore;
    private double speechScore;
    private double facialScore;
    private double accuracyScore;

    private LocalDateTime createdAt;
}
