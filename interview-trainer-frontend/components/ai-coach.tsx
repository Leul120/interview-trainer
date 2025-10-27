"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare } from "lucide-react"

export function AICoach() {
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulated AI response - in a real app, you'd call an API here
    setResponse(
      "Here's a tip: When answering behavioral questions, use the STAR method - Situation, Task, Action, Result. This structure helps you provide clear and concise answers.",
    )
    setQuestion("")
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Ask for interview advice..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button type="submit">Ask</Button>
      </form>
      {response && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-5 w-5 text-primary mt-1" />
            <p className="text-sm">{response}</p>
          </div>
        </div>
      )}
    </div>
  )
}

