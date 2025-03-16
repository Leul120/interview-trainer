package com.interviewTrainer.userService.responses;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.interviewTrainer.userService.entity.Award;
import com.interviewTrainer.userService.entity.Experience;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private UUID id;
    private String name;
    private String email;
    private String profilePicture;
    private String role;
    private String type;
    private String industry;
    private List<Experience> experiences;
    private List<Award> awards;
    private double overallPerformanceScore;
    private double confidenceScore;
    private String availabilityStatus;
    private String expertise;
    private boolean online;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime wasOnlineAt;
}
