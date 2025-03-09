package com.interviewTrainer.userService.requests;

import com.interviewTrainer.userService.entity.*;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class SignUpRequest {
    private String email;

    private String password;
    private String name;
    private String profilePicture;

    private UserType type;

    private String biography;

    private String industry;

    private List<String> expertise;
    private List<Award> awards;
    private List<Experience> experiences;


}
