package com.interviewTrainer.interviewSessionService.services;

import com.interviewTrainer.interviewSessionService.entities.InterviewSession;
import com.interviewTrainer.interviewSessionService.entities.ScheduledInterview;
import com.interviewTrainer.interviewSessionService.requests.PaginationRequest;
import com.interviewTrainer.interviewSessionService.requests.PagingResult;
import jakarta.mail.MessagingException;

import java.util.List;
import java.util.UUID;

public interface SessionService {
    void endSession(UUID userId,UUID sessionId);
    void cancelSession(UUID userId,UUID sessionId);
    InterviewSession joinSession(UUID sessionId,UUID userId,UUID scheduleId);
    InterviewSession startSession(UUID userId,UUID scheduledId) throws MessagingException;
//    void sendEmail(String email,InterviewSession session,String name,String expertise,UUID scheduleId) throws MessagingException;
    InterviewSession startAiSession(UUID userId,String title);
    public PagingResult<InterviewSession> getIntervieweeSessions(UUID userId, PaginationRequest request,String status);
    PagingResult<ScheduledInterview> getIntervieweeSchedules(UUID userId,PaginationRequest request);
    ScheduledInterview schedule(UUID userId, ScheduledInterview scheduledInterview);
}
