package com.interviewTrainer.authService.requests;

import com.interviewTrainer.authService.entities.Award;
import com.interviewTrainer.authService.entities.Experience;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class SignUpRequest {
    private String email;

    private String password;
    private String name;
    private String profilePicture;
    private List<Award> awards;
    private List<Experience> experiences;

    private String type;


    private String biography;

    private String industry;

    private Set<String> expertise;


}
