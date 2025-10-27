"use client"

import { useState, useRef, useEffect, useCallback, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mic,
  PauseCircle,
  PlayCircle,
  VolumeX,
  Volume2,
  StopCircle,
  SkipForward,
  Loader2,
  RefreshCcw,
  Camera,
  CameraOff,
  Settings,
  HelpCircle,
  AlertCircle,
  Home,
  Clock,
  BarChart3,
  Tag,
  MicVocal
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// import { AnimatedInterviewer } from "@/components/AnimatedInterviewer"
import { generateQuestion, getFeedback, type Question, type AiAnalysis } from "@/services/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ReactMarkdown from "react-markdown"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { FeedbackDisplay } from "@/components/FeedbackDisplay"
import dynamic from "next/dynamic"
import { AppContext } from "@/app/layout"

// Dynamically import AnimatedInterviewer with SSR disabled
const AnimatedInterviewer = dynamic(
  () => import("@/components/AnimatedInterviewer"),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
  }
)

const voicesList = [
  { name: "Default", value: "default" },
  { name: "Male", value: "male" },
  { name: "Female", value: "female" },
  { name: "Robotic", value: "robotic" },
]

export default function AIInterviewContent() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [displayedTranscript, setDisplayedTranscript] = useState("") // Added missing state for displayed transcript
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isInterviewComplete, setIsInterviewComplete] = useState(false)
  const [answers, setAnswers] = useState([])
  const [questions, setQuestions] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [selectedVoice, setSelectedVoice] = useState("female")
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [interviewTimer, setInterviewTimer] = useState(0)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [volume, setVolume] = useState(50)
  const [isAutoNext, setIsAutoNext] = useState(false)
  const [questionDuration, setQuestionDuration] = useState(60)
  const [showTutorial, setShowTutorial] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [session, setSession] = useState(null)
  const [isAnswering,setIsAnswering]=useState(false)
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const speechTimeoutRef = useRef(null)
  const recognitionRef = useRef(null)
  const { toast } = useToast()
  
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const description = searchParams.get("description");
  const focusAreas = searchParams.get("focusAreas");
  const difficulty = searchParams.get("difficulty");
  const title=searchParams.get("title");
  const {token}=useContext(AppContext)
  console.log("ai",token)
  const router=useRouter()
  useEffect(() => {
    if(!token){
      router.push("/login") 
    }
  }, [token]);

  window.addEventListener("beforeunload", (event) => {
    // Perform cleanup or cancel ongoing process
    cancelInterview();

});

  const generateNextQuestion = useCallback(async (session) => {
    setIsLoading(true)
    setSession(session);
    
    if (!session?.id) {
      toast({
        title: "Error",
        description: "No active session found. Please restart the interview.",
        variant: "destructive",
      })
      return;
    }
    
    try {
      const question = await generateQuestion(category, difficulty, session?.id, description, focusAreas);
      setCurrentQuestion(question)
      setQuestions((prevQuestions) => [...prevQuestions, question])
      speakQuestion(question.questionText)
      setProgress(0)
      setTranscript("")
      setDisplayedTranscript("") // Reset displayed transcript
      // startRecording()
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
    } catch (error) {
      console.error("Error generating question:", error)
      toast({
        title: "Error",
        description: "Failed to generate the next question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [category, difficulty, description, focusAreas, session, toast])

  useEffect(() => {
    if (isInterviewStarted && !isPaused) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = oldProgress + 100 / questionDuration
          if (newProgress >= 100) {
            clearInterval(timer)
            if (isAutoNext) {
              handleAnswerComplete()
            }
            return 100
          }
          return newProgress
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isInterviewStarted, isPaused, questionDuration, isAutoNext])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          // Ignore errors when stopping recognition
        }
      }
      // Cancel any ongoing speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const setupSpeechRecognition = () => {
    if (typeof window === "undefined") return false
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      })
      return false
    }
    
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
      }
      setDisplayedTranscript(interimTranscript)
    }
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use the interview simulator.",
          variant: "destructive",
        })
      }
    }
    
    return true
  }
  const startInterview = async () => {
    if (typeof window === "undefined") return
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/start-ai-session/${title}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data || !response.data.id) {
        throw new Error('Invalid session response');
      }

      
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
              }
            : false,
          audio: true,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          try {
            await videoRef.current.play()
          } catch (error) {
            console.error("Error playing video:", error)
            toast({
              title: "Video Error",
              description: "Unable to play video stream. Please check your browser settings.",
              variant: "destructive",
            })
          }
        }

        setIsInterviewStarted(true)
        setIsPaused(false)


        timerRef.current = setInterval(() => {
          setInterviewTimer((prev) => prev + 1)
        }, 1000)

        await generateNextQuestion(response.data)
      } catch (mediaError) {
        console.error("Media error:", mediaError)
        toast({
          title: "Media Error",
          description: "Unable to access camera or microphone. Please check your permissions.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error starting interview:", err)
      toast({
        title: "Error",
        description: "Unable to start interview session. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject)
        chunksRef.current = [] // Clear previous chunks

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }

        mediaRecorderRef.current.start()
      } catch (error) {
        console.error("Error starting media recorder:", error)
        toast({
          title: "Recording Error",
          description: "Unable to start recording. Please check your browser permissions.",
          variant: "destructive",
        })
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop()
      } catch (error) {
        console.error("Error stopping media recorder:", error)
      }
    }
  }

  const pauseInterview = () => {
    setIsPaused(true)
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject).getTracks().forEach((track) => {
        track.enabled = false
      })
    }
    
    try {
      recognitionRef.current?.stop()
    } catch (error) {
      console.error("Error stopping speech recognition:", error)
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.pause()
      } catch (error) {
        console.error("Error pausing media recorder:", error)
      }
    }
    
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  const resumeInterview = () => {
    setIsPaused(false)
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject).getTracks().forEach((track) => {
        track.enabled = true
      })
    }
    
    try {
      recognitionRef.current?.start()
    } catch (error) {
      console.error("Error starting speech recognition:", error)
    }
    
    timerRef.current = setInterval(() => {
      setInterviewTimer((prev) => prev + 1)
    }, 1000)
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      try {
        mediaRecorderRef.current.resume()
      } catch (error) {
        console.error("Error resuming media recorder:", error)
      }
    }
  }

  const handleAnswerComplete = async () => {
    setIsAnswering(false)
    setIsLoading(true)
    if (!session?.id) {
      setIsLoading(false)
      toast({
        title: "Error",
        description: "No active session found. Please restart the interview.",
        variant: "destructive",
      })
      return;
    }
    
    stopRecording()
    
    // Wait for the final chunk to be added
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      setAnswers((prev) => [...prev, transcript])
      
      if (chunksRef.current.length === 0) {
        throw new Error("No recording data available")
      }
      
      const videoBlob = new Blob(chunksRef.current, { type: "video/webm" })
      chunksRef.current = [] // Clear the chunks for the next recording
      console.log(currentQuestion)
      const analysis = await getFeedback(videoBlob, currentQuestion, transcript, session?.id);
      setAnalyses((prev) => [...prev, analysis])
      setCurrentAnalysis(analysis)

      await generateNextQuestion(session)
      setIsLoading(false)
    } catch (error) {
      console.error("Error completing answer:", error)
      toast({
        title: "Error",
        description: "Failed to process your answer. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const speakQuestion = (text) => {
    if (typeof window === "undefined") return
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.volume = isMuted ? 0 : volume / 100
      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.onend = () => {
        console.log("Speech synthesis completed")
        
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
      }

      // Get available voices
      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          switch (selectedVoice) {
            case "male":
              const maleVoice = voices.find((voice) => voice.name.includes("Male")) 
              if (maleVoice) utterance.voice = maleVoice
              break
            case "female":
              const femaleVoice = voices.find((voice) => voice.name.includes("Female"))
              if (femaleVoice) utterance.voice = femaleVoice
              break
            case "robotic":
              utterance.pitch = 0.5
              utterance.rate = 0.8
              break
            default:
              // Use default voice
          }
          window.speechSynthesis.speak(utterance)
          const resumeSpeaking = () => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause()
              window.speechSynthesis.resume()
              speechTimeoutRef.current = setTimeout(resumeSpeaking, 10000)
            } else {
              clearTimeout(speechTimeoutRef.current)
            }
          }

          speechTimeoutRef.current = setTimeout(resumeSpeaking, 10000)
        } else {
          console.warn("No voices found. Using default voice.")
          window.speechSynthesis.speak(utterance)
        }
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        getVoices()
      } else {
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = getVoices
      }
    } else {
      console.warn("Speech synthesis not supported in this browser.")
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      if (!isMuted) {
        // If we're unmuting, speak the question again
        if (currentQuestion) {
          speakQuestion(currentQuestion.questionText)
        }
      }
    }
  }

  const retryCurrentQuestion = () => {
    setIsAnswering(false)
    setTranscript("")
    setDisplayedTranscript("")
    setProgress(0)
    stopRecording()
    // startRecording()
    
    if (currentQuestion) {
      speakQuestion(currentQuestion.questionText)
    }
  }
  const answerCurrentQuestion = () => {
    setTranscript("")
    setDisplayedTranscript("")
    // stopRecording()
    startRecording()
    const recognitionStarted = setupSpeechRecognition()
        if (!recognitionStarted) return;
    try {
          recognitionRef.current?.start()
          setIsAnswering(true)
        } catch (error) {
          console.error("Error starting speech recognition:", error)
        }
    
  }

  const completeInterview = async () => {
    setIsInterviewComplete(true)
    const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/end-session/${session.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject).getTracks().forEach((track) => track.stop())
    }
    
    try {
      recognitionRef.current?.stop()
    } catch (error) {
      console.error("Error stopping speech recognition:", error)
    }
    
    stopRecording()
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    toast({
      title: "Interview Complete",
      description: "Great job! Your interview has been completed successfully.",
    })
  }

  const cancelInterview = async () => {
    setIsInterviewComplete(true)
    const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/cancel-session/${session.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject).getTracks().forEach((track) => track.stop())
    }
    
    try {
      recognitionRef.current?.stop()
    } catch (error) {
      console.error("Error stopping speech recognition:", error)
    }
    
    stopRecording()
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    toast({
      title: "Interview Cancelled",
      description: " Your interview has been cancelled.",
    })
  }
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = (videoRef.current.srcObject).getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
      }
    }
  }
  
  const getDifficultyColor = (difficulty) => {
    const colors = {
      EASY: "bg-green-100 text-green-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HARD: "bg-red-100 text-red-800",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
  };

  const totalQuestions = questions.length;
  const averageScore =
    totalQuestions > 0
      ? analyses.map((a) => a?.confidenceScore || 0).reduce((a, b) => a + b, 0) / totalQuestions
      : 0;

  const Tutorial = () => (
    <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to AI Interview Simulator</DialogTitle>
          <DialogDescription>
            This tutorial will guide you through the main features of the interview simulator.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p>1. Click "Start Interview" to begin the simulation.</p>
          <p>2. Answer the questions naturally - your voice and video will be recorded.</p>
          <p>3. Use the controls to pause, resume, or end the interview at any time.</p>
          <p>4. Adjust settings like voice type and question duration in the Settings tab.</p>
          <p>5. Review your performance and AI feedback after each question.</p>
        </div>
        <Button onClick={() => setShowTutorial(false)}>Got it!</Button>
      </DialogContent>
    </Dialog>
  )

  if (isInterviewComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>Duration: {formatTime(interviewTimer)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span>Questions: {totalQuestions}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Tag className="w-5 h-5" />
              <span>Avg. Score: {averageScore.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Question {index + 1}</CardTitle>
                    <CardDescription className="mt-2 text-base text-gray-700">
                      <ReactMarkdown>{question?.questionText}</ReactMarkdown>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getDifficultyColor(question?.difficulty)}`}>{question?.difficulty}</Badge>
                    <Badge variant="outline">{question?.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Your Answer</h3>
                  <p className="text-gray-700">{answers[index] || "No answer provided"}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Expected Answer</h3>
                  <div className="text-gray-700">
                    <ReactMarkdown>{question?.expectedAnswer}</ReactMarkdown>
                  </div>
                </div>
                {analyses[index] && (
                  <div className="mt-6">
                    <FeedbackDisplay analysis={analyses[index]} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Section */}
        <div className="flex justify-center pt-6">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" aria-label="Return to Dashboard" asChild>
            <a href="/dashboard">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="m-6 mb-1">
        
            <strong className="text-xl ">AI Interview Simulator</strong>
            <div>Practice your interview skills with our AI-powered simulator</div>
          
      </div>
    
    <div className="flex  flex-col lg:flex-row">
      <div className="flex-1 p-4 overflow-y-auto max-w-[1000px]">
        <Tutorial />
        <Card className="pt-6 ">
          
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black rounded-lg mb-4"
                muted
                playsInline
                aria-label="Interview video"
              />
              <div id="subtitle" className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 p-2">
                {displayedTranscript}
              </div>
              <div className="absolute top-4 right-4 w-1/4 h-1/4 bg-white rounded-full overflow-hidden">
                <AnimatedInterviewer className="w-full h-full" />
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium">Interview Time: {formatTime(interviewTimer)}</p>
              <Progress value={progress} className="w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {!isInterviewStarted ? (
                <Button onClick={startInterview} className="col-span-2" aria-label="Start Interview">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Interview
                </Button>
              ) : isPaused ? (
                <Button onClick={resumeInterview} className="col-span-2" aria-label="Resume Interview">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <>
                  <Button onClick={pauseInterview} variant="secondary" aria-label="Pause Interview">
                    <PauseCircle className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                  <Button onClick={completeInterview} variant="destructive" aria-label="End Interview">
                    <StopCircle className="mr-2 h-4 w-4" />
                    End Interview
                  </Button>
                </>
              )}
            </div>
            <div className="flex justify-between items-center flex-wrap space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={retryCurrentQuestion} disabled={!isInterviewStarted || isPaused || isLoading} variant="outline" aria-label="Retry Current Question">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Retry the current question</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={answerCurrentQuestion} disabled={!isInterviewStarted || isPaused || isLoading||isAnswering}  aria-label="Answer Current Question">
                      
                      {isAnswering ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MicVocal className="mr-2 h-4 w-4" />
                      )}
                      Answer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Answer the current question</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleAnswerComplete} disabled={!isInterviewStarted || isPaused || isLoading} aria-label="Next Question">
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SkipForward className="mr-2 h-4 w-4" />
                      )}
                      Next
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move to the next question</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={toggleVideo} variant="outline" aria-label="Toggle Video">
                      {isVideoEnabled ? <Camera className="mr-2 h-4 w-4" /> : <CameraOff className="mr-2 h-4 w-4" />}
                      {isVideoEnabled ? "Disable" : "Enable"} Video
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle video recording</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleMute} aria-label="Toggle Mute">
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mute/Unmute audio</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="xl:w-[500px] p-4   ">
        <Tabs defaultValue="current-question" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current-question">
              <AlertCircle className="mr-2 h-4 w-4" />
              Question
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <HelpCircle className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current-question">
            {currentQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Question:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactMarkdown>{currentQuestion.questionText}</ReactMarkdown>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="feedback">
            <FeedbackDisplay analysis={currentAnalysis} />
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Interview Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="auto-next">Auto Next Question</Label>
                  <Switch id="auto-next" checked={isAutoNext} onCheckedChange={setIsAutoNext} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question-duration">Question Duration (seconds)</Label>
                  <Slider
                    id="question-duration"
                    min={10}
                    max={120}
                    step={10}
                    value={[questionDuration]}
                    onValueChange={(value) => setQuestionDuration(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">{questionDuration} seconds</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume">Voice Volume</Label>
                  <Slider
                    id="volume"
                    min={0}
                    max={100}
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">{volume}%</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Voice Selection</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger id="voice-select">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voicesList.map((voice) => (
                        <SelectItem key={voice.value} value={voice.value}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </div>

  )
}
