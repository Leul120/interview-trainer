package com.interviewTrainer.interviewSessionService.services;

import com.interviewTrainer.interviewSessionService.entities.InterviewSession;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService {
    UserDetailsService userDetailsService();
}
