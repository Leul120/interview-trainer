package com.interviewTrainer.processingService.entities;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_analysis")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiAnalysis  {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId;
    private UUID userId;
    private String analyzer;
    @Lob // Allows long strings for emotion analysis
    @Column(length = 10000)
    private String usersAnswer;
    private UUID questionId;
    @Lob // Allows long strings for emotion analysis
    @Column(length = 10000)
    private String emotionAnalysis;

    @Lob // Allows long strings for speech analysis
    @Column(length = 10000)
    private String speechAnalysis;

    private double eyeContactScore;
    private double confidenceScore;
    private double overallPerformanceScore;

    @Lob // Allows for detailed AI feedback
    @Column(length = 10000)
    private String aiFeedback;

    @Lob // Enables long next step recommendations
    @Column(length = 10000)
    private String nextSteps;

    private LocalDateTime processedAt;
}
