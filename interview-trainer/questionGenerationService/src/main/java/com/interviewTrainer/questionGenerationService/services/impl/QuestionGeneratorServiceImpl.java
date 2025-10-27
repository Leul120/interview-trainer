package com.interviewTrainer.questionGenerationService.services.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewTrainer.questionGenerationService.entities.DifficultyLevel;
import com.interviewTrainer.questionGenerationService.entities.Question;
import com.interviewTrainer.questionGenerationService.repositories.QuestionRepository;
import com.interviewTrainer.questionGenerationService.services.QuestionGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;


import java.time.LocalDateTime;
import java.util.*;

@Service
public class QuestionGeneratorServiceImpl implements QuestionGeneratorService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final QuestionRepository questionRepository;


    @Value("${gemini.api.key}")
    private String geminiApiKey;


    public QuestionGeneratorServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper,QuestionRepository questionRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.questionRepository=questionRepository;
    }
    public Question generateQuestion(String category, DifficultyLevel difficulty, UUID sessionId,String focusArea,String description,UUID userId) throws JsonProcessingException {
        try {
//            List<Question> questions=getQuestionBySessionId(sessionId);
//            System.out.println(questions);

//            List<String> questionTexts=questions.stream().map(Question::getQuestionText).toList();
            String prompt = "Generate a high-quality " + difficulty.name().toLowerCase() +
                    " level unique interview question commonly asked by well-known companies in the '" + category +
                    "' domain. The question should focus on the following key areas: '" + focusArea +
                    "'.\n\nContext: " + description +
//                    "'and do not repeat any questions from this "+questionTexts.toString()+
                    "\n\nProvide the response in the following structured format:\n" +
                    "Question: <question_text>\n" +
                    "Answer: <concise_expected_answer>";


            String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            // Set up the HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Request body as per Gemini API specification
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);

            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", Collections.singletonList(parts));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(contents));

            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

            // Send POST request to Gemini API
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

            // Parse the response
            String responseBody = response.getBody();
            System.out.println("gemini response"+responseBody);
            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
            if (responseMap == null || !responseMap.containsKey("candidates")) {
                throw new RuntimeException("Invalid API response: 'candidates' missing or null");
            }

// Get the 'candidates' list
            List<Map<String, Object>> candidatesList = (List<Map<String, Object>>) responseMap.get("candidates");
            if (candidatesList == null || candidatesList.isEmpty()) {
                throw new RuntimeException("Invalid response: 'candidates' is null or empty");
            }

// Get the 'content' map from the first candidate
            Map<String, Object> contentMap = (Map<String, Object>) candidatesList.get(0).get("content");
            if (contentMap == null || !contentMap.containsKey("parts")) {
                throw new RuntimeException("Invalid response: 'content' is null or missing 'parts'");
            }

// Get the 'parts' list
            List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
            if (partsList == null || partsList.isEmpty()) {
                throw new RuntimeException("Invalid response: 'parts' is null or empty");
            }

// Extract the 'text' from the first part
            String generatedText = (String) partsList.get(0).get("text");
            if (generatedText == null) {
                throw new RuntimeException("Invalid response: 'text' is null");
            }

            // Extract question and answer from the generated text
            String questionText = extractValue(generatedText, "Question: ", "Answer:");
            String expectedAnswer = extractValue(generatedText, "Answer: ", "");

            // Create a new Question entity
            Question question = new Question();
            question.setSessionId(sessionId);
            question.setUserId(userId);
            question.setQuestionText(questionText);
            question.setDifficulty(difficulty);
            question.setCategory(category);
            question.setExpectedAnswer(expectedAnswer);
            question.setCreatedAt(LocalDateTime.now());

            return questionRepository.save(question);
        }  catch (RuntimeException e) {
            System.out.println(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    // Helper method to extract values from the generated text
    private String extractValue(String text, String startDelimiter, String endDelimiter) {
        int startIndex = text.indexOf(startDelimiter) + startDelimiter.length();
        int endIndex = (endDelimiter.isEmpty()) ? text.length() : text.indexOf(endDelimiter, startIndex);
        return text.substring(startIndex, endIndex).trim();
    }

    @Transactional
    @Override
    public List<Question> getQuestionBySessionId(UUID sessionId){
        return questionRepository.findBySessionId(sessionId);
    }

}

