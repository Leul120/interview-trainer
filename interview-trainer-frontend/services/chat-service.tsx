"use client";

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://interview-session-service-qvhu.onrender.com";

export class ChatService {
  private client: Client | null = null;
  private messageHandlers: ((message: any) => void)[] = [];
  private onlineStatusHandlers: ((users: string[]) => void)[] = [];
  private connected: boolean = false;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const socket = new SockJS(`${API_URL}/ws`);
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: async () => {
          this.connected = true;
          try {
            const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/online-status/true`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Connected to WebSocket");
            this.subscribeToMessages();
            this.subscribeToOnlineStatus();
          } catch (error) {
            console.error("Error setting online status:", error);
          }
        },
        onDisconnect: async () => {
          this.connected = false;
          try {
            await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/online-status/false`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Disconnected from WebSocket");
          } catch (error) {
            console.error("Error setting offline status:", error);
          }
        },
        onStompError: (frame) => {
          console.error("STOMP error", frame);
        },
      });

      this.client.activate();
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
    }
  }

  private subscribeToMessages() {
    if (typeof window === 'undefined' || !this.client?.connected) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const decoded = jwtDecode<{userId: string}>(token);
      const userId = decoded.userId;
      
      this.client.subscribe(`/user/${userId}/queue/messages`, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          this.messageHandlers.forEach((handler) => handler(parsedMessage));
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });
    } catch (error) {
      console.error("Error subscribing to messages:", error);
    }
  }

  private subscribeToOnlineStatus() {
    if (!this.client?.connected) return;
    
    this.client.subscribe("/topic/online-users", (message) => {
      try {
        const onlineUsers = JSON.parse(message.body);
        this.onlineStatusHandlers.forEach((handler) => handler(onlineUsers));
      } catch (error) {
        console.error("Error parsing online status:", error);
      }
    });
  }

  public async sendMessage(recipient: string, content: string, sender: string) {
    if (typeof window === 'undefined') {
      throw new Error("Cannot send messages server-side");
    }
    
    if (!this.client?.connected) {
      // Try to reconnect if not connected
      this.initializeWebSocket();
      
      // If still not connected after reconnection attempt
      if (!this.client?.connected) {
        throw new Error("WebSocket not connected");
      }
    }

    const message = { sender, recipient, content };
    this.client.publish({
      destination: "/app/chat.privateMessage",
      body: JSON.stringify(message),
    });
  }

  public async fetchChatHistory(recipient: string) {
    if (typeof window === 'undefined' || !recipient) {
      return [];
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/chat/history/${recipient}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  }

  public async fetchOnlineUsers() {
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/chat/online-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching online users:", error);
      return [];
    }
  }

  public onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  public onOnlineStatusChange(handler: (users: string[]) => void) {
    this.onlineStatusHandlers.push(handler);
    return () => {
      this.onlineStatusHandlers = this.onlineStatusHandlers.filter((h) => h !== handler);
    };
  }

  public async fetchChats() {
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    }
  }

  public async markMessageAsRead(messageId: string) {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await axios.post(
        `https://apigateway-25az.onrender.com/api/chat/messages/${messageId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }

  public async scheduleInterview(interviewerId: string, date: Date, duration: number) {
    if (typeof window === 'undefined') {
      throw new Error("Cannot schedule interviews server-side");
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
      
      await axios.post(
        `https://apigateway-25az.onrender.com/api/v1/session/schedule-interview`,
        {
          interviewerId,
          date,
          duration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      console.error("Error scheduling interview:", error);
      throw error;
    }
  }

  public disconnect() {
    this.client?.deactivate();
  }
}

export const chatService = new ChatService();