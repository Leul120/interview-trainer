package com.interviewTrainer.userService.services;


import com.interviewTrainer.userService.requests.JwtAuthenticationRequest;
import com.interviewTrainer.userService.requests.RefreshTokenRequest;
import com.interviewTrainer.userService.requests.SignInRequest;
import com.interviewTrainer.userService.requests.SignUpRequest;

public interface AuthenticationService {
    JwtAuthenticationRequest refreshToken(RefreshTokenRequest refreshTokenRequest);
    JwtAuthenticationRequest signIn(SignInRequest signInRequest);
    JwtAuthenticationRequest signup(SignUpRequest signUpRequest);
}
