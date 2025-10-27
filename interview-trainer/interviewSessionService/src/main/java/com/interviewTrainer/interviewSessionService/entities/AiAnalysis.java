package com.interviewTrainer.interviewSessionService.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiAnalysis {

    private UUID id;

    private UUID sessionId;
    private UUID userId;


    private String emotionAnalysis;


    private String speechAnalysis;

    private double eyeContactScore;
    private double confidenceScore;
    private double overallPerformanceScore;


    private String aiFeedback;

    private String nextSteps;

    private LocalDateTime processedAt;
}
