package com.interviewTrainer.interviewSessionService.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private Boolean status;
    private String message;
    private Object data;

}
