package com.interviewTrainer.questionGenerationService.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.interviewTrainer.questionGenerationService.entities.DifficultyLevel;
import com.interviewTrainer.questionGenerationService.entities.Question;

import java.util.List;
import java.util.UUID;

public interface QuestionGeneratorService {
    Question generateQuestion(String category, DifficultyLevel difficulty, UUID sessionId,String focusArea,String description,UUID userId) throws JsonProcessingException;
    List<Question> getQuestionBySessionId(UUID sessionId);
}
