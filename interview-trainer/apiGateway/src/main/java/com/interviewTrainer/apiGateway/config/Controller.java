package com.interviewTrainer.apiGateway.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {
    @GetMapping
    public ResponseEntity<String> gets(){
        return ResponseEntity.ok("hello world!");
    }
    @GetMapping("/")
    public ResponseEntity<String> get(){
        return ResponseEntity.ok("Hello!");
    }
}
