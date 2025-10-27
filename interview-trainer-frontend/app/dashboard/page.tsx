"use client"

import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Trophy,
  Brain,
  Target,
  Settings,
  Users,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  Search,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { ScheduledInterviews } from "@/components/scheduled-interviews"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppContext } from "../layout"

interface User {
  id: string
  email: string
  name: string
  profilePicture: string
  role: "ADMIN" | "INTERVIEWER" | "INTERVIEWEE"
  completedInterviews: number
  failedInterviews: number
  overallPerformanceScore: number
  isSubscribed: boolean
  subscriptionType: string
  expertise?: string
  averageRating?: number
  reviewCount?: number
  online?: boolean
  industry?: string
  type?: "INTERVIEWER" | "INTERVIEWEE" // Added type property
}

interface Session {
  id: string
  intervieweeEmail: string
  interviewerEmail: string
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELED"
  scheduledTime: string
  startedAt: string
  endedAt: string
}

interface ScheduledInterview {
  id: string
  intervieweeId: string
  interviewerId: string
  scheduledAt: string
  duration: number
  intervieweeName?: string
  interviewerName?: string
  intervieweeAvatar?: string
  interviewerAvatar?: string
}

const PAGE_SIZE = 5

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { setTheme, theme } = useTheme()

  // Pagination states
  const [currentSessionPage, setCurrentSessionPage] = useState(1)
  const [currentSchedulePage, setCurrentSchedulePage] = useState(1)
  const [sessionFilter, setSessionFilter] = useState("ALL")
  const [scheduleSearch, setScheduleSearch] = useState("")
  const [totalSessionPages, setTotalSessionPages] = useState<number>(1)
  const [totalSchedulePages, setTotalSchedulePages] = useState<number>(1)
  const router=useRouter()
  const {token}=useContext(AppContext)

  useEffect(() => {
    if (token) {
      fetchData()
    }else{
      router.push("/login") 
    }
  }, [token])
  console.log(sessionFilter)

  useEffect(() => {
    if (token) {
      fetchSessions()
    }
  }, [currentSessionPage, token,sessionFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchUserData(), fetchSessions(), fetchSchedules()])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setTimeout(() => setRefreshing(false), 600) // Show refresh animation for at least 600ms
  }

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/get-user-by-id`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
      setIsOnline(response.data.online || false)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await axios.get(
        `https://apigateway-25az.onrender.com/api/v1/session/get-my-sessions?page=${currentSessionPage}&sortField=startedAt&direction=DESC&status=${sessionFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data && Array.isArray(response.data.content)) {
        setSessions(response.data.content)
        setTotalSessionPages(response.data.totalPages || 1)
        setCurrentSessionPage(response.data.page || 1)
      } else {
        setSessions([])
        setTotalSessionPages(1)
      }
    } catch (error) {
      console.error(error)
      setSessions([])
      setTotalSessionPages(1)
    }
  }

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        `https://apigateway-25az.onrender.com/api/v1/session/get-my-scheduled-interviews?page=${currentSchedulePage}&sortField=scheduledAt&direction=DESC`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data && Array.isArray(response.data.content)) {
        setSchedules(response.data.content)
        setTotalSchedulePages(response.data.totalPages || 1)
        setCurrentSchedulePage(response.data.page || 1)
      } else {
        setSchedules([])
        setTotalSchedulePages(1)
      }
    } catch (error) {
      console.error(error)
      setSchedules([])
      setTotalSchedulePages(1)
    }
  }

  const toggleOnlineStatus = async () => {
    try {
      const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/online-status/${!isOnline}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
      setIsOnline(!isOnline)
    } catch (error) {
      console.error(error)
    }
  }

  // Filter and paginate sessions
  const filteredSessions = Array.isArray(sessions)
    ? sessions.filter((session) => sessionFilter === "ALL" || session.status === sessionFilter)
    : []

  // Filter and paginate schedules
  const filteredSchedules = Array.isArray(schedules)
    ? schedules.filter(
        (schedule) =>
          (schedule.intervieweeId?.toLowerCase() || "").includes(scheduleSearch.toLowerCase()) ||
          (schedule.interviewerId?.toLowerCase() || "").includes(scheduleSearch.toLowerCase()),
      )
    : []

  const paginatedSchedules = filteredSchedules.slice(
    (currentSchedulePage - 1) * PAGE_SIZE,
    currentSchedulePage * PAGE_SIZE,
  )
  console.log(new Date())
  // Transform schedules to match ScheduledInterviews component props
  const formattedSchedules: ScheduledInterview[] = paginatedSchedules.map((schedule) => ({
    id: schedule.id || "",
    intervieweeId: schedule.intervieweeId || "",
    interviewerId: schedule.interviewerId || "",
    scheduledAt: schedule.scheduledAt || new Date().toISOString(),
    duration: 60,
    intervieweeName: schedule.intervieweeId ? schedule.intervieweeId.split("@")[0] : "Unknown",
    interviewerName: schedule.interviewerId ? schedule.interviewerId.split("@")[0] : "Unknown",
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <RefreshCw className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  const expertiseString =user?.expertise;
const expertiseArray = expertiseString?.replace(/[\[\]]/g, "").split(", ").map(item => item.trim());

  if (!user) return null

  // Determine user role for ScheduledInterviews component
  const userRoleForSchedules =
    user.role === "INTERVIEWER" || user.type === "INTERVIEWER" ? "INTERVIEWER" : "INTERVIEWEE"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {user.name || "User"}!</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {(user.role || "user").toLowerCase()}
                    </Badge>
                    <p className="text-muted-foreground">
                      {user.type === "INTERVIEWER"
                        ? (user.industry || "Professional") + " Expert"
                        : "Interview Candidate"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshData}
                  className={refreshing ? "animate-spin text-primary" : ""}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>

                {user.type === "INTERVIEWER" && (
                  <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                    <Switch
                      checked={isOnline}
                      onCheckedChange={toggleOnlineStatus}
                      className={isOnline ? "bg-green-500" : ""}
                    />
                    <Label>{isOnline ? "Available" : "Offline"}</Label>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Badge className="mr-2 bg-primary/20 text-primary hover:bg-primary/30">
                        {user.subscriptionType || "Free"}
                      </Badge>
                      Subscription
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start p-0 h-auto font-normal text-destructive"
                      >
                        Log out
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Overview Card */}
            <Card className="col-span-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-md shadow-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  {user.type === "INTERVIEWER" ? (
                    <>
                      <Users className="h-6 w-6" />
                      Interview Statistics
                    </>
                  ) : (
                    <>
                      <Target className="h-6 w-6" />
                      Your Progress
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {user.type === "INTERVIEWER" ? (
                    <>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-5xl font-bold mb-2">{user.averageRating?.toFixed(1) || "0.0"}</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current" />
                          <p className="text-primary-foreground/90">Rating ({user.reviewCount || 0} reviews)</p>
                        </div>
                      </motion.div>
                      <div className="flex gap-6">
                        <motion.div
                          className="text-center"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <div className="text-3xl font-bold">
                            {Array.isArray(sessions) ? sessions.filter((s) => s.status === "COMPLETED").length : 0}
                          </div>
                          <p className="text-sm">Completed</p>
                        </motion.div>
                        <motion.div
                          className="text-center"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <div className="text-3xl font-bold">
                            {Array.isArray(sessions) ? sessions.filter((s) => s.status === "SCHEDULED").length : 0}
                          </div>
                          <p className="text-sm">Scheduled</p>
                        </motion.div>
                        <motion.div
                          className="text-center"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <div className="text-3xl font-bold">
                            {Array.isArray(expertiseArray) ? expertiseArray.length : 0}
                          </div>
                          <p className="text-sm">Skills</p>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-5xl font-bold mb-2">{(user.overallPerformanceScore || 0).toFixed(0)}%</div>
                        <p className="text-primary-foreground/90">Overall Performance</p>
                      </motion.div>
                      <div className="flex gap-6">
                        <motion.div
                          className="text-center"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <div className="text-3xl font-bold">{user.completedInterviews || 0}</div>
                          <p className="text-sm">Completed</p>
                        </motion.div>
                        <motion.div
                          className="text-center"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <div className="text-3xl font-bold">{user.failedInterviews || 0}</div>
                          <p className="text-sm">Need Practice</p>
                        </motion.div>
                        <motion.div
                          className="text-center"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <div className="text-3xl font-bold">
                            {(user.completedInterviews || 0) + (user.failedInterviews || 0) > 0
                              ? (
                                  ((user.completedInterviews || 0) /
                                    ((user.completedInterviews || 0) + (user.failedInterviews || 0))) *
                                  100
                                ).toFixed(0)
                              : "0"}
                            %
                          </div>
                          <p className="text-sm">Success Rate</p>
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session and Schedule tabs */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-0">
                <Tabs defaultValue="sessions" className="w-full">
                  <div className="flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="sessions" className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Recent Sessions
                      </TabsTrigger>
                      <TabsTrigger value="scheduled" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Scheduled Interviews
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="sessions" className="mt-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Select value={sessionFilter} onValueChange={setSessionFilter}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Filter by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Sessions</SelectItem>
                        
                            <SelectItem value="ONGOING">Ongoing</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELED">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge className="bg-muted text-foreground">{filteredSessions.length} results</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <p>
                          Page {currentSessionPage} of {totalSessionPages || 1}
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="h-80">
                      <AnimatePresence mode="wait">
                        {Array.isArray(sessions) && sessions.length > 0 ? (
                          <div className="space-y-3">
                            {sessions.map((session, index) => (
                              <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link href={`/analysis/${session.id}`} className="block">
                                  <Card className="hover:bg-muted/50 transition-colors border-l-4 border-l-transparent hover:border-l-primary">
                                    <CardContent className="p-4 flex items-center justify-between">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant={
                                              session.status === "COMPLETED"
                                                ? "success"
                                                : session.status === "SCHEDULED"
                                                  ? "secondary"
                                                  : session.status === "ONGOING"
                                                    ? "warning"
                                                    : "destructive"
                                            }
                                            className={
                                              session.status === "COMPLETED"
                                                ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                                                : session.status === "SCHEDULED"
                                                  ? "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30"
                                                  : session.status === "ONGOING"
                                                    ? "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30"
                                                    : "bg-red-500/20 text-red-700 hover:bg-red-500/30"
                                            }
                                          >
                                            {session.status}
                                          </Badge>
                                          <h3 className="font-medium">{session.id}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(session.startedAt).toLocaleString()}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {session.status === "SCHEDULED" && (
                                          <Button size="sm" className="bg-primary">
                                            Join
                                          </Button>
                                        )}
                                        {session.status === "COMPLETED" && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-primary text-primary hover:bg-primary/5"
                                          >
                                            View Feedback
                                          </Button>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-muted-foreground"
                            >
                              No sessions found with the current filter.
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </ScrollArea>

                    <div className="flex items-center justify-between mt-3 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSessionPage(currentSessionPage - 1)}
                        disabled={currentSessionPage <= 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSessionPage(currentSessionPage + 1)}
                        disabled={currentSessionPage >= totalSessionPages || totalSessionPages === 0}
                        className="flex items-center gap-1"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="scheduled" className="mt-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 w-64">
                        <div className="relative w-full">
                          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search by name or email..."
                            value={scheduleSearch}
                            onChange={(e) => setScheduleSearch(e.target.value)}
                            className="w-full pl-8"
                          />
                        </div>
                        <Badge className="bg-muted text-foreground">{filteredSchedules.length} results</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <p>
                          Page {currentSchedulePage} of {totalSchedulePages || 1}
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="h-80">
                      <AnimatePresence mode="wait">
                        {formattedSchedules.length > 0 ? (
                          <ScheduledInterviews interviews={formattedSchedules} userRole={userRoleForSchedules} />
                        ) : (
                          <div className="text-center py-8">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-muted-foreground"
                            >
                              No scheduled interviews found.
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </ScrollArea>

                    <div className="flex items-center justify-between mt-3 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSchedulePage(Math.max(1, currentSchedulePage - 1))}
                        disabled={currentSchedulePage <= 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSchedulePage(Math.min(totalSchedulePages, currentSchedulePage + 1))}
                        disabled={currentSchedulePage >= totalSchedulePages || totalSchedulePages === 0}
                        className="flex items-center gap-1"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>

            {/* Role-specific Cards */}
            {user.type === "INTERVIEWER" ? (
              <Card className="h-min">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(expertiseArray) && expertiseArray.length > 0 ? (
                      expertiseArray.map((skill, index) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {skill}
                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No expertise listed</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Settings className="h-4 w-4" />
                    Manage Skills
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-min">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Next Interview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(sessions) && sessions.find((s) => s.status === "SCHEDULED") ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="font-medium">Upcoming Interview</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(schedules?.filter((s) => new Date(s.scheduledAt) >= new Date())
    ?.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))?.[0]?.scheduledAt || "").toLocaleString()}

                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button className="w-full gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Prepare Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">No upcoming interviews</p>
                      <Link href="/interviewers-list">
                        <Button className="w-full">Schedule Interview</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}


