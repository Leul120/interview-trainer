package com.interviewTrainer.authService.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
public class Experience {
    private String title;
    private String description;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
}
