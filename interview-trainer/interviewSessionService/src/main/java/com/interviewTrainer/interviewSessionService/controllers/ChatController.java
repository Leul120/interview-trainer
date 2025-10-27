package com.interviewTrainer.interviewSessionService.controllers;

import com.interviewTrainer.interviewSessionService.entities.ChatMessage;
import com.interviewTrainer.interviewSessionService.entities.UserDetailsDTO;
import com.interviewTrainer.interviewSessionService.feignClient.UserClient;
import com.interviewTrainer.interviewSessionService.repositories.ChatMessageRepository;
import com.interviewTrainer.interviewSessionService.requests.UserResponseDTO;
import com.interviewTrainer.interviewSessionService.services.impl.OnlineUsersService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/session/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final OnlineUsersService onlineUsersService;
    private final UserClient userClient;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository,OnlineUsersService onlineUsersService,UserClient userClient) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.onlineUsersService=onlineUsersService;
        this.userClient=userClient;
    }
    @GetMapping("/history/{recipient}")
    public List<ChatMessage> getChatHistory(@PathVariable String recipient,
                                            @RequestAttribute("userId") String userId) {

        return chatMessageRepository.findByParticipants(UUID.fromString(userId), UUID.fromString(recipient));
    }
    @GetMapping("/online-users")
    public Set<String> getOnlineUsers() {
        return onlineUsersService.getOnlineUsers();
    }

    @GetMapping("/conversations")
    public List<UserResponseDTO> conversations(@RequestAttribute("userId") UUID userId) {
        List<UUID> ids=chatMessageRepository.getConversations(userId);
        return userClient.getUsersByIds(ids);
    }
}
