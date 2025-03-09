package com.interviewTrainer.processingService.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class InterviewRecording {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId; // Reference to InterviewSession

    private String audioUrl; // Stored in S3/Cloudinary
    private String videoUrl; // Stored in S3/Cloudinary

    private boolean isProcessed; // True if AI processing is done
    private LocalDateTime uploadedAt;
}

