package com.interviewTrainer.interviewSessionService.repositories;

import com.interviewTrainer.interviewSessionService.entities.ScheduledInterview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ScheduledInterviewRepository extends JpaRepository<ScheduledInterview, UUID> {
    @Query("SELECT c FROM ScheduledInterview c WHERE (c.intervieweeId = :intervieweeId) OR (c.interviewerId = :intervieweeId)")
    Page<ScheduledInterview> findByIntervieweeId(UUID intervieweeId, Pageable pageable);


}
