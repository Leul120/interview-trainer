package com.interviewTrainer.interviewSessionService.feignClient;

import com.interviewTrainer.interviewSessionService.config.FeignClientConfig;
import com.interviewTrainer.interviewSessionService.entities.AiAnalysis;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@FeignClient(name = "processingService",url = "https://processing-service-infi.onrender.com",path = "/api/v1/processing",configuration = FeignClientConfig.class)
public interface AnalysisClient {
    @GetMapping("/get-analysis-by-session/{sessionId}")
    public ResponseEntity<List<AiAnalysis>> getAnalysis(@PathVariable UUID sessionId) throws IOException;
}
