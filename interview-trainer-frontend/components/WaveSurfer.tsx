"use client"
import { useEffect, useRef, useState } from "react"
import type WaveSurfer from "wavesurfer.js"

interface WaveSurferProps {
  audioUrl?: string
}

export function WaveSurfer({ audioUrl }: WaveSurferProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (waveformRef.current && typeof window !== "undefined") {
      if (WaveSurfer.create) {
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "violet",
          progressColor: "purple",
          cursorColor: "navy",
          barWidth: 3,
          barRadius: 3,
          cursorWidth: 1,
          height: 80,
          barGap: 3,
        })

        if (audioUrl) {
          wavesurfer.current.load(audioUrl)
        }

        wavesurfer.current.on("finish", () => setIsPlaying(false))
      } else {
        console.error("WaveSurfer.create is not available")
      }
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy()
      }
    }
  }, [audioUrl])

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.pause()
      } else {
        wavesurfer.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="w-full">
      <div ref={waveformRef} />
      <button
        onClick={handlePlayPause}
        className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  )
}

