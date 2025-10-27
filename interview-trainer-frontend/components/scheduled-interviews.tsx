'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface ScheduledInterview {
  id: string
  intervieweeId: string
  interviewerId: string
  scheduledAt: string
  duration: number // in minutes
  intervieweeName?: string
  interviewerName?: string
  intervieweeAvatar?: string
  interviewerAvatar?: string
}

interface ScheduledInterviewsProps {
  interviews: ScheduledInterview[]
  userRole: "INTERVIEWER" | "INTERVIEWEE"
}

export function ScheduledInterviews({ interviews, userRole }: ScheduledInterviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Scheduled Interviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews?.length === 0 ? (
            <p className="text-center text-muted-foreground">No scheduled interviews</p>
          ) : (
            interviews.map((interview) => (
              <Link href={`/interview/meeting/${interview.id}`}><div key={interview.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={userRole === "INTERVIEWER" ? interview.intervieweeAvatar : interview.interviewerAvatar}
                    />
                    <AvatarFallback>
                      {userRole === "INTERVIEWER"
                        ? interview.intervieweeName?.charAt(0)
                        : interview.interviewerName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {userRole === "INTERVIEWER" ? interview.intervieweeName : interview.interviewerName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                      <Clock className="h-4 w-4 ml-2" />
                      {new Date(interview.scheduledAt).toLocaleTimeString()}
                      <span className="ml-2">({interview.duration} mins)</span>
                    </div>
                  </div>
                </div>
              </div></Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

