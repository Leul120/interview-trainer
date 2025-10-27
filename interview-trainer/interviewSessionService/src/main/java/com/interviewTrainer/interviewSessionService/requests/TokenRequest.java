package com.interviewTrainer.interviewSessionService.requests;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenRequest {
    private String roomId;
    private String participant;


}
