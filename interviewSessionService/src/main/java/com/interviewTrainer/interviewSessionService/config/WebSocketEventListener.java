package com.interviewTrainer.interviewSessionService.config;

import com.interviewTrainer.interviewSessionService.services.impl.OnlineUsersService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
    private final OnlineUsersService onlineUsersService;
    public WebSocketEventListener(OnlineUsersService onlineUsersService) {
        this.onlineUsersService = onlineUsersService;
    }
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event){
        StompHeaderAccessor accessor=StompHeaderAccessor.wrap(event.getMessage());
        String username=(String) accessor.getSessionAttributes().get("username");
        if (username!=null){
            onlineUsersService.userConnected(username);
            System.out.println(username + " is now online.");
        }
    }
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event){
        StompHeaderAccessor accessor=StompHeaderAccessor.wrap(event.getMessage());
        String username=(String) accessor.getSessionAttributes().get("username");
        if (username!=null){
            onlineUsersService.userDisconnected(username);
            System.out.println(username + " is now offline.");
        }
    }
}
