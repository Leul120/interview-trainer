package com.interviewTrainer.processingService.config;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

public class VideoStreamHandler extends BinaryWebSocketHandler {
    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        // Forward the frame to Python service
        RestTemplate restTemplate = new RestTemplate();
        String pythonServiceUrl = "http://localhost:5000/process-frame";

        byte[] frameData = message.getPayload().array();
        String result = restTemplate.postForObject(pythonServiceUrl, frameData, String.class);

        // Send the analysis result back to the React client
        session.sendMessage(new org.springframework.web.socket.TextMessage(result));
    }
}
