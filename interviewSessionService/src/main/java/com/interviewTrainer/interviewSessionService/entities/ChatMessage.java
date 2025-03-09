package com.interviewTrainer.interviewSessionService.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID sender;
    private UUID recipient; // The user receiving the message
    @Version
    private Long version;
    private String content;
    private String type; // CHAT, JOIN, LEAVE
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    @PrePersist
    private void prePersist() {
        if (version == null) {
            version = 0L;  // Initialize the version field
        }
    }
}
