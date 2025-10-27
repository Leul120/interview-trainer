"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Brain, ArrowRight, CheckCircle2, Lock } from "lucide-react"
import axios from "axios"

const features = [
  "Resume your interview practice",
  "Track your progress and analytics",
  "Access saved interview recordings",
  "Connect with interview coaches",
]

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post('https://apigateway-25az.onrender.com/api/v1/auth/signin', {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
      })

      console.log(response.data)
      window.localStorage.setItem("token",response.data.token)

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      })

      // Simulate a brief delay before redirecting
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.log(error)
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen  flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="space-y-1">
           
        
            <CardDescription>
              Sign in to your account to continue your practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </label>
              </div>
              <Button className="w-full h-11" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className=" px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="w-full">
                <Image
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width={16}
                  height={16}
                  className="mr-2"
                />
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <Image
                  src="https://github.com/favicon.ico"
                  alt="GitHub"
                  width={16}
                  height={16}
                  className="mr-2"
                />
                GitHub
              </Button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right side - Image and features */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:16px_16px]" />
        <div className="relative w-full h-full flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Welcome Back to Your Interview Journey
              </h2>
              <p className="text-lg text-white/90">
                Continue your preparation and take your interview skills to the next level.
              </p>
            </div>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-white/90">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-12 p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&q=80"
                    alt="Success Story"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm text-white/90 italic">
                    "Interv helped me land my dream job at Google. The AI-powered practice sessions were invaluable!"
                  </p>
                  <p className="text-sm font-medium text-white mt-2">
                    Michael Chen
                    <span className="text-white/60 ml-2">Software Engineer at Google</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}