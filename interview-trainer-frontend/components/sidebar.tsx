"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Target, Calendar, BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: isOpen ? 0 : "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg"
    >
      <div className="p-4">
        <Button variant="ghost" onClick={toggleSidebar} className="mb-4">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <nav className="space-y-2">
          <Link href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
            <Target className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </Link>
          <Link href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
            <BookOpen className="h-4 w-4" />
            <span>Resources</span>
          </Link>
          <Link href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </motion.div>
  )
}

