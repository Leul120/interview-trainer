package com.interviewTrainer.processingService.repositories;

import com.interviewTrainer.processingService.entities.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface ProcessingRepository extends JpaRepository<AiAnalysis, UUID> {
    List<AiAnalysis> findBySessionId(UUID sessionId);
}
