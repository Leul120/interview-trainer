'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const interviewTypes = [
  { id: "coding", label: "Coding Interviews" },
  { id: "behavioral", label: "Behavioral Interviews" },
  { id: "system-design", label: "System Design Interviews" },
  { id: "case-study", label: "Case Study Interviews" },
]

export default function InterviewPreferences() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Select the types of interviews you&apos;re interested in:</p>
      {interviewTypes.map((type) => (
        <div key={type.id} className="flex items-center space-x-2">
          <Checkbox id={type.id} />
          <Label htmlFor={type.id}>{type.label}</Label>
        </div>
      ))}
    </div>
  )
}

