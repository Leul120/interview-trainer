package com.interviewTrainer.authService.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


import java.time.Year;
import java.util.UUID;
@AllArgsConstructor
@NoArgsConstructor
public class Award {

    private UUID id;
    private String title;
    private Year year;
    private String category;
    private String description;
    private User user;
}
