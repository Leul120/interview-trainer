"use client"

import { motion } from "framer-motion"

export function InterviewTimeline({ interviews }) {
  return (
    <div className="space-y-4">
      {interviews.map((interview, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4"
        >
          <div className="flex-shrink-0">
            <interview.icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{interview.title}</h3>
            <p className="text-sm text-muted-foreground">{new Date(interview.date).toLocaleString()}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

