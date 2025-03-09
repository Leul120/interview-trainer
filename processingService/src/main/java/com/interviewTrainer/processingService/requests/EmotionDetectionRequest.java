package com.interviewTrainer.processingService.requests;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
public class EmotionDetectionRequest {
    private MultipartFile file;
    private Question question;
    private String answer;
    private UUID sessionId;
}
