"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState({
    generalFeedback: "",
    confidenceScore: 50,
    improvementSteps: "",
  })

  const handleSubmit = () => {
    // Here you could send the feedback to your backend
    console.log(feedback)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Interview Feedback</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="general-feedback">General Feedback</Label>
            <Textarea
              id="general-feedback"
              value={feedback.generalFeedback}
              onChange={(e) => setFeedback({ ...feedback, generalFeedback: e.target.value })}
              placeholder="Provide general feedback about the interview..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Confidence Score</Label>
            <Slider
              value={[feedback.confidenceScore]}
              onValueChange={(value) => setFeedback({ ...feedback, confidenceScore: value[0] })}
              max={100}
              step={1}
            />
            <div className="text-center text-sm text-muted-foreground">{feedback.confidenceScore}%</div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="improvement-steps">Steps to Improve</Label>
            <Textarea
              id="improvement-steps"
              value={feedback.improvementSteps}
              onChange={(e) => setFeedback({ ...feedback, improvementSteps: e.target.value })}
              placeholder="Suggest steps for improvement..."
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Submit Feedback</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

