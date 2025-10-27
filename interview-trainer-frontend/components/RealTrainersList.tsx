"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const trainers = {
  "coding-interviews": [
    { name: "Alice Johnson", specialty: "Frontend Development", avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Bob Smith", specialty: "Backend Systems", avatar: "/placeholder.svg?height=40&width=40" },
    {
      name: "Carol Williams",
      specialty: "Data Structures & Algorithms",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
  "job-interviews": [
    { name: "David Brown", specialty: "HR Professional", avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Emma Davis", specialty: "Career Coach", avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Frank Miller", specialty: "Industry Expert", avatar: "/placeholder.svg?height=40&width=40" },
  ],
  "call-center-interviews": [
    { name: "Grace Lee", specialty: "Customer Service Expert", avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Henry Wilson", specialty: "Call Center Manager", avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Ivy Chen", specialty: "Communication Skills Trainer", avatar: "/placeholder.svg?height=40&width=40" },
  ],
  "academic-interviews": [
    { name: "Jack Taylor", specialty: "Professor", avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Karen White", specialty: "Admissions Counselor", avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Liam Harris", specialty: "Research Scientist", avatar: "/placeholder.svg?height=40&width=40" },
  ],
}

export default function RealTrainersList({ interviewType }: { interviewType: string }) {
  const [selectedTrainer, setSelectedTrainer] = useState(null)

  const currentTrainers = trainers[interviewType as keyof typeof trainers]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Available Trainers</h2>
      {currentTrainers.map((trainer, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={trainer.avatar} alt={trainer.name} />
                <AvatarFallback>
                  {trainer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{trainer.name}</CardTitle>
                <CardDescription>{trainer.specialty}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" /> Book Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book a Session with {trainer.name}</DialogTitle>
                  <DialogDescription>Choose a date and time for your interview practice session.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input id="date" type="date" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedTrainer(trainer)
                    // Here you would typically make an API call to book the session
                    // For now, we'll just close the dialog
                  }}
                >
                  Confirm Booking
                </Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

