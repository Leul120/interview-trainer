"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import type { UserType } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import axios from "axios"

// This would be fetched from your API
// const mockUser = {
//   name: "Jane Doe",
//   email: "jane.doe@example.com",
//   type: "INTERVIEWER" as UserType,
//   biography:
//     "Experienced tech interviewer with 10+ years in the industry. Specialized in helping candidates prepare for technical interviews at top tech companies.",
//   industry: "Technology",
//   expertise: ["JavaScript", "React", "System Design", "Behavioral"],
//   availabilityStatus: "AVAILABLE",
//   isEmailVerified: true,
//   isAccountLocked: false,
// }

// Available options for dropdowns
const industries = [
  { label: "Technology", value: "Technology" },
  { label: "Finance", value: "Finance" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Education", value: "Education" },
  { label: "Retail", value: "Retail" },
]

const expertiseOptions = [
  { label: "JavaScript", value: "JavaScript" },
  { label: "React", value: "React" },
  { label: "Angular", value: "Angular" },
  { label: "Vue", value: "Vue" },
  { label: "Node.js", value: "Node.js" },
  { label: "Python", value: "Python" },
  { label: "Java", value: "Java" },
  { label: "System Design", value: "System Design" },
  { label: "Behavioral", value: "Behavioral" },
  { label: "Data Structures", value: "Data Structures" },
  { label: "Algorithms", value: "Algorithms" },
]

const availabilityStatuses = [
  { label: "Available", value: "AVAILABLE" },
  { label: "Unavailable", value: "UNAVAILABLE" },
  { label: "Busy", value: "BUSY" },
]

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  biography: z
    .string()
    .max(2000, {
      message: "Biography must not exceed 2000 characters.",
    })
    .optional(),
  industry: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  availabilityStatus: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
  isAccountLocked: z.boolean().optional(),
})

export function ProfileForm({user}) {
  const isInterviewer = user.type === "INTERVIEWER"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState<string | null>(null); // Add token state
  
    // Get token after component mounts on the client
    useEffect(() => {
      setToken(localStorage.getItem("token"));  
    }, [token]);  
//   const expertiseString =user?.expertise;
// const user.expertise = expertiseString?.replace(/[\[\]]/g, "").split(", ").map(item => item.trim());

  // Initialize form with user data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      biography: user.biography,
      industry: user.industry,
      expertise: user.expertise,
      availabilityStatus: user.availabilityStatus,
      isEmailVerified: user.isEmailVerified,
      isAccountLocked: user.isAccountLocked,
    },
  })

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)
    try{
    const response=await axios.post(`https://apigateway-25az.onrender.com/api/v1/user/update-user/${user.id}`,values,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    console.log(response.data)
    
      setIsSubmitting(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    }catch(error){
      setIsSubmitting(false)
      console.log(error)
      toast({
        title: "Error updating a profile",
        variant:"destructive",
        description: "error",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Basic Information</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
        </div>

        {isInterviewer && (
          <>
            <Separator />

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Interviewer Details</h2>
              <FormField
            control={form.control}
            name="biography"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biography</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="min-h-[120px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Maximum 2000 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries?.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Areas of Expertise</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={expertiseOptions}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select your areas of expertise"
                      />
                    </FormControl>
                    <FormDescription>Select all areas where you have expertise</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availabilityStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availabilityStatuses?.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>This will be visible to potential interviewees</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

