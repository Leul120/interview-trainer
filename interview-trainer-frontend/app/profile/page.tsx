"use client"
import { ProfileForm } from "@/components/profile-form"
import { ProfileHeader } from "@/components/profile-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ExperienceAndAwards } from "@/components/experience-awards"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppContext } from "../layout"

export default function ProfilePage() {
  const [user, setUser] = useState([])
  const {token}=useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const router=useRouter()
 

  useEffect(() => {
    if (token) {
      getUser(token)
    }else{
      router.push("/login")
    }
  }, [token])

  const getUser = async (token) => {
    setLoading(true)
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/get-user-id`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(response.data)
      setUser(response.data)
    } catch (error) {
      console.log(error)
    } finally {
      // Add a slight delay to make the transition smoother
      setTimeout(() => {
        setLoading(false)
      }, 300)
    }
  }

  return (
    <div className="container mx-auto py-10">
      {loading ? <ProfileHeaderSkeleton /> : <ProfileHeader user={user} />}

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className={`grid w-full ${!loading && user.type === "INTERVIEWER" ? "grid-cols-3" : "grid-cols-2"}`}>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {!loading && user.type === "INTERVIEWER" && <TabsTrigger value="experience">Experience & Awards</TabsTrigger>}
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="p-6">{loading ? <ProfileFormSkeleton /> : <ProfileForm user={user} />}</Card>
        </TabsContent>

        {!loading && user.type === "INTERVIEWER" && (
          <TabsContent value="experience" className="mt-6">
            <Card className="p-6">{loading ? <ExperienceSkeleton /> : <ExperienceAndAwards user={user} />}</Card>
          </TabsContent>
        )}

        <TabsContent value="settings" className="mt-6">
          <Card className="p-6">{loading ? <AccountSettingsSkeleton /> : <AccountSettings user={user} />}</Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileHeaderSkeleton() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-10 w-24 ml-auto" />
    </div>
  )
}

function ExperienceSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Skeleton className="h-8 w-48" />
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-2 border rounded-lg p-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
    </div>
  )
}

function AccountSettingsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Skeleton className="h-8 w-48" />

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="rounded-lg border p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountSettings({ user }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold">Account Settings</h2>
      <SubscriptionInfo />
      <SecuritySettings />
    </div>
  )
}

function SubscriptionInfo() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Subscription</h3>
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Current Plan: <span className="text-primary">Premium</span>
            </p>
            <p className="text-sm text-muted-foreground">Expires: December 31, 2023</p>
          </div>
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Upgrade Plan</button>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Security</h3>
      <div className="rounded-lg border p-4 space-y-4">
        <div>
          <p className="font-medium">Email Verification</p>
          <p className="text-sm text-muted-foreground">
            Status: <span className="text-green-500">Verified</span>
          </p>
        </div>
        <div>
          <p className="font-medium">Password</p>
          <button className="text-sm text-primary">Change Password</button>
        </div>
      </div>
    </div>
  )
}

