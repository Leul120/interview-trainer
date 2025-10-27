"use client"
import type React from "react"
import { useContext, useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { FeedbackDisplay } from "@/components/FeedbackDisplay"
import ReactMarkdown from "react-markdown"
import { AppContext } from "@/app/layout"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"

interface Analysis {
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

interface Question {
  id: string
  questionText: string
  expectedAnswer: string
  difficulty: string
  category: string
}

const InterviewAnalysisList: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const router = useRouter()
  const { sessionId } = useParams()
  const { token } = useContext(AppContext)

  // Get token after component mounts on the client
  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [router, token])

  const fetchData = async () => {
    if (!token) {
      setError("Authentication token not found.")
      setLoading(false)
      return
    }

    try {
      const [questionsRes, analysesRes] = await Promise.all([
        axios.get(`https://apigateway-25az.onrender.com/api/v1/question/get-questions-by-session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`https://apigateway-25az.onrender.com/api/v1/processing/get-analysis-by-session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setQuestions(questionsRes.data)
      setAnalyses(analysesRes.data)
    } catch (err) {
      setError("Failed to fetch interview data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [sessionId, token])

  const toggleQuestion = (questionId: string) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null)
    } else {
      setExpandedQuestion(questionId)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-900/20 text-emerald-400 border-emerald-800"
      case "medium":
        return "bg-amber-900/20 text-amber-400 border-amber-800"
      case "hard":
        return "bg-rose-900/20 text-rose-400 border-rose-800"
      default:
        return "bg-blue-900/20 text-blue-400 border-blue-800"
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
          <p className="text-indigo-300 font-medium">Loading interview analysis...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    )

  if (!questions.length)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 max-w-md">
          <p className="text-gray-400 text-center">No questions found.</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 py-10">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
            Interview Analysis
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => {
            const analysis = analyses.find((a) => a.questionId === question.id)
            const isExpanded = expandedQuestion === question.id

            return (
              <Card
                key={question.id}
                className="bg-gray-900/70 border-0 shadow-lg backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-xl"
                style={{
                  boxShadow: "0 0 20px rgba(79, 70, 229, 0.1)",
                  background: "linear-gradient(145deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.5))",
                }}
              >
                <div
                  className={`border-l-4 ${
                    analysis ? "border-l-indigo-500" : "border-l-gray-700"
                  } transition-all duration-300`}
                >
                  <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleQuestion(question.id)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-gray-100 flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900/30 text-indigo-400 text-sm">
                            {index + 1}
                          </span>
                          <span>Question {index + 1}</span>
                        </CardTitle>
                        <CardDescription className="mt-3 text-base text-gray-300">
                          <ReactMarkdown>{question.questionText}</ReactMarkdown>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <Badge className={`${getDifficultyColor(question.difficulty)} px-3 py-1 font-medium`}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-800/50 text-gray-300 border-gray-700 px-3 py-1">
                            {question.category}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-6 pt-4 transition-all duration-500">
                      <div className="bg-indigo-900/10 border border-indigo-900/30 p-5 rounded-lg">
                        <h3 className="font-semibold text-indigo-300 mb-3">Expected Answer</h3>
                        <div className="text-gray-300">
                          <ReactMarkdown>{question.expectedAnswer}</ReactMarkdown>
                        </div>
                      </div>

                      {analysis ? (
                        <div className="mt-6 space-y-6">
                          <div className="bg-gray-800/50 border border-gray-700/50 p-5 rounded-lg">
                            <h3 className="font-semibold text-blue-300 mb-3">Your Answer</h3>
                            <p className="text-gray-300">{analysis.usersAnswer || "No answer provided"}</p>
                          </div>
                          <FeedbackDisplay analysis={analysis} />
                        </div>
                      ) : (
                        <div className="bg-gray-800/30 border border-gray-700/30 p-5 rounded-lg">
                          <p className="text-gray-400">No analysis available for this question.</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default InterviewAnalysisList

