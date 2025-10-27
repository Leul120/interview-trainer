package com.interviewTrainer.processingService.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewTrainer.processingService.entities.AiAnalysis;
import com.interviewTrainer.processingService.repositories.ProcessingRepository;
import com.interviewTrainer.processingService.requests.EmotionDetectionRequest;
import com.interviewTrainer.processingService.requests.Question;
import com.interviewTrainer.processingService.requests.UserResponseDTO;
import com.interviewTrainer.processingService.services.EmotionDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/processing")
@RequiredArgsConstructor
public class ProcessingController {
    @Autowired
    private EmotionDetectionService emotionDetectionService;
    @Autowired
    private ProcessingRepository processingRepository;

    @GetMapping
    public ResponseEntity<String> get(){
        return ResponseEntity.ok("hello world!");
    }

    @PostMapping(value = "/analyze-video")
    public ResponseEntity<CompletableFuture<AiAnalysis>> analyzeVideo(
            @RequestParam("videoChunk") MultipartFile videoChunk,
            @RequestParam("question") String questionJson,  // Receive as JSON string
            @RequestParam("answer") String answer,
            @RequestParam("sessionId") UUID sessionId,
            @RequestAttribute("userId") UUID userId
    ) throws IOException, InterruptedException {

        // Deserialize JSON string to Question object
        ObjectMapper objectMapper = new ObjectMapper();
        Question question = objectMapper.readValue(questionJson, Question.class);

        return ResponseEntity.ok(
                emotionDetectionService.sendVideoChunkToFlask(videoChunk, question, answer, userId, sessionId)
        );
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Optional<AiAnalysis>> getVideo(@PathVariable UUID id) throws IOException {
        return ResponseEntity.ok(processingRepository.findById(id));
    }
    @GetMapping("/get-analysis-by-session/{sessionId}")
    public ResponseEntity<List<AiAnalysis>> getAnalysis(@PathVariable UUID sessionId) throws IOException {
        return ResponseEntity.ok(emotionDetectionService.getAnalysisBySession(sessionId));
    }
    @PostMapping("/give-analysis")
    public ResponseEntity<AiAnalysis> giveAnalysis(@RequestBody AiAnalysis analysis) throws IOException {
        return ResponseEntity.ok(emotionDetectionService.giveAnalysis(analysis));
    }
}
