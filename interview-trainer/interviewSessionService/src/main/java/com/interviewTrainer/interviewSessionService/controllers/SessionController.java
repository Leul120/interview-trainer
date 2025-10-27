package com.interviewTrainer.interviewSessionService.controllers;

import com.interviewTrainer.interviewSessionService.entities.InterviewSession;
import com.interviewTrainer.interviewSessionService.entities.ScheduledInterview;
import com.interviewTrainer.interviewSessionService.requests.PaginationRequest;
import com.interviewTrainer.interviewSessionService.requests.PagingResult;
import com.interviewTrainer.interviewSessionService.services.SessionService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/session")
public class SessionController {
    @Autowired
    private SessionService sessionService;

    @GetMapping
    public ResponseEntity<String> gets(){
        return ResponseEntity.ok("hello world!");
    }
    @GetMapping("/u")
    public ResponseEntity<String> get(@RequestAttribute("username") String username){
        return ResponseEntity.ok("hello"+username);
    }
    @GetMapping("/start-session/{scheduleId}")
    public ResponseEntity<InterviewSession> startSession(@RequestAttribute("userId") UUID userId,@PathVariable UUID scheduleId) throws MessagingException {
        System.out.println(LocalDateTime.now());
        InterviewSession session = sessionService.startSession(userId,scheduleId);
        return ResponseEntity.ok(session);
    }
    @GetMapping("/start-ai-session/{title}")
    public ResponseEntity<InterviewSession> startAiSession(@RequestAttribute("userId") UUID userId,@PathVariable String title){
        InterviewSession session = sessionService.startAiSession(userId,title);
        return ResponseEntity.ok(session);
    }
    @GetMapping("/join-session/{scheduleId}/{sessionId}")
    public ResponseEntity<InterviewSession> joinSession(@PathVariable UUID sessionId,@PathVariable UUID scheduleId,@RequestAttribute("userId") UUID userId) {
        InterviewSession session = sessionService.joinSession(sessionId,userId,scheduleId);
        return ResponseEntity.ok(session);
    }
    @GetMapping("/end-session/{sessionId}")
    public void endSession(@RequestAttribute("userId") UUID userId,@PathVariable UUID sessionId) {
        sessionService.endSession(userId,sessionId);

    }
    @GetMapping("/cancel-session/{sessionId}")
    public void cancelSession(@RequestAttribute("userId") UUID userId ,@PathVariable UUID sessionId) {
        sessionService.cancelSession(userId,sessionId);

    }
    @GetMapping("/generate-link")
    public String generateInterviewLink() {
        String interviewLink = "https://intervw.vercel.app/interview/real-person-interview?token=" + UUID.randomUUID().toString();
        // Optionally, save this link to a database
        return interviewLink;
    }
    @GetMapping("/get-my-sessions")
    public ResponseEntity<PagingResult<InterviewSession>> getIntervieweeSessions(@RequestAttribute("userId") UUID userId,
                                                                                                  @RequestParam(required = false) Integer page,
                                                                                                  @RequestParam(required = false) Integer size,
                                                                                                  @RequestParam(required = false) String sortField,
                                                                                                  @RequestParam(required = false) Sort.Direction direction,
                                                                                                  @RequestParam(required =false)  String status

    ){
        final PaginationRequest request = new PaginationRequest(page-1, size, sortField, direction);

        return ResponseEntity.ok(sessionService.getIntervieweeSessions(userId,request,status));
    }
    @PostMapping("/schedule-interview")
    public ResponseEntity<ScheduledInterview> schedule(@RequestAttribute("userId") UUID userId,@RequestBody ScheduledInterview scheduledInterview){
        return ResponseEntity.ok(sessionService.schedule(userId,scheduledInterview));
    }
    @GetMapping("/get-my-scheduled-interviews")
    public ResponseEntity<PagingResult<ScheduledInterview>> getScheduledInterviews(@RequestAttribute("userId") UUID userId,
                                                                           @RequestParam(required = false) Integer page,
                                                                           @RequestParam(required = false) Integer size,
                                                                           @RequestParam(required = false) String sortField,
                                                                           @RequestParam(required = false) Sort.Direction direction


    ){
        final PaginationRequest request = new PaginationRequest(page-1, size, sortField, direction);
        return ResponseEntity.ok(sessionService.getIntervieweeSchedules(userId,request));
    }


}
