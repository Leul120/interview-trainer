package com.interviewTrainer.notificationService.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID userId;
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type; // EMAIL, SMS, PUSH

    private boolean isRead;
    private LocalDateTime sentAt;
}



