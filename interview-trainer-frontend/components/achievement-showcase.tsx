"use client"

import { motion } from "framer-motion"

export function AchievementShowcase({ badges }) {
  return (
    <div className="flex flex-wrap gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 260, damping: 20 }}
          className="flex flex-col items-center p-2 rounded-lg bg-muted"
        >
          <div className={`p-3 rounded-full ${badge.color} text-primary-foreground mb-2`}>
            <badge.icon className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium text-center">{badge.name}</span>
        </motion.div>
      ))}
    </div>
  )
}

