"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface InterviewSettingsProps {
  isAutoNext: boolean
  setIsAutoNext: (value: boolean) => void
  questionDuration: number
  setQuestionDuration: (value: number) => void
  volume: number
  setVolume: (value: number) => void
  selectedVoice: string
  setSelectedVoice: (value: string) => void
  interviewDifficulty: string
  setInterviewDifficulty: (value: string) => void
  voices: { name: string; value: string }[]
}

export function InterviewSettings({
  isAutoNext,
  setIsAutoNext,
  questionDuration,
  setQuestionDuration,
  volume,
  setVolume,
  selectedVoice,
  setSelectedVoice,
  interviewDifficulty,
  setInterviewDifficulty,
  voices,
}: InterviewSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="auto-next">Auto Next Question</Label>
          <Switch id="auto-next" checked={isAutoNext} onCheckedChange={setIsAutoNext} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="question-duration">Question Duration (seconds)</Label>
          <Slider
            id="question-duration"
            min={10}
            max={120}
            step={10}
            value={[questionDuration]}
            onValueChange={(value) => setQuestionDuration(value[0])}
          />
          <p className="text-sm text-muted-foreground">{questionDuration} seconds</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="volume">Voice Volume</Label>
          <Slider id="volume" min={0} max={100} value={[volume]} onValueChange={(value) => setVolume(value[0])} />
          <p className="text-sm text-muted-foreground">{volume}%</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice Selection</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty-select">Interview Difficulty</Label>
          <Select value={interviewDifficulty} onValueChange={setInterviewDifficulty}>
            <SelectTrigger id="difficulty-select">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

