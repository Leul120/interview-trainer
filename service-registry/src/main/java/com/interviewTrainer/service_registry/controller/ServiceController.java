package com.interviewTrainer.service_registry.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/service")
public class ServiceController {
    @GetMapping
    public ResponseEntity<String> get(){
        return ResponseEntity.ok("hello world!");
    }
}
