'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCode } from "@/services/codeFormatter"
import type { Question } from "@/services/api"

interface CurrentQuestionProps {
  currentQuestion: Question | null
}

export function CurrentQuestion({ currentQuestion }: CurrentQuestionProps) {
  if (!currentQuestion) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Question:</CardTitle>
      </CardHeader>
      <CardContent>
        {currentQuestion.questionText.includes("```")
          ? currentQuestion.questionText
              .split("```")
              .map((part, i) => (i % 2 === 0 ? <span key={i}>{part}</span> : formatCode(part, "java")))
          : currentQuestion.questionText}
      </CardContent>
    </Card>
  )
}

