package com.interviewTrainer.authService.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


import java.time.Year;
import java.util.UUID;
@AllArgsConstructor
@NoArgsConstructor
public class Award {

    private String title;
    private Year year;
    private String category;
    private String description;
}
