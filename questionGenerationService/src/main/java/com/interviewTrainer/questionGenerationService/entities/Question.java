package com.interviewTrainer.questionGenerationService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Lob // Enables long strings for the question text
    @Column(length = 20000,columnDefinition = "TEXT") // You can adjust this length as needed
    private String questionText;
    private UUID userId;

    private UUID sessionId;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty; // ENUM: EASY, MEDIUM, HARD

    @Column(length = 1000) // Allows long categories if needed
    private String category; // e.g., "Visa Questions", "Personal Background"

//    private boolean isAnsweredCorrectly;

    @Lob // Enables long expected answers
    @Column(length = 20000,columnDefinition = "TEXT")
    private String expectedAnswer;

    private LocalDateTime createdAt;

}



