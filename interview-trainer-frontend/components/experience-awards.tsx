"use client"

import { useState } from "react"
import { AwardModal } from "./award-modal"
import { ExperienceModal } from "./experience-modal"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data for awards and experiences
// const initialAwards = [
//   {
//     id: "1",
//     title: "AWS Certified Solutions Architect",
//     year: "2022",
//     category: "Certification",
//     description: "Professional certification for designing distributed systems on AWS",
//   },
//   {
//     id: "2",
//     title: "Best Team Player Award",
//     year: "2021",
//     category: "Recognition",
//     description: "Awarded for exceptional collaboration and support of team members",
//   },
// ]

// const initialExperiences = [
//   {
//     id: "1",
//     title: "Senior Software Engineer",
//     description:
//       "Led development of key features and mentored junior developers. Implemented CI/CD pipelines and improved code quality.",
//     startedAt: new Date(2020, 0, 15),
//     current: true,
//   },
//   {
//     id: "2",
//     title: "Software Developer",
//     description:
//       "Developed and maintained web applications using React and Node.js. Collaborated with design team to implement UI/UX improvements.",
//     startedAt: new Date(2018, 3, 10),
//     endedAt: new Date(2019, 11, 31),
//     current: false,
//   },
// ]

export function ExperienceAndAwards({user}) {
  const [awards, setAwards] = useState(user.awards)
  const [experiences, setExperiences] = useState(user.experiences)

  const handleAwardAdded = (award: any) => {
    const newAward = {
      id: crypto.randomUUID(),
      ...award,
    }
    setAwards([...awards, newAward])
  }

  const handleExperienceAdded = (experience: any) => {
    const newExperience = {
      id: crypto.randomUUID(),
      ...experience,
    }
    setExperiences([...experiences, newExperience])
  }

  const handleDeleteAward = (id: string) => {
    setAwards(awards.filter((award) => award.id !== id))
  }

  const handleDeleteExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Experience & Awards</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Experience</h3>
          <ExperienceModal onExperienceAdded={handleExperienceAdded} />
        </div>

        {experiences?.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No experiences added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences?.map((experience) => (
              <ExperienceItem key={experience.id} experience={experience} onDelete={handleDeleteExperience} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Awards & Certifications</h3>
          <AwardModal onAwardAdded={handleAwardAdded} />
        </div>

        {awards?.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No awards added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {awards?.map((award) => (
              <AwardItem key={award.id} award={award} onDelete={handleDeleteAward} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ExperienceItem({ experience, onDelete }: { experience: any; onDelete: (id: string) => void }) {
  const formatDate = (date: Date) => {
    return format(date, "MMM yyyy")
  }

  const dateRange = experience.current
    ? `${formatDate(experience.startedAt)} - Present`
    : `${formatDate(experience.startedAt)} - ${formatDate(experience.endedAt)}`

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{experience.title}</h4>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
          <p className="mt-2 text-sm">{experience.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(experience.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function AwardItem({ award, onDelete }: { award: any; onDelete: (id: string) => void }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{award.title}</h4>
          <p className="text-sm text-muted-foreground">
            {award.category} - {award.year}
          </p>
          {award.description && <p className="mt-2 text-sm">{award.description}</p>}
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(award.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

