package com.interviewTrainer.processingService.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewTrainer.processingService.entities.AiAnalysis;
import com.interviewTrainer.processingService.feignClients.UserClient;
import com.interviewTrainer.processingService.repositories.ProcessingRepository;
import com.interviewTrainer.processingService.requests.EmotionDetectionRequest;
import com.interviewTrainer.processingService.requests.Question;
import com.interviewTrainer.processingService.requests.UserResponseDTO;
import com.interviewTrainer.processingService.services.EmotionDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class EmotionDetectionServiceImpl implements EmotionDetectionService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;
    @Value("${flask.api_url}")
    private String FLASK_API_URL;

    @Autowired
    private ProcessingRepository processingRepository;
    private final RestTemplate restTemplate;
    @Autowired
    private UserClient userClient;


//    private static final String GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";
    @Override
    @Async
    @Transactional
    public CompletableFuture<AiAnalysis> sendVideoChunkToFlask(MultipartFile file, Question question, String answer, UUID userId, UUID sessionId) throws IOException, InterruptedException {
        System.out.println(file+answer+userId+sessionId);
        UserResponseDTO user=userClient.getUserById(userId).getBody();
        assert user != null;
        byte[] videoChunk= file.getBytes();
        if (videoChunk == null) {
            throw new IllegalArgumentException("Video chunk is null or empty");
        }
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        HttpClient client = HttpClient.newHttpClient();

        // Step 1: Send the video chunk to the Flask API
        HttpRequest flaskRequest = HttpRequest.newBuilder()
                .uri(URI.create(FLASK_API_URL))
                .header("Content-Type", "application/octet-stream")
                .POST(HttpRequest.BodyPublishers.ofByteArray(videoChunk))
                .build();

        HttpResponse<String> flaskResponse = client.send(flaskRequest, HttpResponse.BodyHandlers.ofString());

        if (flaskResponse.statusCode() != 200) {
            throw new RuntimeException("Flask API returned an error: " + flaskResponse.statusCode());
        }

        // Step 2: Parse the Flask response
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(flaskResponse.body());

        if (rootNode == null || !rootNode.has("overall_dominant_emotion")) {
            throw new RuntimeException("Invalid Flask response: Missing expected fields");
        }

        String dominantEmotion = rootNode.path("overall_dominant_emotion").asText("unknown");
        int totalFramesAnalyzed = rootNode.path("total_frames_analyzed").asInt(0);
        int eyeContactScore = rootNode.path("eye_contact_score").asInt(0);
        int confidenceScore = rootNode.path("average_confidence_score").asInt(0);

        JsonNode emotionScoresNode = rootNode.path("average_emotion_scores");
        StringBuilder emotionSummary = new StringBuilder("Emotion scores:\n");
        Iterator<Map.Entry<String, JsonNode>> fields = emotionScoresNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            emotionSummary.append(field.getKey())
                    .append(": ")
                    .append(field.getValue().asDouble(0.0))
                    .append("%\n");
        }

        // Step 3: Prepare input for Gemini
        String prompt = String.format(
                "Aight AI, strap in, because I just finished an interview, and I need you to analyze it like a washed-up coach watching their team blow a 50-point lead in the finals. No sugarcoating. No sympathy. Just straight-up **brutal honesty mixed with life-altering wisdom.** Imagine you’re a retired drill sergeant watching me ruin my chances in 4K. Let’s go.\n\n" +

                        "Here’s the disaster report:\n\n" +

                        "1. **Biggest Emotion Showing on My Face:** %s (Bet it wasn’t ‘confidence’—probably ‘I just remembered I left the stove on at home.’😭)\n" +
                        "2. **Frames Analyzed:** %d (That’s %d frames of me committing career suicide in HD.)\n" +
                        "3. **Eye Contact Score:** %d (Did I even acknowledge the interviewer, or did I just stare at the void like a Game Over screen?)\n" +
                        "4. **Confidence Level:** %d (On a scale from ‘Alpha CEO’ to ‘Walmart intercom announcement panic,’ where did I land? Spoiler: Not the CEO.)\n" +
                        "5. **Emotional Breakdown:** %s (Did I look composed, or like I just got an email saying ‘We regret to inform you...’ mid-interview?)\n" +
                        "6. **Question I Got:** %s\n" +
                        "7. **My Answer:** %s (Did I sound like an intellectual, or did I just perform spoken-word gibberish?)\n\n" +

                        "Alright AI, I need you to **brutally** analyze my performance like you're a high school football coach who just watched their star player trip over their shoelaces and lose the championship. But stick to the exact format below. **Strictly follow this structure:**\n\n" +

                        "emotionAnalysis: [Did I look confident, or did I have the facial expression of a deer realizing it signed up for a job interview instead of crossing the road? Did my face scream ‘future CEO’ or ‘I’m being held hostage by my own anxiety’? Be creative and **roast me mercilessly.**]\n\n" +

                        "aiFeedback: [Did my answer deliver a TED Talk masterpiece, or was it a live demonstration of how to say **a whole lot of nothing**? If I flopped, tell me how hard, like ‘tripped and fell down an escalator’ levels of bad. Break down my **mistakes in a way that even a lost tourist could understand.** What should I have said instead?]\n\n" +

                        "nextSteps: [Give me the **hard, cold truth** about what to fix before my next interview so I don’t sound like an NPC repeating the same dialogue in a broken video game. I need **real** advice, not ‘believe in yourself’ motivational poster nonsense.]\n\n" +

                        "speechAnalysis: [Did I sound like a smooth talker ready to sell ice to an Eskimo, or was I giving ‘kid forced to read aloud in class’ energy? Break it down—was my voice smooth, shaky, or ‘bro, do you need water?’ levels of bad?]\n\n" +

                        "overallPerformanceScore:[Give me an overall score considering all this analysis. Provide **only** a number from 1 to 100 as my overall performance score. **No explanations. No extra words. Just the number.**\\n\\n\" ]\n\n"+

                        "**NO unnecessary formatting. No emojis. Just pure, structured brutality.** **I want the roast I deserve but also the wisdom I need.** Don’t hold back—let’s go.",
                dominantEmotion, totalFramesAnalyzed, totalFramesAnalyzed, eyeContactScore, confidenceScore,
                emotionSummary.toString(), question.getQuestionText(), answer
        );






        // Step 4: Send to Gemini API
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);

        Map<String, Object> contents = new HashMap<>();
        contents.put("parts", Collections.singletonList(parts));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(contents));

        String jsonRequest = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

        ResponseEntity<String> geminiResponse = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
        );
        System.out.println(geminiResponse.getBody());

        if (!geminiResponse.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Gemini API returned an error: " + geminiResponse.getStatusCode());
        }

        // Parse Gemini response
        Map<String, Object> responseMap = objectMapper.readValue(geminiResponse.getBody(), Map.class);
        if (responseMap == null || !responseMap.containsKey("candidates")) {
            throw new RuntimeException("Invalid API response: 'candidates' missing or null");
        }

        List<Map<String, Object>> candidatesList = (List<Map<String, Object>>) responseMap.get("candidates");
        if (candidatesList == null || candidatesList.isEmpty()) {
            throw new RuntimeException("Invalid response: 'candidates' is null or empty");
        }

        Map<String, Object> contentMap = (Map<String, Object>) candidatesList.get(0).get("content");
        if (contentMap == null || !contentMap.containsKey("parts")) {
            throw new RuntimeException("Invalid response: 'content' is null or missing 'parts'");
        }

        List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
        if (partsList == null || partsList.isEmpty()) {
            throw new RuntimeException("Invalid response: 'parts' is null or empty");
        }

        String generatedText = (String) partsList.get(0).get("text");
        if (generatedText == null) {
            throw new RuntimeException("Invalid response: 'text' is null");
        }

        // Extract analysis components
        String emotionAnalysis = extractValue(generatedText, "emotionAnalysis:", "aiFeedback:");
        String aiFeedback = extractValue(generatedText, "aiFeedback:", "nextSteps:");
        String nextSteps = extractValue(generatedText, "nextSteps:", "speechAnalysis:");
        String answerAnalysis=extractValue(generatedText,"speechAnalysis:","overallPerformanceScore");
        String overallScore=extractValue(generatedText,"overallPerformanceScore:","");
        System.out.println(overallScore);
        // Create and save analysis

        AiAnalysis analysis = AiAnalysis.builder()
                .userId(user.getId())
                .sessionId(sessionId)
                .analyzer("ai")
                .usersAnswer(answer)
                .questionId(question.getId())
                .emotionAnalysis(emotionAnalysis)
                .overallPerformanceScore(Double.parseDouble(overallScore.trim()))
                .speechAnalysis(answerAnalysis)
                .eyeContactScore(eyeContactScore)
                .confidenceScore(confidenceScore)
                .aiFeedback(aiFeedback)
                .nextSteps(nextSteps)
                .processedAt(LocalDateTime.now())
                .build();

        analysis=processingRepository.save(analysis);
        userClient.updateScore(user.getId(),analysis.getConfidenceScore(), analysis.getOverallPerformanceScore());
        System.out.println(analysis);
        return CompletableFuture.completedFuture(analysis);
    }
    @Override
    @Transactional
    public List<AiAnalysis> getAnalysisBySession(UUID sessionId){
        return processingRepository.findBySessionId(sessionId);
    }
    @Override
    public AiAnalysis giveAnalysis(AiAnalysis analysis){
        return processingRepository.save(analysis);
    }


    private String extractValue(String text, String startDelimiter, String endDelimiter) {
        int startIndex = text.indexOf(startDelimiter);
        if (startIndex == -1) {
            return "";
        }
        startIndex += startDelimiter.length();

        int endIndex;
        if (endDelimiter.isEmpty()) {
            endIndex = text.length();
        } else {
            endIndex = text.indexOf(endDelimiter, startIndex);
            if (endIndex == -1) {
                endIndex = text.length();
            }
        }

        return text.substring(startIndex, endIndex).trim();
    }

//    @Override
//    public List<AiAnalysis> getAnalysisBySession(UUID sessionId){
//
//    }


}
