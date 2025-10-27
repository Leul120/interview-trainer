package com.interviewTrainer.interviewSessionService.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.interviewTrainer.interviewSessionService.entities.AiAnalysis;
import com.interviewTrainer.interviewSessionService.entities.InterviewSession;
import com.interviewTrainer.interviewSessionService.entities.InterviewStatus;
import com.interviewTrainer.interviewSessionService.entities.ScheduledInterview;
import com.interviewTrainer.interviewSessionService.feignClient.AnalysisClient;
import com.interviewTrainer.interviewSessionService.feignClient.UserClient;
import com.interviewTrainer.interviewSessionService.repositories.ScheduledInterviewRepository;
import com.interviewTrainer.interviewSessionService.repositories.SessionRepository;
import com.interviewTrainer.interviewSessionService.requests.PaginationRequest;
import com.interviewTrainer.interviewSessionService.requests.PagingResult;
import com.interviewTrainer.interviewSessionService.requests.TokenRequest;
import com.interviewTrainer.interviewSessionService.requests.UserResponseDTO;
import com.interviewTrainer.interviewSessionService.services.SessionService;
import com.interviewTrainer.interviewSessionService.utils.PaginationUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    @Value("${livekit.apiKey}")
    private String apiKey;

    @Value("${livekit.apiSecret}")
    private String apiSecret;

    private final JavaMailSender mailSender;

    // Token expiration in milliseconds (e.g., 1 hour)
    private final long tokenExpiryMillis = 3600000;
    @Autowired
    private SessionRepository sessionRepository;
    @Autowired
    private ScheduledInterviewRepository scheduledInterviewRepository;
    @Autowired
    private UserClient userClient;
    @Autowired
    private AnalysisClient analysisClient;
    @Override
    @Transactional
    public InterviewSession joinSession(UUID sessionId,UUID userId,UUID scheduleId) {
        ScheduledInterview scheduledInterview=scheduledInterviewRepository.findById(scheduleId).orElseThrow(()->new NotFoundException("A scheduled interview not found!"));
        if (!(scheduledInterview.getInterviewerId().equals(userId) || scheduledInterview.getIntervieweeId().equals(userId))) {
            throw new IllegalArgumentException("Unauthorized: You are not part of this interview.");
        }
        LocalDateTime currentTime = LocalDateTime.now().minusHours(9);
        // Validate the interview timing
        LocalDateTime interviewStartTime = scheduledInterview.getScheduledAt();
        if (currentTime.isBefore(interviewStartTime) || currentTime.isAfter(interviewStartTime.plusHours(2))) {
            throw new IllegalArgumentException("The scheduled time has either not arrived or has already passed!");
        }

        InterviewSession session=sessionRepository.findById(sessionId).orElseThrow(()->new NotFoundException("Session not found!"));

        if(session.getStatus().equals(InterviewStatus.CANCELED)||session.getStatus().equals(InterviewStatus.COMPLETED)){
            throw new RuntimeException("Session is either completed or cancelled!");
        }

        TokenRequest tokenRequest=TokenRequest.builder()
                .roomId(session.getRoom())
                .participant("candidate")
                .build();

        String token=getToken(tokenRequest);
        System.out.println(token);
        if (session.getIntervieweeId() == null) {
            session.setIntervieweeId(userId);
        } else {
            session.setInterviewerId(userId);
        }

        session.setStatus(InterviewStatus.ONGOING);
        session.setStartedAt(currentTime);
        session=sessionRepository.save(session);
        session.setToken(token);
        return session;
    }
    @Override
    public InterviewSession startAiSession(UUID userId,String title){
        InterviewSession session=new InterviewSession();
        session.setTitle(title);
        session.setIntervieweeId(userId);
        session.setStartedAt(LocalDateTime.now());
        session.setStatus(InterviewStatus.ONGOING);
//        session.setInterviewerId(UUID.fromString(String.valueOf(UUID.fromString("ai"))));
        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    public InterviewSession startSession(UUID userId, UUID scheduledId) throws MessagingException {
        ScheduledInterview scheduledInterview = scheduledInterviewRepository.findById(scheduledId)
                .orElseThrow(() -> new NotFoundException("A scheduled interview not found!"));

        if (!(scheduledInterview.getInterviewerId().equals(userId) || scheduledInterview.getIntervieweeId().equals(userId))
                || LocalDateTime.now().isBefore(scheduledInterview.getScheduledAt())
                || LocalDateTime.now().isAfter(scheduledInterview.getScheduledAt().plusHours(2))) {
            throw new IllegalArgumentException("The scheduled time has either not arrived or passed!");
        }

        // Virtual Thread Executor
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

        try {
            // Fetch user details in a virtual thread
            CompletableFuture<UserResponseDTO> userFuture = CompletableFuture.supplyAsync(() ->
                    userClient.getUserById(userId).getBody(), executor);

            // Generate Room ID and Token
            String roomId = String.valueOf(Math.floor(Math.random() * 100000));
            TokenRequest tokenRequest = TokenRequest.builder()
                    .roomId(roomId)
                    .participant("Host")
                    .build();
            String token = getToken(tokenRequest);

            // Get user details
            UserResponseDTO user = userFuture.get(); // Block only when needed
            assert user != null;

            // Create Interview Session
            InterviewSession session = new InterviewSession();
            boolean interviewer;
            if (user.getType().equals("INTERVIEWER")) {
                session.setInterviewerId(userId);
                interviewer = true;
            } else {
                session.setIntervieweeId(userId);
                interviewer = false;
            }
            session.setRoom(roomId);
            session.setToken(token);
            session.setStatus(InterviewStatus.ONGOING);
            session = sessionRepository.save(session);

            // Fetch the second user's details in another virtual thread
            UUID otherUserId = interviewer ? scheduledInterview.getIntervieweeId() : scheduledInterview.getInterviewerId();
            CompletableFuture<UserResponseDTO> otherUserFuture = CompletableFuture.supplyAsync(() ->
                    userClient.getUserById(otherUserId).getBody(), executor);

            // Send email asynchronously
            InterviewSession finalSession = session;
            otherUserFuture.thenAcceptAsync(user2 -> {
                try {
                    sendEmail(user2.getEmail(), finalSession, user.getName(), user.getExpertise(), scheduledInterview);
                } catch (MessagingException e) {
                    throw new RuntimeException(e);
                }
            }, executor);

            return session;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        } finally {
            executor.shutdown(); // Ensure executor is properly closed
        }
    }

    @Override
//    @Cacheable(value = "interviewSessions")
    public PagingResult<InterviewSession> getIntervieweeSessions(UUID userId, PaginationRequest request,String status) {
        Pageable pageable = PaginationUtils.getPageable(request);
        Page<InterviewSession> sessions;

        if (status == null || status.isEmpty() || status.equalsIgnoreCase("ALL")) {

            sessions = sessionRepository.findInterviewSessionByIntervieweeId(userId, pageable);
        } else {

            sessions = sessionRepository.findInterviewSessionByIntervieweeIdAndStatus(userId, InterviewStatus.valueOf(status), pageable);
        }
        return new PagingResult<>(
                sessions.getContent(),
                sessions.getNumber()+1,  // Page number
                sessions.getSize(),    // Page size
                sessions.getTotalElements(), // Total items
                sessions.getTotalPages() // Total pages
        );
    }


    @Override
//    @Cacheable(value = "interviewSchedules")
    public PagingResult<ScheduledInterview> getIntervieweeSchedules(UUID userId,PaginationRequest request){
        Pageable pageable=PaginationUtils.getPageable(request);
        Page<ScheduledInterview> schedules=scheduledInterviewRepository.findByIntervieweeId(userId,pageable);
        return new PagingResult<>(
                schedules.getContent(),
                schedules.getNumber()+1,  // Page number
                schedules.getSize(),    // Page size
                schedules.getTotalElements(), // Total items
                schedules.getTotalPages() // Total pages
        );
    }
    public String getToken(TokenRequest request) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expiry = new Date(nowMillis + 3600000); // 1 hour expiration

        // Build the nested "video" object
        Map<String, Object> videoClaims = new HashMap<>();
        videoClaims.put("canPublish", true);
        videoClaims.put("canPublishData", true);
        videoClaims.put("canSubscribe", true);
        videoClaims.put("room", request.getRoomId());
        videoClaims.put("roomJoin", true);

        // Build the JWT claims
        String token = Jwts.builder()
                .setIssuer(apiKey) // Set the issuer (API key)
                .setSubject(request.getParticipant()) // Set the subject (participant identity)
                .setIssuedAt(now) // Set the issued at time
                .setExpiration(expiry) // Set the expiration time
                .claim("nbf", nowMillis / 1000) // Not before (optional, Unix timestamp in seconds)
                .claim("video", videoClaims) // Nested "video" object
                .signWith(SignatureAlgorithm.HS256, apiSecret.getBytes()) // Sign the token
                .compact();
        return token;
    }
    @Override
    public void endSession(UUID userId,UUID sessionId)  {
        try {
            InterviewSession session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
            session.setEndedAt(LocalDateTime.now());
            session.setStatus(InterviewStatus.COMPLETED);

            sessionRepository.save(session);
//            setScores(userId,sessionId);
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException(e);
        }
//        catch (IOException e) {
//            throw new RuntimeException(e);
//        }
    }
    @Override
    public void cancelSession(UUID userId,UUID sessionId)  {
        try {
            InterviewSession session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
            setScores(userId,sessionId);
            session.setEndedAt(LocalDateTime.now());
            session.setStatus(InterviewStatus.CANCELED);

            sessionRepository.save(session);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }
    @Override
//    @CachePut(value = "interviewSchedules")
    public ScheduledInterview schedule(UUID userId,ScheduledInterview scheduledInterview){
        scheduledInterview.setIntervieweeId(userId);
        return scheduledInterviewRepository.save(scheduledInterview);
    }
//    @Override
//    public List<ScheduledInterview> getScheduledInterviews(String email){
//
//    }
    private void setScores(UUID userId, UUID sessionId) throws IOException {
        UserResponseDTO user = userClient.getUserById(userId).getBody();

        List<AiAnalysis> aiAnalyses = analysisClient.getAnalysis(sessionId).getBody();

        double sessionConfidenceAverage = aiAnalyses.stream()
                .mapToDouble(AiAnalysis::getConfidenceScore)
                .average()
                .orElse(0.0);

        double sessionOverallPerformanceAverage = aiAnalyses.stream()
                .mapToDouble(AiAnalysis::getOverallPerformanceScore)
                .average()
                .orElse(0.0);

        double previousUserConfidence = user.getConfidenceScore();
        double previousOverallPerformance = user.getOverallPerformanceScore();

        double newConfidenceScore = (previousUserConfidence + sessionConfidenceAverage) / 2.0;
        double newOverallPerformanceScore = (previousOverallPerformance + sessionOverallPerformanceAverage) / 2.0;


        userClient.updateScore(userId,newConfidenceScore,newOverallPerformanceScore);

        System.out.println("New Confidence Score: " + newConfidenceScore);
        System.out.println("New Overall Performance Score: " + newOverallPerformanceScore);
    }



    @Async
    private void sendEmail(String email,InterviewSession session,String name,String expertise,ScheduledInterview scheduledInterview) throws MessagingException {
        MimeMessage message=mailSender.createMimeMessage();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        MimeMessageHelper helper=new MimeMessageHelper(message,true);
        helper.setTo(email);
        helper.setSubject("Link to join the meeting");
        helper.setFrom("Interv@gmail.com");
        String htmlBody = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Invitation</title>
      <style>
        /* Reset styles */
        body, html {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background-color: #f4f4f4;
        }
    
        /* Container */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
    
        /* Header */
        .header {
          background-color: #0078d4;
          color: #ffffff;
          text-align: center;
          padding: 20px;
        }
    
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
    
        /* Body */
        .body {
          padding: 20px;
          color: #333333;
        }
    
        .body h2 {
          font-size: 20px;
          margin-bottom: 10px;
        }
    
        .body p {
          font-size: 16px;
          margin: 10px 0;
        }
    
        /* Button */
        .cta-button {
          display: inline-block;
          margin: 20px 0;
          padding: 12px 24px;
          background-color: #0078d4;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
        }
    
        .cta-button:hover {
          background-color: #005bb5;
        }
    
        /* Footer */
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f4f4f4;
          color: #666666;
          font-size: 14px;
        }
    
        .footer a {
          color: #0078d4;
          text-decoration: none;
        }
    
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>You're Invited to a Meeting</h1>
        </div>
    
        <!-- Body -->
        <div class="body">
          <h2>Meeting Details</h2>
          <p><strong>Date and Time:</strong> %s - %s</p>
          <p><strong>Location:</strong> Online (Join via the link below)</p>
    
          <p>Hello %s,</p>
          <p>You have been invited to join a meeting. Please click the button below to join:</p>
    
          <!-- Call-to-Action Button -->
          <a href="%s" class="cta-button">Join Meeting</a>
    
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p><a href="%s">%s</a></p>
    
          <p>Looking forward to seeing you there!</p>
          <p>Best regards,<br>%s<br>%s</p>
        </div>
    
        <!-- Footer -->
        <div class="footer">
          <p>If you have any questions, feel free to <a href="mailto:interv@gmail.com">contact us</a>.</p>
          <p>&copy; 2023 Interv. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    """.formatted(scheduledInterview.getScheduledAt().format(formatter),
                scheduledInterview.getScheduledAt().plus(scheduledInterview.getDuration()).format(timeFormatter),
                name, // Placeholder for recipient's name
                "https://intervw.vercel.app/interview/meeting/"+scheduledInterview.getId()+"?session=" + session.getId(), // Meeting link (used twice)
                "https://intervw.vercel.app/interview/meeting/"+scheduledInterview.getId()+"?session=" + session.getId(), // Meeting link (used twice)
                "https://intervw.vercel.app/interview/meeting/"+scheduledInterview.getId()+"?session=" + session.getId(), // Meeting link (used twice)
                name, // Your name
                expertise // Your position/expertise
        );
        helper.setText(htmlBody,true);
        mailSender.send(message);
    }

}
