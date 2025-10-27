"use client"

import { useEffect, useRef } from "react"
import Lottie from "lottie-web"
import type { AnimationItem } from "lottie-web"
import animationData from "@/public/animations/interviewer.json"

export default function AnimatedInterviewer({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize animation
    animRef.current = Lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: animationData,
    })

    // Cleanup
    return () => {
      if (animRef.current) {
        animRef.current.destroy()
        animRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} className={className} aria-label="Animated interviewer" />
}

