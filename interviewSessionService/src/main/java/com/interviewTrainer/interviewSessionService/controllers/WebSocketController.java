package com.interviewTrainer.interviewSessionService.controllers;

import com.interviewTrainer.interviewSessionService.entities.ChatMessage;
import com.interviewTrainer.interviewSessionService.repositories.ChatMessageRepository;
import com.interviewTrainer.interviewSessionService.services.impl.OnlineUsersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Set;

@Controller
//@CrossOrigin("http://localhost:3000")
public class WebSocketController {
    Logger log= LoggerFactory.getLogger(WebSocketController.class);
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final OnlineUsersService onlineUsersService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository,OnlineUsersService onlineUsersService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.onlineUsersService=onlineUsersService;
    }

    @MessageMapping("/chat.privateMessage")
    public void privateMessage(ChatMessage message, StompHeaderAccessor headerAccessor) {
//        String sender=(String) headerAccessor.getSessionAttributes().get("username");
        System.out.println("sender"+message);
////        message.setSender(sender);

        ChatMessage chatMessage=chatMessageRepository.save(message);
        System.out.println(String.valueOf(chatMessage));

        // Send message to the specific user
        messagingTemplate.convertAndSendToUser(
                message.getRecipient().toString(), "/queue/messages", message);
    }
    @MessageMapping("/chat.onlineUsers")
    public void onlineUsers(StompHeaderAccessor headerAccessor) {
        String sender=(String) headerAccessor.getSessionAttributes().get("userId");
        Set<String> a=onlineUsersService.getOnlineUsers();
        System.out.println(a.toString());
        messagingTemplate.convertAndSendToUser(
                sender, "/topic/online-users", onlineUsersService.getOnlineUsers());
    }


}