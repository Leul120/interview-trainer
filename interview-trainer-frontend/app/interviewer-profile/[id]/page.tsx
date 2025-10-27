"use client"

import { useContext, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Award,
  MessageCircle,
  Send,
  X,
  Loader2,
  MinusCircle,
  PlusCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useChat } from "@/services/use-chat"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { format, parseISO } from "date-fns"
import { Label } from "@/components/ui/label"
import { jwtDecode } from "jwt-decode"
import { AppContext } from "@/app/layout"

export default function InterviewerProfile() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("10:00")
  const [selectedDuration, setSelectedDuration] = useState(60) // Default duration in minutes
  const [interviewer, setInterviewer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams()
  const {token}=useContext(AppContext)
  const [sender, setSender] = useState<string | null>(null)
  const router=useRouter()
  // Get token after component mounts on the client
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<{ userId: string }>(token)
        setSender(decoded.userId)
      } catch (error) {
        console.error("Failed to decode token:", error)
      }
    }
  }, [])

  // Use the chat hook
  const {
    messages = [],
    isLoading: isChatLoading,
    error,
    sendMessage,
    isRecipientOnline,
  } = useChat(interviewer?.id || "")

  // Fetch interviewer profile
  const getInterviewerProfile = async () => {
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/public/get-user-by-id/${id}`)
      setInterviewer(response.data)
    } catch (error) {
      console.error("Failed to fetch interviewer profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getInterviewerProfile()
  }, [id])

  // Handle booking an interview
  const handleBookInterview = async () => {

    if(!token){
                  router.push("/login") 
                }
    if (!selectedDate || !selectedTime || !interviewer?.id) return

    try {
      // Combine date and time into a single timestamp
      const [hours, minutes] = selectedTime.split(":")
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0)

      // Format the date and time in the required format (yyyy-MM-dd HH:mm:ss)
      const formattedDate = format(scheduledAt, "yyyy-MM-dd HH:mm:ss")

      const response = await axios.post(
        "https://apigateway-25az.onrender.com/api/v1/session/schedule-interview",
        {
          interviewerId: interviewer.id,
          scheduledAt: formattedDate,
          duration: selectedDuration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.status === 200) {
        alert("Interview scheduled successfully!")
        setSelectedDate(new Date())
        setSelectedTime("10:00")
      }
    } catch (error) {
      console.error("Failed to schedule interview:", error)
      alert(error.response?.data?.message || "Failed to schedule interview. Please try again.")
    }
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sender) return

    try {
      await sendMessage(inputMessage, sender)
      setInputMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Handle predefined messages
  const handlePredefinedMessage = async (message) => {
    if (!sender) return

    try {
      await sendMessage(message, sender)
    } catch (error) {
      console.error("Failed to send predefined message:", error)
    }
  }

  // Quick actions for predefined messages
  const quickActions = [
    { label: "Schedule Interview", message: "I'd like to schedule an interview with you." },
    { label: "Check Availability", message: "What are your available time slots this week?" },
    { label: "Confirm Availability", message: "Are you available on [date] at [time]?" },
    { label: "Propose New Time", message: "Can we reschedule the interview to [date] at [time]?" },
    { label: "Reschedule Interview", message: "I need to reschedule the interview. Can we find another time?" },
    {
      label: "Request Reschedule",
      message: "Due to unforeseen circumstances, I need to reschedule. What are your available slots?",
    },
    { label: "Confirm Reschedule", message: "Thank you for rescheduling. I'll see you on [date] at [time]." },
    { label: "Running Late", message: "I'm running late for the interview. I'll be there in [minutes] minutes." },
    {
      label: "Technical Issues",
      message: "I'm experiencing technical issues. Can we delay the interview by [minutes] minutes?",
    },
    {
      label: "Emergency Excuse",
      message: "I have an emergency and won't be able to attend the interview. Can we reschedule?",
    },
    { label: "Interview Process", message: "Can you explain the interview process?" },
    { label: "Interview Topics", message: "What topics will be covered in the interview?" },
    { label: "Preparation Tips", message: "Do you have any tips for preparing for the interview?" },
    { label: "Interview Duration", message: "How long will the interview last?" },
    { label: "Request Feedback", message: "Can you provide feedback on my performance?" },
    { label: "Follow-up", message: "When can I expect to hear back about the next steps?" },
    { label: "Thank You", message: "Thank you for the opportunity to interview!" },
    { label: "Clarify Doubts", message: "I have a few questions about the role. Can we discuss them?" },
    { label: "Share Documents", message: "I'll share the required documents shortly." },
    { label: "Confirm Attendance", message: "I'll be attending the interview as scheduled." },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!interviewer) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Interviewer not found.</AlertDescription>
        </Alert>
      </div>
    )
  }
const expertiseString =interviewer?.expertise;
const expertiseArray = expertiseString?.replace(/[\[\]]/g, "").split(", ").map(item => item.trim());
  // Ensure these properties are arrays to prevent "map is not a function" errors
  const expertise = Array.isArray(expertiseArray) ? expertiseArray : []
  const awards = Array.isArray(interviewer.awards) ? interviewer.awards : []
  const reviews = Array.isArray(interviewer.reviews) ? interviewer.reviews : []
  const experiences = Array.isArray(interviewer.experiences) ? interviewer.experiences : []

  

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Interviewer Profile Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={interviewer.profilePicture} alt={interviewer.name} />
              <AvatarFallback>
                {interviewer.name
                  ? interviewer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl">{interviewer.name}</CardTitle>
              <CardDescription className="text-xl mb-2">{interviewer.industry}</CardDescription>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {expertise.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{interviewer.averageRating || 0}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-blue-500 mr-1" />
                  <span>{interviewer.completedInterviews || 0}+ interviews</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{interviewer.biography}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary" />
                <span>{experiences.length} years of experience</span>
              </div>
              <div className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                <span>{interviewer.education || "Not specified"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Interview and Awards Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Schedule Interview</CardTitle>
              <CardDescription>Choose a date and time for your interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Picker */}
              <div>
                <Label>Select Date</Label>
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Time Picker */}
              <div>
                <Label>Select Time</Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Duration Picker */}
              <div>
                <Label>Duration (minutes)</Label>
                <div className="flex items-center justify-between px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDuration(Math.max(30, selectedDuration - 30))}
                    disabled={selectedDuration <= 30}
                  >
                    <MinusCircle className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="font-medium">{selectedDuration} min</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDuration(Math.min(120, selectedDuration + 30))}
                    disabled={selectedDuration >= 120}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="w-full" disabled={!selectedDate || !selectedTime} onClick={handleBookInterview}>
                Book Interview
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full" onClick={() => {setIsChatOpen(true)
                if(!token){
                  router.push("/login") 
                }}
              }>
                Chat to Negotiate
                <MessageSquare className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Awards Card */}
          <Card>
            <CardHeader>
              <CardTitle>Awards & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {awards.length > 0 ? (
                  awards.map((award, index) => (
                    <li key={index} className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-yellow-400" />
                      <span>{award.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No awards listed</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Card */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarFallback>
                          {review.reviewerName
                            ? review.reviewerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{review.reviewerName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{review.reviewerRole}</p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No reviews yet</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Reviews
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 top-16 right-4 w-[400px] bg-card shadow-lg rounded-lg border overflow-auto"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={interviewer.profilePicture} alt={interviewer.name} />
                  <AvatarFallback>
                    {interviewer.name
                      ? interviewer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{interviewer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isRecipientOnline ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Online
                      </span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="h-[330px] p-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {Array.isArray(messages) && messages.length > 0 ? (
                  messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", message.recipient === interviewer.id ? "justify-end" : "justify-start")}
                    >
                      <div className="flex flex-col gap-2 max-w-[80%]">
                        <div
                          className={cn(
                            "rounded-lg p-3",
                            message.sender === sender
                              ? "bg-primary text-primary-foreground ml-auto self-end"
                              : "bg-muted",
                          )}
                        >
                          {message.content}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {message.sender === sender && (
                            <span className="ml-1">
                              {message.status === "sent" && "✓"}
                              {message.status === "delivered" && "✓✓"}
                              {message.status === "read" && <span className="text-blue-500">✓✓</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">No messages yet. Start a conversation!</div>
                )}

                {isChatLoading && (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input and Quick Actions */}
            <div className="border-t p-4 space-y-4">
              <div className="flex gap-2 pb-2 overflow-auto no-scrollbar">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePredefinedMessage(action.message)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={isChatLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

