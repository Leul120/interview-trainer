package com.interviewTrainer.questionGenerationService.services.impl;

import com.interviewTrainer.questionGenerationService.FeignClients.UserClient;
import com.interviewTrainer.questionGenerationService.requests.UserDetailsDTO;
import com.interviewTrainer.questionGenerationService.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserClient userClient;
    @Override
    public UserDetailsService userDetailsService() {
        return username -> {
            UserDetailsDTO dto = userClient.loadUserByEmail(username).getBody();
            if (dto == null) {
                throw new UsernameNotFoundException("User not found with username: " + username);
            }
            return new org.springframework.security.core.userdetails.User(
                    dto.getUsername(),
                    dto.getPassword(),
                    dto.getAuthorities()
            );
        };
    }
}
