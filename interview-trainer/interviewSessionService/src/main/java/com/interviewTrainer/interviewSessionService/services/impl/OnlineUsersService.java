package com.interviewTrainer.interviewSessionService.services.impl;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineUsersService {
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    public void userConnected(String username) {
        onlineUsers.add(username);
    }

    public void userDisconnected(String username) {
        onlineUsers.remove(username);
    }

    public Set<String> getOnlineUsers() {
        return onlineUsers;
    }
}

