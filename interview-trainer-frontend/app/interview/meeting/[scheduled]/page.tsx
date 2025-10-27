"use client"

import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  LayoutContextProvider,
  useTracks,
  ParticipantTile,
  GridLayout,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Track } from "livekit-client"
import { useContext, useEffect, useState } from "react"
// import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import axios from "axios"
import { NotesPanel } from "@/components/notes-panel"
import { RecordingControls } from "@/components/recording-controls"
// import { FeedbackModal } from "@/components/feedback-modal"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AiAnalysisModal } from "@/components/analysis-modal"
import { useToast } from "@/hooks/use-toast"
import { AppContext } from "@/app/layout"

function RoomContent({ participant }: { participant: string }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  return (
    <LayoutContextProvider>
      <div className="grid grid-cols-[1fr,400px] h-full">
        <div className="relative">
          <GridLayout tracks={tracks} style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}>
            <ParticipantTile />
          </GridLayout>
          <div className="absolute bottom-16 left-4">
            <RecordingControls
              // streams={[]} // You'll need to pass the actual streams here
              isHost={participant === "host"}
            />
          </div>
        </div>
        <div className="border-l p-4 bg-muted/10">
          <NotesPanel />
        </div>
      </div>
      <RoomAudioRenderer />
      <ControlBar
        controls={{
          microphone: true,
          camera: true,
          screenShare: true,
          chat: true,
        }}
      />
    </LayoutContextProvider>
  )
}

const RealPersonInterview = () => {
  const [roomId, setRoomId] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [participant, setParticipant] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [session,setSession]=useState()
  const [showAiAnalysis, setShowAiAnalysis] = useState(false)
  const {scheduled}=useParams()
  const searchParams = useSearchParams()
  const [user,setUser]=useState()
  const sessionId=searchParams.get("session")
  const {toast}=useToast()
  const [meetingToken,setMeetingToken]=useState("")
  const router=useRouter()
  const {token}=useContext(AppContext)
  console.log(sessionId)
  useEffect(()=>{
    if(!token){
      router.push("/login") 
    }
    if(sessionId){
    joinSession()
    }
  },[])
  const getUserProfile = async () => {
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/public/get-user`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      setUser(response.data)
      
    } catch (error) {
      console.error("Failed to fetch interviewer profile:", error)
    }
  }
  useEffect(()=>{
    getUserProfile()
  },[])
  // Create a new session (host)
  const createSession = async () => {
    if(!token){
      router.push("/login") 
    }
    setIsConnecting(true)
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/start-session/${scheduled}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      console.log(response.data)
      setSession(response.data)
      setMeetingToken(response.data.token)
      setIsInterviewActive(true)
    } catch (error) {
      toast({
        title: "Failed to create session!",
        description: error.response?.data?.message || "Failed to create session.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false)
    }
  }

  // Join an existing session (candidate)
  const joinSession = async () => {

    setIsConnecting(true)
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/join-session/${scheduled}/${sessionId}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      setSession(response.data)
      console.log(response.data)
      setMeetingToken(response.data.token)
      setIsInterviewActive(true)
    } catch (error) {
      toast({
        title: "Failed to join session!",
        description: error.response?.data?.message || "Failed to join session.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false)
    }
  }
  const endSession=async ()=>{
    try{
     const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/end-session/${session.id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      
      setIsInterviewActive(false)
      setShowAiAnalysis(true)
    }catch(error){
      toast({
        title: "Failed to end session!",
        description: error.response?.data?.message || "Failed to end session.",
        variant: "destructive",
      });
    }
          
  }

  // Render the pre-interview UI (create/join session)
  if (!isInterviewActive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Virtual Interview Room</h1>
            <p className="text-muted-foreground">Create or join an interview session</p>
          </div>
          <div className="space-y-4">
            <Button className="w-full" onClick={createSession} disabled={isConnecting}>
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create New Interview Session
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <LiveKitRoom
        token={meetingToken}
        serverUrl="wss://leul-8q4e03xv.livekit.cloud"
        video={!isVideoOff}
        audio={!isMuted}
        onDisconnected={endSession}
        data-lk-theme="default"
        style={{ height: "100dvh" }}
      >
        <RoomContent participant={participant} />
      </LiveKitRoom>
        <AiAnalysisModal
        isOpen={showAiAnalysis && user?.type==="INTERVIEWER"}
        onClose={() => {
          setShowAiAnalysis(false)
          setIsInterviewActive(false)
        }}
        sessionId={session?.id}
        userId={session?.intervieweeId}
        analyzer={session?.interviewerId}
      />
    </>
  )
}

export default RealPersonInterview

