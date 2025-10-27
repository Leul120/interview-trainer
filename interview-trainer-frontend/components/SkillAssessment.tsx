'use client'
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

const skills = [
  { id: "algorithms", label: "Algorithms & Data Structures" },
  { id: "system-design", label: "System Design" },
  { id: "communication", label: "Communication Skills" },
  { id: "problem-solving", label: "Problem Solving" },
]

export default function SkillAssessment() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Rate your current skill level in the following areas:</p>
      {skills.map((skill) => (
        <div key={skill.id} className="space-y-2">
          <Label htmlFor={skill.id}>{skill.label}</Label>
          <Slider
            id={skill.id}
            min={1}
            max={5}
            step={1}
            defaultValue={[3]}
            marks={[
              { value: 1, label: "Beginner" },
              { value: 3, label: "Intermediate" },
              { value: 5, label: "Expert" },
            ]}
          />
        </div>
      ))}
    </div>
  )
}

