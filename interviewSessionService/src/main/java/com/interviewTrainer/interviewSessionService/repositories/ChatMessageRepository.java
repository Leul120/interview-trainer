package com.interviewTrainer.interviewSessionService.repositories;

import com.interviewTrainer.interviewSessionService.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT c FROM ChatMessage c WHERE (c.sender = :user1Id AND c.recipient = :user2Id) OR (c.sender = :user2Id AND c.recipient = :user1Id)")
    List<ChatMessage> findByParticipants(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);

    List<ChatMessage> findByRecipient(UUID recipient);
    @Query("SELECT DISTINCT CASE WHEN cm.sender = :user THEN cm.recipient ELSE cm.sender END FROM ChatMessage cm WHERE cm.sender = :user OR cm.recipient = :user")
    List<UUID> getConversations(@Param("user") UUID user);
}
