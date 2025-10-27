"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useChat, useChatToggle } from "@livekit/components-react"

export function ChatPanel() {
  const [message, setMessage] = useState("")
  const { send, chatMessages: messages } = useChat()
  const { isChatOpen } = useChatToggle()

  const handleSend = () => {
    if (message.trim()) {
      send(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isChatOpen) return null

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.isSelf ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {!msg.isSelf && <div className="text-xs font-medium mb-1 text-muted-foreground">{msg.from?.name}</div>}
                <div className="break-words">{msg.message}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t mt-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

