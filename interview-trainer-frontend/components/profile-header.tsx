"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserType } from "@/lib/types"
import { useEffect, useState } from "react"
import axios from "axios"


export function ProfileHeader({user}) {

  
  
  const isInterviewer = user?.type === "INTERVIEWER"
  if(!user){
    return(
        <div className="text-center">User not found!</div>
    )
  }
//   const expertiseString =user?.expertise;
// const user.expertise = expertiseString?.replace(/[\[\]]/g, "").split(", ").map(item => item.trim());

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            Change Photo
          </Button>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={user.online ? "default" : "outline"} className="capitalize">
              {user.online ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <Badge variant="outline" className="capitalize">
                {user.type}
              </Badge>
              {user.role === "ADMIN" && <Badge variant="secondary">Admin</Badge>}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div>
            <p className="text-sm leading-relaxed">{user.biography}</p>
          </div>

          {isInterviewer && (
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Industry:</span>
                <span className="text-sm ml-2">{user.industry}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Expertise:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.expertise?.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-sm font-medium">Rating:</span>
                  <span className="text-sm ml-2">
                    {user.averageRating}/5 ({user.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isInterviewer && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Completed" value={user.completedInterviews} description="Interviews" />
              <StatCard title="Failed" value={user.failedInterviews} description="Interviews" />
              <StatCard title="Performance" value={`${user.overallPerformanceScore||0}/100`} description="Overall Score" />
              <StatCard title="Confidence" value={`${user.confidenceScore||0}/100`} description="Score" />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function StatCard({ title, value, description }: { title: string; value: string | number; description: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

