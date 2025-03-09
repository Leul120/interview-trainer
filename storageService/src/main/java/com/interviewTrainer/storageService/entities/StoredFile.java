package com.interviewTrainer.storageService.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class StoredFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId;
    private UUID userId;

    private String fileType; // "AUDIO", "VIDEO", "TRANSCRIPT"
    private String fileUrl;

    private LocalDateTime uploadedAt;
}

