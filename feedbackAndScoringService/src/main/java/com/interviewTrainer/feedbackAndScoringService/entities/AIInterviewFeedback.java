package com.interviewTrainer.feedbackAndScoringService.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class AIInterviewFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId;
    private UUID userId;

    @Column(length = 1000)
    private String detailedFeedback;

    private LocalDateTime generatedAt;
}

