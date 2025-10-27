"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, Send, ChevronLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from "@/services/use-chat"
import { chatService } from "@/services/chat-service"
import { jwtDecode } from "jwt-decode"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { AppContext } from "../layout"

interface UserResponseDTO {
  id: string
  name: string
  email: string
  profilePicture: string
  online: boolean
  wasOnlineAt: Date
}

export default function InterviewerChatsPage() {
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserResponseDTO[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { messages = [], isLoading, sendMessage, isRecipientOnline } = useChat(selectedUser?.id || "")
  const [inputMessage, setInputMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const {token}=useContext(AppContext)
  const router=useRouter()
  // Get current user ID from token
  useEffect(() => {
      try {
        
        if (token) {
          const decoded = jwtDecode(token)
          setCurrentUserId(decoded.userId || "")
        }else{
          router.push("/login")
        }
      } catch (error) {
        console.error("Error decoding token:", error)
      } finally {
        // Set initializing to false after token check
        setIsInitializing(false)
      }

  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const response = await chatService.fetchChats()
        setUsers(response)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (typeof window !== "undefined") {
      fetchUsers()
    }
  }, [])

  // Focus input when selecting a user
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedUser])

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [users, searchQuery])

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!inputMessage.trim() || !selectedUser || !currentUserId || isSendingMessage) return

      setIsSendingMessage(true)
      try {
        await sendMessage(inputMessage, currentUserId)
        setInputMessage("")
      } catch (error) {
        console.error("Failed to send message:", error)
      } finally {
        setIsSendingMessage(false)
        // Focus input after sending
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    },
    [inputMessage, selectedUser, sendMessage, currentUserId, isSendingMessage],
  )

  // User list skeleton loader
  const UserListSkeleton = () => (
    <div className="space-y-2 p-2">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="w-full p-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
    </div>
  )

  // Message skeleton loader
  const MessageSkeleton = () => (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div key={index} className={cn("flex", index % 2 === 0 ? "justify-start" : "justify-end")}>
            {index % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full mr-2 self-end mb-3" />}
            <div
              className={cn(
                "rounded-lg p-3 max-w-[70%]",
                index % 2 === 0 ? "bg-muted/50 rounded-tl-none" : "bg-primary/30 rounded-tr-none",
              )}
            >
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-end mt-2">
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            {index % 2 !== 0 && <Skeleton className="h-10 w-10 rounded-full ml-2 self-end mb-3" />}
          </div>
        ))}
    </div>
  )

  // User list component
  const UserList = useMemo(
    () => (
      <div className="w-full md:w-80 border-r flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
              disabled={isLoadingUsers}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {isLoadingUsers ? (
            <UserListSkeleton />
          ) : (
            <div className="space-y-2 p-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      "w-full p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3",
                      selectedUser?.id === user.id && "bg-accent",
                    )}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.online ? "Online" : `Last active: ${new Date(user.wasOnlineAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No users found</div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    ),
    [filteredUsers, searchQuery, selectedUser, isLoadingUsers],
  )

  // Chat view component
  const ChatView = useMemo(() => {
    if (!selectedUser) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No user selected</h3>
            <p className="text-muted-foreground">Select a user to view conversation</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 border-b flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedUser.profilePicture} />
              <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{selectedUser.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking status...</span>
                  </>
                ) : isRecipientOnline ? (
                  "Online"
                ) : (
                  "Offline"
                )}
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <MessageSkeleton />
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", message.sender === currentUserId ? "justify-end" : "justify-start")}
                >
                  {message.sender !== currentUserId && (
                    <Avatar className="mr-2 self-end mb-3">
                      <AvatarImage src={selectedUser.profilePicture} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[70%]",
                      message.sender === currentUserId
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none",
                    )}
                  >
                    {message.content}
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {message.sender === currentUserId && (
                    <Avatar className="ml-2 self-end mb-3">
                      <AvatarFallback>Me</AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Send a message to start the conversation.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isLoading || isSendingMessage}
            />
            <Button type="submit" disabled={!inputMessage.trim() || !currentUserId || isLoading || isSendingMessage}>
              {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    )
  }, [
    selectedUser,
    isMobile,
    isRecipientOnline,
    messages,
    handleSendMessage,
    inputMessage,
    currentUserId,
    isLoading,
    isSendingMessage,
  ])

  // Initial loading state
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="font-medium text-lg">Initializing chat</h3>
          <p className="text-muted-foreground">Please wait while we load your conversations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {(!isMobile || !selectedUser) && UserList}
      {(!isMobile || selectedUser) && ChatView}
    </div>
  )
}


