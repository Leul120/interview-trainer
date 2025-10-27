'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const performanceData = [
  { name: "Technical Skills", current: 85, previous: 78 },
  { name: "Communication", current: 92, previous: 85 },
  { name: "Problem Solving", current: 88, previous: 82 },
  { name: "Behavioral", current: 90, previous: 84 },
]

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={performanceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="previous" fill="#8884d8" name="Previous" />
        <Bar dataKey="current" fill="#82ca9d" name="Current" />
      </BarChart>
    </ResponsiveContainer>
  )
}

