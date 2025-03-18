package com.interviewTrainer.interviewSessionService.feignClient;

import com.interviewTrainer.interviewSessionService.config.FeignClientConfig;
import com.interviewTrainer.interviewSessionService.entities.UserDetailsDTO;
import com.interviewTrainer.interviewSessionService.requests.UserResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "userService",url = "https://user-service-ubos.onrender.com",path = "/api/v1/user")
public interface UserClient {
    @GetMapping("/get-user/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email);
    @GetMapping("/load-user-by-email/{email}")
    public ResponseEntity<UserDetailsDTO> loadUserByEmail(@PathVariable String email);
    @GetMapping("/public/get-user-by-id/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id);
    @PostMapping("/get-users-by-ids")
    public List<UserResponseDTO> getUsersByIds(@RequestBody List<UUID> ids);
    @PostMapping("/update-score/{userId}/{confidenceScore}/{overAllScore}")
    public void updateScore(@PathVariable UUID userId,@PathVariable double confidenceScore,@PathVariable double overAllScore);
}
