"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import SimplePeer from "simple-peer"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  Send,
  Pause,
  Play,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react"

const InterviewStatus = {
  CONNECTING: "connecting",
  LIVE: "live",
  ENDED: "ended"
}

const RealPersonInterview = () => {
  const [interviewState, setInterviewState] = useState(InterviewStatus.CONNECTING)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [remainingTime, setRemainingTime] = useState(1800)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string, text: string }>>([])
  const [notes, setNotes] = useState("")
  const [isInterviewEnded, setIsInterviewEnded] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<"good" | "average" | "poor">("good")

  const myVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const ws = useRef<WebSocket | null>(null)
  const notesTimer = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()

  // Media stream initialization
  const initializeMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      })
      setStream(mediaStream)
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream
      }
      return mediaStream
    } catch (error) {
      toast.error("Media access denied. Please enable camera and microphone.")
      console.error("Media access error:", error)
      setInterviewState(InterviewStatus.ENDED)
    }
  }, [])

  // WebSocket and peer connection setup
  useEffect(() => {
    const initializeConnection = async () => {
      const mediaStream = await initializeMedia()
      if (!mediaStream) return

      ws.current = new WebSocket("wss://your-signaling-server.com")
      
      ws.current.onmessage = async (message) => {
        const data = JSON.parse(message.data)
        
        if (data.offer) {
          const newPeer = new SimplePeer({
            trickle: false,
            config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
          })

          newPeer.signal(data.offer)
          setPeer(newPeer)

          newPeer.on("signal", answer => {
            ws.current?.send(JSON.stringify({ answer }))
          })

          newPeer.on("stream", remoteStream => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
            }
          })

          newPeer.on("error", error => {
            console.error("Peer error:", error)
            toast.error("Connection error. Trying to reconnect...")
          })
        }
      }

      const newPeer = new SimplePeer({
        initiator: true,
        stream: mediaStream,
        config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
      })

      newPeer.on("signal", offer => {
        ws.current?.send(JSON.stringify({ offer }))
      })

      newPeer.on("stream", remoteStream => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
        }
      })

      newPeer.on("connect", () => {
        setInterviewState(InterviewStatus.LIVE)
        toast.success("Interview session connected!")
      })

      setPeer(newPeer)
    }

    if (interviewState === InterviewStatus.CONNECTING) {
      initializeConnection()
    }

    return () => {
      ws.current?.close()
      peer?.destroy()
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [interviewState, initializeMedia])

  // Timer management
  useEffect(() => {
    if (interviewState !== InterviewStatus.LIVE) return

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          setIsInterviewEnded(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [interviewState])

  // Notes autosave
  useEffect(() => {
    notesTimer.current = setInterval(() => {
      if(window !== "undefined"){
      localStorage.setItem("interviewNotes", notes)
      }
    }, 5000)

    return () => {
      if (notesTimer.current) clearInterval(notesTimer.current)
    }
  }, [notes])

  const toggleMedia = (type: "audio" | "video") => {
    if (!stream) return

    const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks()
    const newState = !tracks[0].enabled
    
    tracks.forEach(track => track.enabled = newState)
    
    type === "audio" 
      ? setIsMuted(!newState)
      : setIsVideoOff(!newState)
  }

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const message = formData.get("message") as string
    
    if (message.trim()) {
      setChatMessages(prev => [...prev, { sender: "You", text: message }])
      ;(e.target as HTMLFormElement).reset()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Live Technical Interview
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant={connectionQuality} className="uppercase">
            {connectionQuality} connection
          </Badge>
          <div className="flex items-center text-lg font-semibold">
            <Clock className="w-5 h-5 mr-2" />
            {formatTime(remainingTime)}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Section */}
        <section className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border-4 border-secondary">
            <video 
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            <video
              ref={myVideoRef}
              autoPlay
              muted
              playsInline
              className="absolute bottom-4 right-4 w-1/4 h-1/4 object-cover rounded-lg border-2 border-primary shadow-xl"
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => toggleMedia("audio")}
                    >
                      {isMuted ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMuted ? "Unmute" : "Mute"}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => toggleMedia("video")}
                    >
                      {isVideoOff ? (
                        <VideoOff className="h-5 w-5" />
                      ) : (
                        <Video className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isVideoOff ? "Enable Camera" : "Disable Camera"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Current Question Card */}
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Badge variant="outline" className="text-lg px-3 py-2">
                  Q3
                </Badge>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    Explain the Virtual DOM concept in React
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Sample Answer
                    </Button>
                    <Button variant="outline" size="sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Request Clarification
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sidebar Section */}
        <section className="space-y-6">
          {/* Interviewer Profile */}
          <Card className="bg-background">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-primary">
                  <AvatarImage src="/interviewer.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Alex Johnson</h3>
                  <p className="text-sm text-muted-foreground">
                    Senior Frontend Engineer @ TechCorp
                  </p>
                  <Progress value={75} className="mt-2 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Interview Progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Panel */}
          <Card>
            <CardContent className="p-6 h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      msg.sender === "You" 
                        ? "bg-blue-100 dark:bg-blue-900 ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium">{msg.sender}</p>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  name="message"
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notes Panel */}
          <Card>
            <CardContent className="p-6 h-64 flex flex-col">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Private notes..."
                className="flex-1 resize-none bg-transparent"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Auto-saved every 5 seconds
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Interview Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsInterviewEnded(true)}>
              End Interview
            </Button>
            <Button variant="secondary">
              <Pause className="w-4 h-4 mr-2" />
              Pause Session
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Recording in progress
            </div>
            <Button variant="ghost" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Post-Interview Modal */}
      <Dialog open={isInterviewEnded} onOpenChange={setIsInterviewEnded}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Interview Summary</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Performance Metrics</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Speech Clarity</span>
                  <span className="font-semibold">92%</span>
                </div>
                <Progress value={92} />
              </div>
              {/* Add more metrics */}
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                Download Recording
              </Button>
              <Button variant="outline" className="w-full">
                View Full Transcript
              </Button>
              <Button className="w-full">
                Schedule Follow-Up
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RealPersonInterview

