"use client"

import { useState, useEffect } from "react"
import { chatService } from "./chat-service"

export interface Message {
  id: string
  sender: string
  recipient: string
  content: string
  createdAt: Date
  status: "sent" | "delivered" | "read"
}

export interface ChatState {
  messages: Message[]
  onlineUsers: string[]
  isLoading: boolean
  error: string | null
}

export function useChat(recipient: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    onlineUsers: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true // To prevent setting state on unmounted component
    
    // Only attempt to use localStorage on the client side
    if (typeof window === 'undefined') {
      return () => { isMounted = false }
    }
    
    const token = localStorage.getItem("token")
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false, error: "User not authenticated" }))
      return () => { isMounted = false }
    }

    const loadInitialData = async () => {
      try {
        // Only load data if we have a recipient
        if (recipient) {
          const [messages, onlineUsers] = await Promise.all([
            chatService.fetchChatHistory(recipient),
            chatService.fetchOnlineUsers(),
          ])

          if (isMounted) {
            setState((prev) => ({
              ...prev,
              messages,
              onlineUsers,
              isLoading: false,
              error: null, // Clear errors on successful fetch
            }))
          }
        } else {
          // Clear messages when no recipient is selected
          setState((prev) => ({
            ...prev,
            messages: [],
            isLoading: false,
          }))
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            error: "Failed to load chat data",
            isLoading: false,
          }))
        }
      }
    }

    const messageUnsubscribe = chatService.onMessage((message) => {
      if (message.sender === recipient || message.recipient === recipient) {
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }))
      }
    })

    const onlineStatusUnsubscribe = chatService.onOnlineStatusChange((users) => {
      setState((prev) => ({
        ...prev,
        onlineUsers: users,
      }))
    })

    loadInitialData()

    return () => {
      isMounted = false
      messageUnsubscribe()
      onlineStatusUnsubscribe()
    }
  }, [recipient])

  const sendMessage = async (content: string, sender: string) => {
    if (!recipient) return;
    
    try {
      await chatService.sendMessage(recipient, content, sender)

      // Optimistically update UI with the sent message
      const newMessage: Message = {
        id: crypto.randomUUID(),
        sender,
        recipient,
        content,
        createdAt: new Date(),
        status: "sent",
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to send message",
      }))
    }
  }

  return {
    messages: state.messages,
    onlineUsers: state.onlineUsers,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    isRecipientOnline: recipient ? state.onlineUsers.includes(recipient) : false,
  }
}