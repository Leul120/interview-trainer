"use client"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import { Eye, Brain, MessageCircle, ArrowRight, Zap, Target, Lightbulb } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

interface AiAnalysis {
  id: string
  questionId: string
  usersAnswer: string
  emotionAnalysis: string
  speechAnalysis: string
  eyeContactScore: number
  confidenceScore: number
  overallPerformanceScore: number
  aiFeedback: string
  nextSteps: string
}

interface FeedbackDisplayProps {
  analysis: AiAnalysis | null
}

const ScoreGauge = ({
  score,
  label,
  icon,
  color,
  bgColor,
  borderColor,
}: {
  score: number
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}) => {
  // Calculate percentage for the progress bar
  const percentage = Math.min(Math.max(score * 10, 0), 100)

  return (
    <Card className={`${bgColor} border ${borderColor} shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium text-gray-200">{label}</h3>
          </div>
          <Badge className={`${color} ${bgColor} border ${borderColor} px-2 py-1`}>{score.toFixed(1)}/10</Badge>
        </div>
        <Progress value={percentage} className="h-2 bg-gray-800" indicatorClassName={color.replace("text-", "bg-")} />
      </CardContent>
    </Card>
  )
}

export function FeedbackDisplay({ analysis }: FeedbackDisplayProps) {
  if (!analysis) return null

  return (
    <div className="bg-gray-900/70 rounded-xl border border-gray-800/50 shadow-xl overflow-hidden backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-400" />
          <span>Performance Analysis</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ScoreGauge
            score={analysis.eyeContactScore}
            label="Eye Contact"
            icon={<Eye className="w-5 h-5 text-cyan-400" />}
            color="text-cyan-400"
            bgColor="bg-cyan-950/30"
            borderColor="border-cyan-900/50"
          />
          <ScoreGauge
            score={analysis.confidenceScore}
            label="Confidence"
            icon={<Target className="w-5 h-5 text-purple-400" />}
            color="text-purple-400"
            bgColor="bg-purple-950/30"
            borderColor="border-purple-900/50"
          />
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <FeedbackSection
              icon={<Lightbulb className="w-5 h-5" />}
              title="AI Feedback"
              content={analysis.aiFeedback}
              className="bg-indigo-950/30 border-indigo-900/50 text-indigo-300"
              iconColor="text-indigo-400"
            />

            <FeedbackSection
              icon={<Brain className="w-5 h-5" />}
              title="Emotion Analysis"
              content={analysis.emotionAnalysis}
              className="bg-purple-950/30 border-purple-900/50 text-purple-300"
              iconColor="text-purple-400"
            />

            <FeedbackSection
              icon={<MessageCircle className="w-5 h-5" />}
              title="Speech Analysis"
              content={analysis.speechAnalysis}
              className="bg-blue-950/30 border-blue-900/50 text-blue-300"
              iconColor="text-blue-400"
            />

            <div className="border border-emerald-900/50 rounded-xl p-6 bg-emerald-950/30">
              <h3 className="text-lg font-semibold text-emerald-300 flex items-center gap-2 mb-4">
                <ArrowRight className="w-5 h-5 text-emerald-400" />
                Next Steps
              </h3>
              <div className="text-gray-300 prose prose-sm max-w-none prose-headings:text-emerald-400 prose-a:text-emerald-400">
                <ReactMarkdown>{analysis.nextSteps}</ReactMarkdown>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

const FeedbackSection = ({
  icon,
  title,
  content,
  className,
  iconColor,
}: {
  icon: React.ReactNode
  title: string
  content: string
  className?: string
  iconColor: string
}) => (
  <div className={`border rounded-xl p-6 ${className}`}>
    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
      <span className={iconColor}>{icon}</span>
      {title}
    </h3>
    <div className="prose prose-sm max-w-none prose-p:text-gray-300 prose-li:text-gray-300 prose-headings:text-gray-200 prose-strong:text-white">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  </div>
)

