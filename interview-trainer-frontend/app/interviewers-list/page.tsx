"use client"
import { useState, useCallback, useEffect, useRef, memo, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Star,
  MapPin,
  Clock,
  Heart,
  BriefcaseIcon,
  Sparkles,
  ChevronDown,
  Video,
  Award,
  TrendingUp,
  Grid,
  List,
  Sliders,
  X,
  ArrowRight,
  Users,
} from "lucide-react"
import axios from "axios"
import Link from "next/link"

// Memoized card component to prevent unnecessary re-renders
const InterviewerCard = memo(({ interviewer, toggleFavorite, isFavorite }) => {
  const performanceLevel = getPerformanceLevel(interviewer)

  // CSS class approach instead of state for hover effects
  return (
    <Link href={`/interviewer-profile/${interviewer.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="relative rounded-xl bg-white overflow-hidden
            border border-gray-200 transition-all duration-300 h-full
            hover:border-primary/50 hover:shadow-lg group"
      >
        {/* Background glow effect on hover */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 opacity-0 
          group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        ></div>

        {/* Premium Badge */}
        {interviewer.subscriptionType === "PREMIUM" && (
          <div className="absolute top-4 left-4 z-10">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full
                flex items-center space-x-1 text-sm font-medium shadow-md"
            >
              <Award className="w-4 h-4" />
              <span>Premium</span>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => toggleFavorite(e, interviewer.id)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 backdrop-blur-sm shadow-sm
              hover:bg-gray-100 transition-colors duration-200"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div
                className="rounded-2xl border-2 border-gray-100 overflow-hidden
                  group-hover:border-primary/20 transition-colors duration-300"
              >
                <img
                  src={interviewer.profilePicture || "https://via.placeholder.com/80"}
                  alt={interviewer.name}
                  className="object-cover w-20 h-20 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div
                className={`absolute bottom-0 right-0 w-4 h-4 
                ${interviewer.online ? "bg-green-500" : "bg-gray-400"} 
                rounded-full border-2 border-white animate-pulse`}
              />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {interviewer.name}
                </h3>
              </div>

              <p className="text-gray-600 text-sm mt-1 flex items-center">
                {interviewer.role || interviewer.type}
                {performanceLevel && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${performanceLevel.color} 
                    bg-gray-100 font-medium`}
                  >
                    {performanceLevel.level}
                  </span>
                )}
              </p>

              <div className="flex items-center mt-2 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(interviewer.averageRating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {interviewer.averageRating || "0"}
                  <span className="text-gray-500">({interviewer.reviewCount || "0"})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Skills/Expertise Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {interviewer.expertise?.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 
                rounded-md text-xs"
              >
                {skill}
              </span>
            ))}
            {(interviewer.expertise?.length || 0) > 3 && (
              <span
                className="px-2 py-1 bg-gray-100 text-gray-500 
                rounded-md text-xs"
              >
                +{(interviewer.expertise?.length || 0) - 3} more
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{interviewer.industry || "Not specified"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span>{interviewer.availabilityStatus || "Unavailable"}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-2 border border-gray-100">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-800">{interviewer.completedInterviews || 0}</div>
              <div className="text-xs text-gray-500">Interviews</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-sm font-medium text-gray-800">{interviewer.experiences?.length || 0}</div>
              <div className="text-xs text-gray-500">Years Exp.</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-800">
                {Math.round(interviewer.confidenceScore || 0) * 10}%
              </div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
          </div>

          {/* Action Button with CSS-only hover effect */}
          <div className="mt-4">
            <button
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl py-2.5 px-4
                flex items-center justify-center gap-2 hover:from-primary/90 hover:to-blue-700 transition-all 
                group-hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] font-medium"
            >
              <Video className="w-4 h-4" />
              <span>Book Session</span>
              <ArrowRight className="w-0 h-4 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
})

// Move the helper function outside to prevent recreation
function getPerformanceLevel(interviewer) {
  const score = interviewer.overallPerformanceScore || 0
  if (score >= 8.5) return { level: "Expert", color: "text-purple-600" }
  if (score >= 7) return { level: "Advanced", color: "text-blue-600" }
  if (score >= 5) return { level: "Intermediate", color: "text-green-600" }
  return { level: "Beginner", color: "text-gray-600" }
}

// Loading skeleton component - memoized
const SkeletonCard = memo(() => (
  <div className="rounded-xl bg-white border border-gray-200 p-6 h-full">
    <div className="flex items-start gap-4">
      <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse"></div>
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="mt-4 bg-gray-100 rounded-lg p-3">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="mt-4">
      <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  </div>
))

// Proper naming for components
InterviewerCard.displayName = "InterviewerCard"
SkeletonCard.displayName = "SkeletonCard"

export default function InterviewersList() {
  // States - grouped by functionality
  // UI States
  const [isGridView, setIsGridView] = useState(true)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Data States
  const [interviewers, setInterviewers] = useState([])
  const [favorites, setFavorites] = useState([])

  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedTags, setSelectedTags] = useState([])
  const [ratingFilter, setRatingFilter] = useState(0)
  const [sortBy, setSortBy] = useState("rating")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")

  // Ref for scroll animations
  const scrollRef = useRef(null)

  // Debounced search for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch interviewers data
  const getInterviewers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/public/get-interviewers`)
      setInterviewers(response.data)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getInterviewers()

    // Load favorites from localStorage if available
    const savedFavorites = localStorage.getItem("interviewerFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [getInterviewers])

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("interviewerFavorites", JSON.stringify(favorites))
  }, [favorites])

  // Memoize filtered interviewers to prevent recalculations on each render
  const filteredInterviewers = useCallback(() => {
    return interviewers
      .filter((interviewer) => {
        // Search filter
        const searchMatch =
          !debouncedSearchTerm ||
          interviewer.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          interviewer.expertise?.some((exp) => exp.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
          interviewer.industry?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

        // Category filter
        const categoryMatch = activeFilter === "all" || interviewer.expertise?.includes(activeFilter)

        // Rating filter
        const ratingMatch = interviewer.averageRating >= ratingFilter

        // Availability filter
        const availabilityMatch =
          availabilityFilter === "all" ||
          (availabilityFilter === "online" && interviewer.online) ||
          (availabilityFilter === "available" && interviewer.availabilityStatus === "Available")

        // Industry filter
        const industryMatch = industryFilter === "all" || interviewer.industry === industryFilter

        // Subscription filter
        const subscriptionMatch = subscriptionFilter === "all" || interviewer.subscriptionType === subscriptionFilter

        return searchMatch && categoryMatch && ratingMatch && availabilityMatch && industryMatch && subscriptionMatch
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "rating":
            return b.averageRating - a.averageRating
          case "experience":
            return (b.experiences?.length || 0) - (a.experiences?.length || 0)
          case "interviews":
            return (b.completedInterviews || 0) - (a.completedInterviews || 0)
          default:
            return b.averageRating - a.averageRating
        }
      })
  }, [
    interviewers,
    debouncedSearchTerm,
    activeFilter,
    ratingFilter,
    availabilityFilter,
    industryFilter,
    subscriptionFilter,
    sortBy,
  ])

  // Get unique industries for filter - memoized
  const industries = useMemo(() => {
    return [...new Set(interviewers.map((i) => i.industry).filter(Boolean))]
  }, [interviewers])

  // Filter categories with icons
  const filterTags = [
    { id: "all", label: "All", icon: <Users className="w-4 h-4" /> },
    { id: "Technology", label: "Technology", icon: <Sparkles className="w-4 h-4" /> },
    { id: "Product", label: "Product", icon: <BriefcaseIcon className="w-4 h-4" /> },
    { id: "Design", label: "Design", icon: <Sparkles className="w-4 h-4" /> },
    { id: "Marketing", label: "Marketing", icon: <TrendingUp className="w-4 h-4" /> },
  ]

  // Toggle favorite status - optimized to avoid event propagation issues
  const toggleFavorite = useCallback((e, id) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }, [])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setActiveFilter("all")
    setRatingFilter(0)
    setAvailabilityFilter("all")
    setIndustryFilter("all")
    setSubscriptionFilter("all")
  }, [])

  // Memoize filtered results to prevent unnecessary calculations
  const filteredResults = useMemo(() => filteredInterviewers(), [filteredInterviewers])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section with Subtle Background */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 -top-20 -left-20 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute w-96 h-96 top-20 right-20 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Interview Coach</h1>
                <p className="mt-2 text-gray-600 max-w-2xl">
                  Connect with industry-leading experts who will prepare you for your dream role
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, skills or industry..."
                    className="pl-10 pr-4 py-3 w-full md:w-72 rounded-xl border border-gray-300 
                      bg-white focus:ring-2 focus:ring-primary focus:border-transparent
                      placeholder-gray-400 text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`p-3 rounded-xl border ${showFiltersPanel ? "border-primary text-primary" : "border-gray-300 text-gray-500"}
                    hover:bg-gray-50 transition-colors`}
                >
                  <Sliders className="w-5 h-5" />
                </button>

                <div className="hidden md:flex rounded-xl border border-gray-300 p-1 bg-white">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`p-2 rounded-lg ${isGridView ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`p-2 rounded-lg ${!isGridView ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showFiltersPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                      <button onClick={() => setShowFiltersPanel(false)} className="text-gray-500 hover:text-gray-900">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Minimum Rating</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="1"
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm font-medium flex items-center gap-1 text-gray-900">
                            {ratingFilter}
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        >
                          <option value="rating">Highest Rating</option>
                          <option value="experience">Most Experience</option>
                          <option value="interviews">Most Interviews</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Industry</label>
                        <select
                          value={industryFilter}
                          onChange={(e) => setIndustryFilter(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        >
                          <option value="all">All Industries</option>
                          {industries.map((industry, index) => (
                            <option key={index} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Availability</label>
                        <select
                          value={availabilityFilter}
                          onChange={(e) => setAvailabilityFilter(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        >
                          <option value="all">Any Availability</option>
                          <option value="online">Currently Online</option>
                          <option value="available">Available</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button onClick={resetFilters} className="px-4 py-2 text-gray-500 hover:text-gray-900">
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Tags */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
              {filterTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveFilter(tag.id)}
                  className={`
                    px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap
                    ${
                      activeFilter === tag.id
                        ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md"
                        : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }
                  `}
                >
                  {tag.icon}
                  {tag.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              Showing <span className="text-gray-900 font-medium">{filteredResults.length}</span> interviewers
              {activeFilter !== "all" && (
                <span>
                  {" "}
                  in <span className="text-gray-900 font-medium">{activeFilter}</span>
                </span>
              )}
              {searchTerm && (
                <span>
                  {" "}
                  matching "<span className="text-gray-900 font-medium">{searchTerm}</span>"
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-gray-700 text-sm border-none focus:ring-0"
              >
                <option value="rating" className="bg-white">
                  Rating
                </option>
                <option value="experience" className="bg-white">
                  Experience
                </option>
                <option value="interviews" className="bg-white">
                  Interviews
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={scrollRef}>
        {isLoading ? (
          <div className={`grid ${isGridView ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <>
            {filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No interviewers found</h3>
                <p className="text-gray-600 max-w-md">
                  We couldn't find any interviewers matching your search criteria. Try adjusting your filters or search
                  term.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg
                    hover:bg-gray-200 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className={`grid ${isGridView ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
              >
                <AnimatePresence>
                  {filteredResults.map((interviewer) => (
                    <InterviewerCard
                      key={interviewer.id}
                      interviewer={interviewer}
                      toggleFavorite={toggleFavorite}
                      isFavorite={favorites.includes(interviewer.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="bg-gradient-to-r from-primary to-blue-600 p-4 rounded-full shadow-md
            hover:shadow-lg transition-all text-white"
        >
          <ChevronDown className="w-6 h-6 transform rotate-180" />
        </button>
      </div>
    </div>
  )
}

