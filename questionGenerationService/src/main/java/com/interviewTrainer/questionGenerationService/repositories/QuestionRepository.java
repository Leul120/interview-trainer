package com.interviewTrainer.questionGenerationService.repositories;

import com.interviewTrainer.questionGenerationService.entities.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findBySessionId(UUID sessionId);
}
