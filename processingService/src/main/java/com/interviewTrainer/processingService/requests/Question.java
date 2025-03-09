package com.interviewTrainer.processingService.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;


@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Question {
    private UUID id;

    private String questionText;
    private UUID userId;

    private UUID sessionId;
    private String difficulty; // ENUM: EASY, MEDIUM, HARD

    private String category;
    private String expectedAnswer;
//    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
//    private LocalDateTime createdAt;

}



