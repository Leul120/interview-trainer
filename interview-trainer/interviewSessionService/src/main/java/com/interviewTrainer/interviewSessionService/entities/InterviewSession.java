package com.interviewTrainer.interviewSessionService.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.interviewTrainer.interviewSessionService.entities.InterviewStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class InterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String title;
    private UUID intervieweeId; // Reference to UserService
    private UUID interviewerId; // Reference to Interviewer (optional)

    @Enumerated(EnumType.STRING)
    private InterviewStatus status; // ENUM: SCHEDULED, ONGOING, COMPLETED, CANCELED
    private String room;
    @Column(length = 1024)
    private String token;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endedAt;
}



