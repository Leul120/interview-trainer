package com.interviewTrainer.questionGenerationService.FeignClients;


import com.interviewTrainer.questionGenerationService.config.FeignClientConfig;
import com.interviewTrainer.questionGenerationService.requests.UserDetailsDTO;
import com.interviewTrainer.questionGenerationService.requests.UserResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "userService",url = "https://user-service-ubos.onrender.com",path = "/api/v1/user",configuration = FeignClientConfig.class)
public interface UserClient {
    @GetMapping("/get-user/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email);
    @GetMapping("/load-user-by-email/{email}")
    public ResponseEntity<UserDetailsDTO> loadUserByEmail(@PathVariable String email);
    @GetMapping("/public/get-user-by-id/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id);
    @PostMapping("/get-users-by-emails")
    public List<UserResponseDTO> getUsersByEmails(@RequestBody List<String> emails);
    @PostMapping("/update-score/{userId}/{confidenceScore}/{overAllScore}")
    public void updateScore(@PathVariable UUID userId,@PathVariable double confidenceScore,@PathVariable double overAllScore);
}
