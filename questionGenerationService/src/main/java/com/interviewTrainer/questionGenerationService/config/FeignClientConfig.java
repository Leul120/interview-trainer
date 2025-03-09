package com.interviewTrainer.questionGenerationService.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor authRequestInterceptor() {
        return requestTemplate -> {
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication instanceof JwtAuthenticationToken) {
                    JwtAuthenticationToken jwtAuthToken = (JwtAuthenticationToken) authentication;
                    String token = jwtAuthToken.getToken().getTokenValue();
                    if (token != null && !token.isEmpty()) {
                        requestTemplate.header("Authorization", "Bearer " + token);
                    }
                }
            } catch (Exception e) {
                // Log the error but do not throw to prevent breaking bean creation.
                System.err.println("Error retrieving token: " + e.getMessage());
            }
        };
    }
}

