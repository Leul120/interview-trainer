package com.interviewTrainer.apiGateway.config;

import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
@RefreshScope
public class JwtAuthenticationFilter implements GatewayFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final RouteValidator routeValidator;
    private final JwtUtil jwtUtil;

    @Autowired
    public JwtAuthenticationFilter(RouteValidator routeValidator, JwtUtil jwtUtil) {
        this.routeValidator = routeValidator;
        this.jwtUtil = jwtUtil;

    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        try {
            ServerHttpRequest request = exchange.getRequest();
            log.info("Incoming request: {} {}", request.getMethod(), request.getURI());
            // ✅ Bypass JWT authentication for specific routes
            List<String> openEndpoints = Arrays.asList(
                    "/api/v1/user/public/**",  // Allow public user endpoints
                    "/api/v1/user/public",
                    "/api/v1/auth/login",     // Allow login
                    "/api/v1/auth/register",
                    "/api/v1/question",
                    "/api/v1/processing",
                    "/api/v1/service",
                    "/api/v1/session",
                    "/api/v1/user",
                    "/api/v1/auth"
            );

            String path = request.getPath().toString();
            boolean isPublicEndpoint = openEndpoints.stream().anyMatch(path::startsWith);

            if (isPublicEndpoint) {
                log.info("Bypassing authentication for: {}", path);
                return chain.filter(exchange); // ✅ Skip JWT validation
            }

            if (routeValidator.isSecured.test(request)) {
                log.info("Request requires authentication.");

                if (this.isAuthMissing(request)) {
                    log.warn("Authorization header is missing!");
                    return this.onError(exchange, HttpStatus.UNAUTHORIZED, "Missing Authorization Header");
                }

                final String token = this.getAuthHeader(request);
                log.info("Extracted token: {}", token);

                if (jwtUtil.isInvalid(token)) {
                    log.warn("Invalid or expired JWT token.");
                    return this.onError(exchange, HttpStatus.FORBIDDEN, "Invalid Token");
                }
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("Service","apiGateway")
                        .header("Authorization", "Bearer " + token) // Forward the original token
                        .build();


                // Create a new exchange with modified request
                ServerWebExchange modifiedExchange = exchange.mutate()
                        .request(modifiedRequest)
                        .build();

                log.info("Security context propagated to downstream services");
                log.info(String.valueOf(modifiedExchange));
                return chain.filter(modifiedExchange);
            } else {
                log.info("Request does not require authentication.");
                return chain.filter(exchange);
            }
        } catch (Exception e) {
            log.info(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus, String message) {
        log.error("Authentication failed: {} - Returning HTTP {}", message, httpStatus);
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    private String getAuthHeader(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getOrEmpty("Authorization").get(0);
        return authHeader.replace("Bearer ", "");
    }

    private boolean isAuthMissing(ServerHttpRequest request) {
        return !request.getHeaders().containsKey("Authorization");
    }
}