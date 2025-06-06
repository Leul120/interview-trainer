package com.interviewTrainer.authService.requests;

import lombok.Data;

@Data
public class UserRequest {
    private String email;


    private String password;

    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private String role;
}
