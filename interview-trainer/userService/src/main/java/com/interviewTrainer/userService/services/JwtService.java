package com.interviewTrainer.userService.services;

import com.interviewTrainer.userService.entity.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

public interface JwtService {
    String generateToken(User user);
    String extractUserName(String token);
    boolean isTokenValid(String token,UserDetails userDetails);
    String generateRefreshToken(User user);
}
