'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RealTimeAnalysisProps {
  confidenceScore: number
  emotionDetection: string
}

export function RealTimeAnalysis({ confidenceScore, emotionDetection }: RealTimeAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Confidence Score:</strong> {confidenceScore.toFixed(2)}
        </p>
        <p>
          <strong>Emotion Detection:</strong> {emotionDetection}
        </p>
      </CardContent>
    </Card>
  )
}

