package com.interviewTrainer.authService.openFeign;

import com.interviewTrainer.authService.entities.User;
import com.interviewTrainer.authService.requests.JwtAuthenticationRequest;
import com.interviewTrainer.authService.requests.RefreshTokenRequest;
import com.interviewTrainer.authService.requests.SignInRequest;
import com.interviewTrainer.authService.requests.SignUpRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service", url = "https://user-service-ubos.onrender.com", path = "/api/v1/user")
public interface UserClient {

    @PostMapping("/signup")
    public ResponseEntity<JwtAuthenticationRequest> signup(@RequestBody SignUpRequest signUpRequest);
    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationRequest> signIn(@RequestBody SignInRequest signInRequest);
    @PostMapping("/refresh")
    public ResponseEntity<JwtAuthenticationRequest> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest);
}
