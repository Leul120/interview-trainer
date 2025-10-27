import { Suspense } from "react"
import AIInterviewContent from "./ai-interview-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function AIInterviewPage() {
  return (
    <Suspense fallback={<InterviewSkeleton />}>
      <AIInterviewContent />
    </Suspense>
  )
}

function InterviewSkeleton() {
  return (
    <div className="m-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 max-w-[1000px]">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div className="xl:w-[500px]">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full mt-4 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
