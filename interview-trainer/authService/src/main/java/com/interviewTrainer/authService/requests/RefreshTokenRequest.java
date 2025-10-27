package com.interviewTrainer.authService.requests;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String token;
}
