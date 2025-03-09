package com.interviewTrainer.processingService.services;

import com.interviewTrainer.processingService.entities.AiAnalysis;
import com.interviewTrainer.processingService.requests.EmotionDetectionRequest;
import com.interviewTrainer.processingService.requests.Question;
import com.interviewTrainer.processingService.requests.UserResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public interface EmotionDetectionService {
    CompletableFuture<AiAnalysis> sendVideoChunkToFlask(MultipartFile file, Question question, String answer, UUID userId, UUID sessionId) throws IOException, InterruptedException;
    List<AiAnalysis> getAnalysisBySession(UUID sessionId);
    AiAnalysis giveAnalysis(AiAnalysis analysis);
}