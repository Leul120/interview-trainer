"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Icons } from "@/components/ui/icons"
// import { Steps } from "@/components/Steps"
import UserInfoForm from "@/components/UserInfoForm"
import InterviewPreferences from "@/components/InterviewPreferences"
import SkillAssessment from "@/components/SkillAssessment"
import Steps from "@/components/Steps"
import axios from "axios"
const steps = [
  { title: "Personal Info", description: "Provide your basic information" },
  { title: "Interview Preferences", description: "Select your interview types" },
  { title: "Skill Assessment", description: "Assess your current skill level" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to InterviewPro</CardTitle>
          <CardDescription>Let&apos;s set up your profile to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Steps currentStep={currentStep} steps={steps} />
          <div className="mt-8">
            {currentStep === 0 && <UserInfoForm />}
            {currentStep === 1 && <InterviewPreferences />}
            {currentStep === 2 && <SkillAssessment />}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleBack} disabled={currentStep === 0} variant="outline">
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              <>
                Finish
                {/* <Icons.chevronRight className="ml-2 h-4 w-4" /> */}
              </>
            ) : (
              <>
                Next
                {/* <Icons.chevronRight className="ml-2 h-4 w-4" /> */}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

