package com.interviewTrainer.authService.requests;


import lombok.Data;

@Data
public class JwtAuthenticationRequest {
    private String token;
    private String refreshToken;
}
