package com.interviewTrainer.processingService.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;
//@Component
public class CustomCorsConfiguration implements CorsConfigurationSource {

    @Override
    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
        CorsConfiguration config = new CorsConfiguration();

        // Set allowed origins
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));

        // Set allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));

        // Set allowed headers
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Upgrade", "Connection"));

        // Expose specific headers to the frontend
        config.setExposedHeaders(List.of("Authorization"));

        // Allow credentials for session-based or token-based authentication
        config.setAllowCredentials(true);

        return config;
    }
}
