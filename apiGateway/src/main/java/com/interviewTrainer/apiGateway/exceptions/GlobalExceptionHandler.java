package com.interviewTrainer.apiGateway.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import io.jsonwebtoken.JwtException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {



    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(Exception e) {

        String meaningfulMessage = extractMessage(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(false, meaningfulMessage, null,e.getStackTrace()));
    }

    private String extractMessage(String fullMessage) {
        if (fullMessage != null && fullMessage.contains(":")) {
            return fullMessage.substring(fullMessage.indexOf(":") + 1).trim();
        }
        return fullMessage;
    }
    @ExceptionHandler(IllegalArgumentException.class)
    private ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e){
        String meaningfulMessage = extractMessage(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(false, meaningfulMessage, null,e.getStackTrace()));

    }
}
