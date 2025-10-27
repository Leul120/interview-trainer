'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UserInfoForm() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="job-title">Current Job Title</Label>
        <Input id="job-title" placeholder="Software Engineer" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Input id="experience" type="number" placeholder="5" />
      </div>
    </div>
  )
}

