package com.interviewTrainer.apiGateway.openFeign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service", url = "https://user-service-7p0j.onrender.com", path = "/api/v1/user")
public interface UserClient {
    @GetMapping("/get-user/{email}")
    public ResponseEntity<String> getUserByEmail(@PathVariable String email);
    @GetMapping("/load-user-by-email/{email}")
    public ResponseEntity<UserDetails> loadUserByEmail(@PathVariable String email);
}
