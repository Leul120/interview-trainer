package com.interviewTrainer.questionGenerationService.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.interviewTrainer.questionGenerationService.entities.DifficultyLevel;
import com.interviewTrainer.questionGenerationService.entities.Question;
import com.interviewTrainer.questionGenerationService.services.QuestionGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Array;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/question")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionGeneratorService questionGeneratorService;

    @GetMapping
    public ResponseEntity<String> get(){
        return ResponseEntity.ok("hello world!");
    }

    @GetMapping("/generate-question/{category}/{difficulty}/{sessionId}")
    public ResponseEntity<Question> generateQuestion(@RequestAttribute("userId") UUID userId,@PathVariable String category, @PathVariable DifficultyLevel difficulty, @PathVariable UUID sessionId, @RequestParam("focusArea") String focusArea,@RequestParam("description") String description) throws JsonProcessingException {
        return ResponseEntity.ok(questionGeneratorService.generateQuestion(category,difficulty,sessionId,focusArea,description,userId));
    }
    @GetMapping("/get-questions-by-session/{sessionId}")
    public ResponseEntity<List<Question>> getQuestionBySessionId(@PathVariable UUID sessionId)  {
        return ResponseEntity.ok(questionGeneratorService.getQuestionBySessionId(sessionId));
    }
}
