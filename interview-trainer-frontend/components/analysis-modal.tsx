"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AiAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  userId: string
}

export function AiAnalysisModal({ isOpen, onClose, sessionId, userId,analyzer }: AiAnalysisModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysis, setAnalysis] = useState({
    emotionAnalysis: "",
    speechAnalysis: "",
    eyeContactScore: 5,
    confidenceScore: 5,
    overallPerformanceScore: 5,
    aiFeedback: "",
    nextSteps: "",
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      await axios.post(
        "https://apigateway-25az.onrender.com/api/v1/processing/give-analysis",
        {
          sessionId,
          userId,
          analyzer,
          ...analysis,
          processedAt: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast({
        title: "Analysis submitted",
        description: "The interview analysis has been saved successfully.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Failed to submit analysis",
        description: "There was an error saving the interview analysis.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Analysis</DialogTitle>
          <DialogDescription>Please provide your analysis of the interviewee's performance.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="emotionAnalysis">Emotion Analysis</Label>
            <Textarea
              id="emotionAnalysis"
              placeholder="Describe the candidate's emotional state and expressions during the interview..."
              value={analysis.emotionAnalysis}
              onChange={(e) => setAnalysis((prev) => ({ ...prev, emotionAnalysis: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="speechAnalysis">Speech Analysis</Label>
            <Textarea
              id="speechAnalysis"
              placeholder="Analyze the candidate's speech patterns, clarity, and communication style..."
              value={analysis.speechAnalysis}
              onChange={(e) => setAnalysis((prev) => ({ ...prev, speechAnalysis: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Eye Contact Score (1-10)</Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[analysis.eyeContactScore]}
                onValueChange={(value) => setAnalysis((prev) => ({ ...prev, eyeContactScore: value[0] }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Confidence Score (1-10)</Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[analysis.confidenceScore]}
                onValueChange={(value) => setAnalysis((prev) => ({ ...prev, confidenceScore: value[0] }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Overall Performance Score (1-10)</Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[analysis.overallPerformanceScore]}
                onValueChange={(value) => setAnalysis((prev) => ({ ...prev, overallPerformanceScore: value[0] }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="aiFeedback">AI Feedback</Label>
            <Textarea
              id="aiFeedback"
              placeholder="Provide AI-generated feedback on the interview performance..."
              value={analysis.aiFeedback}
              onChange={(e) => setAnalysis((prev) => ({ ...prev, aiFeedback: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nextSteps">Next Steps & Recommendations</Label>
            <Textarea
              id="nextSteps"
              placeholder="Suggest next steps and areas for improvement..."
              value={analysis.nextSteps}
              onChange={(e) => setAnalysis((prev) => ({ ...prev, nextSteps: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Analysis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

