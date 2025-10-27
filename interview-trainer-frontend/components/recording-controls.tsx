"use client"

import { useState, useRef } from "react"
import { RepeatIcon as Record, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useParticipants, useLocalParticipant } from "@livekit/components-react"

interface RecordingControlsProps {
  isHost: boolean
}

export function RecordingControls({ isHost }: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startRecording = async () => {
    try {
       if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas size to HD
      canvas.width = 1280
      canvas.height = 720

      // Get all video elements
      const videoElements = document.querySelectorAll("video")
      if (videoElements.length === 0) {
        toast.error("No video streams found")
        return
      }

      // Create a media stream from the canvas
      const canvasStream = canvas.captureStream(30) // 30 FPS

      // Get all audio tracks from participants
      const audioTracks: MediaStreamTrack[] = []
      participants.forEach((participant) => {
        participant.audioTracks.forEach((track) => {
          if (track.track) {
            audioTracks.push(track.track)
          }
        })
      })

      // Add local audio if available
      if (localParticipant) {
        localParticipant.audioTracks.forEach((track) => {
          if (track.track) {
            audioTracks.push(track.track)
          }
        })
      }

      // Combine video and audio tracks
      const mediaStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks])

      // Configure MediaRecorder with more compatible options
      mediaRecorder.current = new MediaRecorder(mediaStream, {
        mimeType: "video/webm;codecs=h264",
        videoBitsPerSecond: 3000000, // 3 Mbps
      })

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `interview-recording-${new Date().toISOString()}.webm`
        a.click()
        URL.revokeObjectURL(url)
        recordedChunks.current = []
      }

      // Draw video elements to canvas
      const drawVideoElements = () => {
        if (!ctx) return
        ctx.fillStyle = "#000"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const videos = Array.from(videoElements)
        const gridCols = Math.ceil(Math.sqrt(videos.length))
        const gridRows = Math.ceil(videos.length / gridCols)
        const cellWidth = canvas.width / gridCols
        const cellHeight = canvas.height / gridRows

        videos.forEach((video, index) => {
          const row = Math.floor(index / gridCols)
          const col = index % gridCols
          const x = col * cellWidth
          const y = row * cellHeight

          ctx.drawImage(video, x, y, cellWidth, cellHeight)
        })

        if (isRecording) {
          requestAnimationFrame(drawVideoElements)
        }
      }

      mediaRecorder.current.start(1000) // Record in 1-second chunks
      drawVideoElements()
      setIsRecording(true)
      toast.success("Recording started")
    }
    } catch (error) {
      console.error("Recording error:", error)
      toast.error("Failed to start recording")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      toast.success("Recording saved")
    }
  }

  if (!isHost) return null

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          variant="outline"
          size="icon"
          onClick={startRecording}
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-500"
        >
          <Record className="h-4 w-4" />
          <span className="sr-only">Start Recording</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={stopRecording}
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-500"
        >
          <Square className="h-4 w-4" />
          <span className="sr-only">Stop Recording</span>
        </Button>
      )}
    </div>
  )
}

