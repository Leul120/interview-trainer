"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X, Check, Eye, EyeOff } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { PlusCircle, GripVertical, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { z } from "zod"
import Link from "next/link"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Other",
]

const expertiseAreas = [
  "Java",
  "Python",
  "JavaScript",
  "System Design",
  "Data Structures",
  "Algorithms",
  "Behavioral",
  "Frontend",
  "Backend",
  "DevOps",
  "Machine Learning",
  "Cloud Computing",
]

const awardCategories = [
  "Technical Excellence",
  "Leadership",
  "Innovation",
  "Mentorship",
  "Industry Recognition",
  "Teaching Excellence",
  "Research & Publications",
  "Community Contribution",
  "Professional Certification",
  "Other",
]

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  industry: z.string().min(1, "Please select an industry"),
  biography: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  experiences: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(2, "Title is required"),
        description: z.string().optional(),
        startedAt: z.date(),
        endedAt: z.date().optional(),
        current: z.boolean().default(false),
      }),
    )
    .optional(),
  awards: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(2, "Title is required"),
        year: z.string().regex(/^\d{4}$/, "Invalid year"),
        category: z.string().min(1, "Category is required"),
        description: z.string().optional(),
      }),
    )
    .optional(),
})

export default function RegistrationPage() {
  const [userType, setUserType] = useState("INTERVIEWEE")
  const [isLoading, setIsLoading] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [selectedExpertise, setSelectedExpertise] = useState([])
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [awards, setAwards] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [experiences, setExperiences] = useState([])
  const { toast } = useToast()
  const router = useRouter()

  const { register, handleSubmit, control, formState: { errors, isValid }, watch } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      industry: "",
      biography: "",
      acceptTerms: false,
      experiences: [],
      awards: [],
    },
  })

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post("https://apigateway-25az.onrender.com/api/v1/auth/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Uploaded URL:", response.data)
      setProfilePicture(response.data)
    } catch (error) {
      console.error("Upload Error:", error)
      toast({
        title: "Error",
        description: "There was a problem uploading your profile picture.",
        variant: "destructive",
      })
    }
  }

  const handleExpertiseToggle = (expertise) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise) ? prev.filter((e) => e !== expertise) : [...prev, expertise],
    )
  }

  const addAward = () => {
    setAwards([
      ...awards,
      {
        id: crypto.randomUUID(),
        title: "",
        year: new Date().getFullYear().toString(),
        category: "",
        description: "",
      },
    ])
  }

  const removeAward = (id) => {
    setAwards(awards.filter((award) => award.id !== id))
  }

  const updateAward = (id, field, value) => {
    setAwards(awards.map((award) => (award.id === id ? { ...award, [field]: value } : award)))
  }

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        startedAt: new Date(),
        current: false,
      },
    ])
  }

  const removeExperience = (id) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  const updateExperience = (id, field, value) => {
    setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(awards)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setAwards(items)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)

    if (!data.acceptTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const newData = {
        ...data,
        type: userType,
        profilePicture,
        expertise: selectedExpertise,
        experiences: userType === "INTERVIEWER" ? experiences : undefined,
        awards: userType === "INTERVIEWER" ? awards : undefined,
      }
      console.log(newData)
      const response = await axios.post(`https://apigateway-25az.onrender.com/api/v1/auth/signup`, newData)
      console.log(response.data)
      if(window!=="undefined"){
      localStorage.setItem("token", response.data.token)
      }
      toast({
        title: "Account created successfully",
        description: "Welcome to InterviewPro! Redirecting to dashboard...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "There was a problem creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Join our platform as an interviewer or interviewee</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={setUserType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="INTERVIEWEE">Interviewee</TabsTrigger>
              <TabsTrigger value="INTERVIEWER">Interviewer</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profilePicture} />
                  <AvatarFallback>{watch("name")?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profile-picture"
                    onChange={handleProfilePictureChange}
                  />
                  <Label
                    htmlFor="profile-picture"
                    className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Profile Picture
                  </Label>
                  {profilePicture && (
                    <Button variant="ghost" size="icon" onClick={() => setProfilePicture(null)} className="h-8 w-8">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Controller
                    name="industry"
                    control={control}
                    rules={{ required: "Industry is required" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.industry && <p className="text-sm text-destructive">{errors.industry.message}</p>}
                </div>
              </div>

              {userType === "INTERVIEWER" && (
                <>
                  <div className="space-y-2">
                    <Label>Areas of Expertise</Label>
                    <div className="flex flex-wrap gap-2">
                      {expertiseAreas.map((expertise) => (
                        <Badge
                          key={expertise}
                          variant={selectedExpertise.includes(expertise) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleExpertiseToggle(expertise)}
                        >
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biography">Professional Biography</Label>
                    <Textarea
                      id="biography"
                      {...register("biography", { required: "Biography is required" })}
                      placeholder="Tell us about your professional experience and interview expertise..."
                      className="min-h-[100px]"
                    />
                    {errors.biography && <p className="text-sm text-destructive">{errors.biography.message}</p>}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Professional Experience</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExperience}
                        className="flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Experience
                      </Button>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="experiences">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            <AnimatePresence>
                              {experiences.map((experience, index) => (
                                <Draggable key={experience.id} draggableId={experience.id} index={index}>
                                  {(provided) => (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <Card>
                                        <CardContent className="p-4">
                                          <div className="flex items-start gap-4">
                                            <div
                                              {...provided.dragHandleProps}
                                              className="mt-4 cursor-grab active:cursor-grabbing"
                                            >
                                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                                            </div>

                                            <div className="flex-1 space-y-4">
                                              <div className="space-y-2">
                                                <Label>Job Title</Label>
                                                <Input
                                                  value={experience.title}
                                                  onChange={(e) =>
                                                    updateExperience(experience.id, "title", e.target.value)
                                                  }
                                                  placeholder="e.g., Senior Software Engineer"
                                                />
                                              </div>

                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  <Label>Start Date</Label>
                                                  <Input
                                                    type="date"
                                                    value={experience.startedAt.toISOString().split('T')[0]}
                                                    onChange={(e) =>
                                                      updateExperience(experience.id, "startedAt", new Date(e.target.value))
                                                    }
                                                  />
                                                </div>

                                                {!experience.current && (
                                                  <div className="space-y-2">
                                                    <Label>End Date</Label>
                                                    <Input
                                                      type="date"
                                                      value={experience.endedAt ? experience.endedAt.toISOString().split('T')[0] : ""}
                                                      onChange={(e) =>
                                                        updateExperience(experience.id, "endedAt", new Date(e.target.value))
                                                      }
                                                    />
                                                  </div>
                                                )}
                                              </div>

                                              <div className="flex items-center space-x-2">
                                                <input
                                                  type="checkbox"
                                                  id={`current-${experience.id}`}
                                                  checked={experience.current}
                                                  onChange={(e) => {
                                                    updateExperience(experience.id, "current", e.target.checked)
                                                    if (e.target.checked) {
                                                      updateExperience(experience.id, "endedAt", undefined)
                                                    }
                                                  }}
                                                />
                                                <label
                                                  htmlFor={`current-${experience.id}`}
                                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                  This is my current position
                                                </label>
                                              </div>

                                              <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                  value={experience.description}
                                                  onChange={(e) =>
                                                    updateExperience(experience.id, "description", e.target.value)
                                                  }
                                                  placeholder="Describe your responsibilities and achievements..."
                                                  className="h-20"
                                                />
                                              </div>
                                            </div>

                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="mt-4"
                                              onClick={() => removeExperience(experience.id)}
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </AnimatePresence>
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {experiences.length === 0 && (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                          <Trophy className="w-12 h-12 text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground font-medium mb-2">No experience added yet</p>
                          <p className="text-sm text-muted-foreground/60 mb-4">
                            Add your professional experience to showcase your expertise
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addExperience}
                            className="flex items-center gap-2"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Add Your First Experience
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Awards & Achievements</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAward}
                        className="flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Award
                      </Button>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="awards">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            <AnimatePresence>
                              {awards.map((award, index) => (
                                <Draggable key={award.id} draggableId={award.id} index={index}>
                                  {(provided) => (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <Card>
                                        <CardContent className="p-4">
                                          <div className="flex items-start gap-4">
                                            <div
                                              {...provided.dragHandleProps}
                                              className="mt-4 cursor-grab active:cursor-grabbing"
                                            >
                                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                                            </div>

                                            <div className="flex-1 space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  <Label>Award Title</Label>
                                                  <Input
                                                    value={award.title}
                                                    onChange={(e) => updateAward(award.id, "title", e.target.value)}
                                                    placeholder="e.g., Best Technical Interviewer"
                                                  />
                                                </div>

                                                <div className="space-y-2">
                                                  <Label>Year</Label>
                                                  <Input
                                                    value={award.year}
                                                    onChange={(e) => updateAward(award.id, "year", e.target.value)}
                                                    placeholder="YYYY"
                                                    maxLength={4}
                                                  />
                                                </div>
                                              </div>

                                              <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select
                                                  value={award.category}
                                                  onValueChange={(value) => updateAward(award.id, "category", value)}
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {awardCategories.map((category) => (
                                                      <SelectItem key={category} value={category}>
                                                        {category}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>

                                              <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                  value={award.description}
                                                  onChange={(e) => updateAward(award.id, "description", e.target.value)}
                                                  placeholder="Brief description of the award and its significance..."
                                                  className="h-20"
                                                />
                                              </div>
                                            </div>

                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="mt-4"
                                              onClick={() => removeAward(award.id)}
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </AnimatePresence>
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {awards.length === 0 && (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                          <Trophy className="w-12 h-12 text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground font-medium mb-2">No awards added yet</p>
                          <p className="text-sm text-muted-foreground/60 mb-4">
                            Showcase your achievements by adding professional awards and certifications
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addAward}
                            className="flex items-center gap-2"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Add Your First Award
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...register("acceptTerms", { required: "You must accept the terms and conditions" })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="acceptTerms">
                    I accept the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      terms and conditions
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>}
              </div>

              <AnimatePresence>
                {registrationSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                        Registration successful! Please check your email for verification.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}