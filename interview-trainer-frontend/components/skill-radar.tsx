'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

const skillData = [
  { subject: "Algorithms", A: 120, fullMark: 150 },
  { subject: "System Design", A: 98, fullMark: 150 },
  { subject: "Database", A: 86, fullMark: 150 },
  { subject: "Web Dev", A: 99, fullMark: 150 },
  { subject: "Soft Skills", A: 85, fullMark: 150 },
  { subject: "Problem Solving", A: 65, fullMark: 150 },
]

export function SkillRadar() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 150]} />
        <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

