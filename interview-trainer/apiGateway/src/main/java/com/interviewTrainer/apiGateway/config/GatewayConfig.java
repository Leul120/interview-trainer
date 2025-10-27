package com.interviewTrainer.apiGateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import org.springframework.cloud.netflix.hystrix.EnableHystrix;
import lombok.RequiredArgsConstructor;

@Configuration
//@EnableHystrix
@RequiredArgsConstructor
public class GatewayConfig {

    private final JwtAuthenticationFilter filter;

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                // 🔹 Auth Service (No Authentication)
                .route("auth-service", r -> r.path("/api/v1/auth/**")
                        .uri("lb://AUTHSERVICE"))

                // 🔹 User Service (JWT Authentication)
                .route("user-service", r -> r.path("/api/v1/user/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://userService"))

                // 🔹 Interview Session Service (JWT Authentication)
                .route("interviewSession-service", r -> r.path("/api/v1/session/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://interviewSessionService"))

                // 🔹 Notification Service (JWT Authentication)
                .route("notification-service", r -> r.path("/api/v1/notification/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://notificationService"))

                // 🔹 Processing Service (JWT Authentication)
                .route("processing-service", r -> r.path("/api/v1/processing/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://processingService"))

                // 🔹 Question Service (JWT Authentication)
                .route("question-service", r -> r.path("/api/v1/question/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://questionGenerationService"))

                // 🔹 Storage Service (JWT Authentication)
                .route("storage-service", r -> r.path("/api/v1/storage/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://storageService"))

                // 🔹 Feedback and Scoring Service (JWT Authentication)
                .route("feedbackAndScoring-service", r -> r.path("/api/v1/feedback/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://feedbackAndScoringService"))
                .route("realPersonInterview-service", r -> r.path("/api/v1/interview/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://realPersonInterviewService"))

                .build();
    }
}

