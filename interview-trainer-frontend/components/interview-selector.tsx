"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import {
  Search,
  Plus,
  X,
  ArrowRight,
  Settings,
  Clock,
  Filter,
  Zap,
  Star,
  Bookmark,
  Cpu,
  Brain,
  Rocket,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
// import { useTheme } from "@/hooks/use-theme"
import { Checkbox } from "@/components/ui/checkbox"

// Import interview data
import { interviewCategories } from "@/data/interview-categories"

// Define the InterviewType interface
interface InterviewType {
  id: string
  title: string
  description: string
  difficulty: string
  timeCommitment: string
  icon: React.ReactNode
  defaultFocusAreas?: string[]
}

export default function InterviewSelector() {
  const router = useRouter()
//   const { theme } = useTheme()
  const controls = useAnimation()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [customFocusAreas, setCustomFocusAreas] = useState<string[]>([])
  const [newFocusArea, setNewFocusArea] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("MEDIUM")
  const [sessionTitle, setSessionTitle] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filteredDifficulty, setFilteredDifficulty] = useState<string | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<InterviewType[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentlyViewed")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [bookmarked, setBookmarked] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookmarked")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [activeTab, setActiveTab] = useState("all")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [aiAssistance, setAiAssistance] = useState(true)
  const [prepTime, setPrepTime] = useState<number[]>([4])

  // Animation for search bar
  useEffect(() => {
    if (isSearchFocused) {
      controls.start({ width: "100%", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" })
    } else {
      controls.start({ width: "100%", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" })
    }
  }, [isSearchFocused, controls])

  // Handle type selection
  const handleTypeSelect = (type: InterviewType) => {
    setSelectedType(type)
    setCustomFocusAreas(type.defaultFocusAreas || [])
    setIsModalOpen(true)
    setCurrentStep(1)

    // Add to recently viewed
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== type.id)
      return [type, ...filtered].slice(0, 5)
    })
  }

  // Add custom focus area
  const addCustomFocusArea = () => {
    if (newFocusArea && !customFocusAreas.includes(newFocusArea)) {
      setCustomFocusAreas([...customFocusAreas, newFocusArea])
      setNewFocusArea("")
    }
  }

  // Remove focus area
  const removeFocusArea = (area: string) => {
    setCustomFocusAreas(customFocusAreas.filter((a) => a !== area))
  }

  // Toggle bookmark
  const toggleBookmark = (typeId: string) => {
    setBookmarked((prev) => {
      const updated = prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
      return updated
    })
  }

  // Start interview preparation
  const handleStart = async () => {
    if (!selectedType || !sessionTitle) return

    router.push(
      `/interview/ai-interview?category=${selectedType.title}&description=${selectedType.description}&difficulty=${selectedDifficulty}&focusAreas=${customFocusAreas.join(",")}&title=${sessionTitle}&aiAssistance=${aiAssistance}`,
    )
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    
      switch (difficulty) {
        case "Beginner":
          return "bg-emerald-500 text-white"
        case "Intermediate":
          return "bg-amber-500 text-white"
        case "Advanced":
          return "bg-rose-500 text-white"
        default:
          return "bg-slate-500 text-white"
      }
    
  }

  // Filter interview types
  const getFilteredInterviewTypes = () => {
    let filtered = []

    if (activeTab === "bookmarked") {
      for (const category of interviewCategories) {
        const types = category.types.filter(
          (type) =>
            bookmarked.includes(type.id) &&
            (!filteredDifficulty || type.difficulty === filteredDifficulty) &&
            (searchQuery === "" || type.title.toLowerCase().includes(searchQuery.toLowerCase())),
        )

        if (types.length > 0) {
          filtered.push({
            ...category,
            types,
          })
        }
      }
    } else if (activeTab === "recent") {
      const types = recentlyViewed.filter(
        (type) =>
          (!filteredDifficulty || type.difficulty === filteredDifficulty) &&
          (searchQuery === "" || type.title.toLowerCase().includes(searchQuery.toLowerCase())),
      )

      if (types.length > 0) {
        filtered.push({
          id: "recent",
          name: "Recently Viewed",
          description: "Your recently viewed interview types",
          types,
        })
      }
    } else {
      filtered = interviewCategories
        .map((category) => ({
          ...category,
          types: category.types.filter(
            (type) =>
              (!filteredDifficulty || type.difficulty === filteredDifficulty) &&
              (searchQuery === "" ||
                type.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.name.toLowerCase().includes(searchQuery.toLowerCase())),
          ),
        }))
        .filter((category) => category.types.length > 0)
    }

    return filtered
  }

  const filteredCategories = getFilteredInterviewTypes()

  useEffect(() => {
    localStorage.setItem("bookmarked", JSON.stringify(bookmarked))
  }, [bookmarked])

  useEffect(() => {
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed))
  }, [recentlyViewed])

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-4 text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 dark:from-primary dark:to-indigo-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Interview Preparation Portal
        </motion.h1>
        <motion.p
          className="text-muted-foreground max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Choose your interview type and customize your preparation journey
        </motion.p>
      </div>

      {/* Search and Filter */}
      <motion.div
        className="relative max-w-3xl mx-auto mb-8"
        animate={controls}
        initial={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search interview types, categories, skills..."
              className="pl-10 pr-10 py-6 text-lg border-primary/20 focus:border-primary shadow-lg dark:shadow-primary/5 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isFilterOpen ? "default" : "outline"}
                    className="flex gap-2 items-center py-6 px-4 rounded-xl"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="h-5 w-5" />
                    <span className="hidden md:inline">Filters</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter interview types</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              className="mt-4 p-6 bg-background border rounded-xl shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Difficulty Level</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={filteredDifficulty === null ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => setFilteredDifficulty(null)}
                    >
                      All
                    </Badge>
                    <Badge
                      variant={filteredDifficulty === "Beginner" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => setFilteredDifficulty("Beginner")}
                    >
                      Beginner
                    </Badge>
                    <Badge
                      variant={filteredDifficulty === "Intermediate" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => setFilteredDifficulty("Intermediate")}
                    >
                      Intermediate
                    </Badge>
                    <Badge
                      variant={filteredDifficulty === "Advanced" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => setFilteredDifficulty("Advanced")}
                    >
                      Advanced
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Time Commitment</h3>
                  <div className="px-2">
                    <Slider defaultValue={[4]} max={12} min={1} step={1} value={prepTime} onValueChange={setPrepTime} />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>1 week</span>
                      <span>{prepTime[0]} weeks</span>
                      <span>12 weeks</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {interviewCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilteredDifficulty(null)
                    setSelectedCategory(null)
                    setPrepTime([4])
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            All Types
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Bookmarked
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {/* Interview Categories */}
          <div className="space-y-12">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  className="inline-block p-4 rounded-full bg-muted mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  <Search className="h-8 w-8 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1.5">
                      {category.types.length} Type{category.types.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.types.map((type, typeIndex) => (
                      <motion.div
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: typeIndex * 0.05 + categoryIndex * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="relative"
                      >
                        <Card className="h-full overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 bg-background/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5">
                          <div className="absolute top-3 right-3 z-10">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleBookmark(type.id)
                                    }}
                                  >
                                    <Bookmark
                                      className={cn(
                                        "h-4 w-4",
                                        bookmarked.includes(type.id)
                                          ? "fill-primary text-primary"
                                          : "text-muted-foreground",
                                      )}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{bookmarked.includes(type.id) ? "Remove bookmark" : "Bookmark"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="p-6 cursor-pointer" onClick={() => handleTypeSelect(type)}>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl">
                                {type.icon}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-lg">{type.title}</h3>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2">{type.description}</p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(type.difficulty)}`}
                                  >
                                    {type.difficulty}
                                  </div>

                                  <div className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {type.timeCommitment}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                  {type.defaultFocusAreas?.length || 0} focus areas
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  <span>Select</span>
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookmarked">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                className="inline-block p-4 rounded-full bg-muted mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              >
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-medium mb-2">No bookmarked interviews</h3>
              <p className="text-muted-foreground">Bookmark your favorite interview types to find them quickly</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1.5">
                      {category.types.length} Type{category.types.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.types.map((type, typeIndex) => (
                      <motion.div
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: typeIndex * 0.05 + categoryIndex * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="relative"
                      >
                        <Card className="h-full overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 bg-background/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5">
                          <div className="absolute top-3 right-3 z-10">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleBookmark(type.id)
                                    }}
                                  >
                                    <Bookmark className="h-4 w-4 fill-primary text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remove bookmark</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="p-6 cursor-pointer" onClick={() => handleTypeSelect(type)}>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl">
                                {type.icon}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-lg">{type.title}</h3>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2">{type.description}</p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(type.difficulty)}`}
                                  >
                                    {type.difficulty}
                                  </div>

                                  <div className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {type.timeCommitment}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                  {type.defaultFocusAreas?.length || 0} focus areas
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  <span>Select</span>
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                className="inline-block p-4 rounded-full bg-muted mb-4"
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 10, ease: "linear" }}
              >
                <Clock className="h-8 w-8 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-medium mb-2">No recent interviews</h3>
              <p className="text-muted-foreground">Your recently viewed interview types will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories[0].types.map((type, typeIndex) => (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: typeIndex * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="relative"
                  >
                    <Card className="h-full overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 bg-background/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5">
                      <div className="absolute top-3 right-3 z-10">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleBookmark(type.id)
                                }}
                              >
                                <Bookmark
                                  className={cn(
                                    "h-4 w-4",
                                    bookmarked.includes(type.id)
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground",
                                  )}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{bookmarked.includes(type.id) ? "Remove bookmark" : "Bookmark"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="p-6 cursor-pointer" onClick={() => handleTypeSelect(type)}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl">
                            {type.icon}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{type.title}</h3>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{type.description}</p>

                            <div className="flex flex-wrap gap-2 mt-3">
                              <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(type.difficulty)}`}>
                                {type.difficulty}
                              </div>

                              <div className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {type.timeCommitment}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                              {type.defaultFocusAreas?.length || 0} focus areas
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <span>Select</span>
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Customization Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Customize Your Preparation
            </DialogTitle>
            <DialogDescription>
              Personalize your interview preparation journey for {selectedType?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-8">
              <Progress value={currentStep * 33.33} className="h-2 bg-primary/20" />
              <div className="flex justify-between mt-2 text-sm">
                <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
                  Focus Areas
                </span>
                <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
                  Difficulty
                </span>
                <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>Details</span>
              </div>
            </div>
            <div className="overflow-auto no-scrollbar max-h-[430px]">
            <AnimatePresence mode="wait" >
                
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 "
                >
                  <div>
                    <h3 className="text-lg font-medium mb-4">Select Focus Areas</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose specific topics to focus on during your interview preparation
                    </p>
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-4">
                      {selectedType?.defaultFocusAreas?.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={customFocusAreas.includes(area)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCustomFocusAreas([...customFocusAreas, area])
                              } else {
                                setCustomFocusAreas(customFocusAreas.filter((a) => a !== area))
                              }
                            }}
                          />
                          <label
                            htmlFor={area}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {area}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {customFocusAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                        {area}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFocusArea(area)} />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom focus area"
                      value={newFocusArea}
                      onChange={(e) => setNewFocusArea(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomFocusArea()}
                    />
                    <Button onClick={addCustomFocusArea} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium mb-4">Select Difficulty Level</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose the difficulty level for your interview preparation
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedDifficulty === "EASY" ? "border-primary bg-primary/5" : "",
                      )}
                      onClick={() => setSelectedDifficulty("EASY")}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                          <Zap className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h4 className="font-medium mb-2">Beginner</h4>
                        <p className="text-sm text-muted-foreground">Foundational questions and basic concepts</p>

                        {selectedDifficulty === "EASY" && (
                          <div className="mt-4">
                            <Badge variant="default">Selected</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedDifficulty === "MEDIUM" ? "border-primary bg-primary/5" : "",
                      )}
                      onClick={() => setSelectedDifficulty("MEDIUM")}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                          <Star className="h-6 w-6 text-amber-500" />
                        </div>
                        <h4 className="font-medium mb-2">Intermediate</h4>
                        <p className="text-sm text-muted-foreground">Moderate complexity with practical scenarios</p>

                        {selectedDifficulty === "MEDIUM" && (
                          <div className="mt-4">
                            <Badge variant="default">Selected</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedDifficulty === "HARD" ? "border-primary bg-primary/5" : "",
                      )}
                      onClick={() => setSelectedDifficulty("HARD")}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
                          <Cpu className="h-6 w-6 text-rose-500" />
                        </div>
                        <h4 className="font-medium mb-2">Advanced</h4>
                        <p className="text-sm text-muted-foreground">Complex challenges and expert-level topics</p>

                        {selectedDifficulty === "HARD" && (
                          <div className="mt-4">
                            <Badge variant="default">Selected</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium mb-4">Session Details</h3>
                    <p className="text-muted-foreground mb-4">
                      Provide additional details for your interview preparation session
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-title">Session Title</Label>
                      <Input
                        id="session-title"
                        placeholder="Give a title for your session"
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <Switch id="ai-assistance" checked={aiAssistance} onCheckedChange={setAiAssistance} />
                      <Label htmlFor="ai-assistance">Enable AI assistance during interview</Label>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg mt-6">
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <Brain className="h-4 w-4 text-primary" />
                        Session Summary
                      </h4>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interview Type:</span>
                          <span className="font-medium">{selectedType?.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">
                            {selectedDifficulty === "EASY"
                              ? "Beginner"
                              : selectedDifficulty === "MEDIUM"
                                ? "Intermediate"
                                : "Advanced"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Focus Areas:</span>
                          <span className="font-medium">{customFocusAreas.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AI Assistance:</span>
                          <span className="font-medium">{aiAssistance ? "Enabled" : "Disabled"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : setIsModalOpen(false))}
              >
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>
              <Button
                onClick={() => {
                  if (currentStep < 3) {
                    setCurrentStep(currentStep + 1)
                  } else {
                    handleStart()
                  }
                }}
                className="flex items-center gap-2"
                disabled={currentStep === 3 && !sessionTitle}
              >
                {currentStep === 3 ? (
                  <>
                    <Rocket className="h-4 w-4" />
                    Start Preparation
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            </div>
          </div>
          
        </DialogContent>
      </Dialog>
    </div>
  )
}

