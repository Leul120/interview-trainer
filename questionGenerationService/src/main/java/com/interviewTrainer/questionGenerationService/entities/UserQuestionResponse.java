package com.interviewTrainer.questionGenerationService.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class UserQuestionResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId; // Reference to InterviewSession
    private UUID userId;
    private UUID questionId;

    private String responseText;
    private boolean wasCorrect; // AI Evaluation
    private String analysis;
    private LocalDateTime answeredAt;
}

