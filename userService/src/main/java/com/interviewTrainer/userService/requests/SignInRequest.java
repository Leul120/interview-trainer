package com.interviewTrainer.userService.requests;

import lombok.Data;

@Data
public class SignInRequest {
    private String email;
    private String password;
}
