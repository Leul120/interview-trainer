"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function NotesPanel() {
  const [notes, setNotes] = useState("")

  // Auto-save notes to localStorage
  useEffect(() => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null

    const savedNotes = typeof window !=="undefined" ? localStorage.getItem("interview-notes"):null
    if (savedNotes) {
      setNotes(savedNotes)
    }
  }, [])

  const handleNotesChange = (value: string) => {
    setNotes(value)
     if (typeof window !== "undefined") {
      localStorage.setItem("interview-notes", value);
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Interview Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Take notes during the interview..."
          className="h-[calc(100vh-200px)] resize-none"
        />
      </CardContent>
    </Card>
  )
}

