package com.interviewTrainer.interviewSessionService.repositories;

import com.interviewTrainer.interviewSessionService.entities.InterviewSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<InterviewSession, UUID> {
    Page<InterviewSession> findInterviewSessionByIntervieweeId( UUID userId, Pageable pageable);
}
