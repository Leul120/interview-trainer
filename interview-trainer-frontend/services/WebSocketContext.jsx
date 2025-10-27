"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false); // Track connection status
  const token = window.localStorage.getItem('token');

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8090/ws', // Your WebSocket endpoint
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log("WebSocket connected");
        setIsConnected(true); // Update the connection status
      },
      onStompError: (frame) => {
        console.error("WebSocket error", frame);
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setIsConnected(false); // Reset the connection status
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false); // Cleanup connection status
      console.log("WebSocket deactivated");
    };
  }, [token]);

  const subscribe = (topic, callback) => {
    if (isConnected && stompClientRef.current) {
      return stompClientRef.current.subscribe(topic, (message) => {
        callback(message.body);
      });
    } else {
      console.warn("WebSocket not connected. Cannot subscribe to topic:", topic);
    }
  };

  const sendMessage = (destination, message) => {
    if (isConnected && stompClientRef.current) {
      stompClientRef.current.publish({ destination, body: JSON.stringify(message) });
    } else {
      console.warn("WebSocket not connected. Cannot send message to:", destination);
    }
  };

  return (
    <WebSocketContext.Provider value={{ subscribe, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
