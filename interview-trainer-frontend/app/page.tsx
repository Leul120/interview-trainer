"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Code,
  Briefcase,
  Headphones,
  Target,
  Play,
  X,
  Star,
  ArrowUpRight,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Menu,
  BarChart3,
  Users,
  Layers,
  Cpu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Feature data
const features = [
  {
    icon: Code,
    title: "Technical Interviews",
    description: "Master coding challenges, system design, and technical concepts with real-time feedback.",
  },
  {
    icon: Briefcase,
    title: "Behavioral Interviews",
    description: "Perfect your STAR responses and behavioral interview techniques.",
  },
  {
    icon: Headphones,
    title: "AI Mock Interviews",
    description: "Experience realistic interviews with our advanced AI interviewer.",
  },
  {
    icon: Target,
    title: "Interview Intelligence",
    description: "Get insights and analytics about your interview performance.",
  },
]

// Practice areas data
const practiceAreas = [
  {
    title: "Software Engineering",
    icon: Cpu,
    description: "Prepare for technical interviews with coding challenges, system design, and algorithm questions.",
  },
  {
    title: "Product Management",
    icon: Layers,
    description: "Practice product strategy, prioritization, and stakeholder management scenarios.",
  },
  {
    title: "Data Science",
    icon: BarChart3,
    description: "Master machine learning concepts, statistical analysis, and data modeling questions.",
  },
  {
    title: "Business Development",
    icon: Users,
    description: "Refine your sales strategy, negotiation skills, and market analysis techniques.",
  },
]

// Pricing plans data
const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 AI mock interviews per month",
      "Basic performance analytics",
      "Community forum access",
      "Limited question bank",
    ],
    buttonText: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    yearlyPrice: "$299",
    period: "per month",
    yearlyPeriod: "per year",
    features: [
      "Unlimited AI mock interviews",
      "Advanced analytics dashboard",
      "Interview recording & playback",
      "Full question bank access",
      "Custom interview scenarios",
      "Priority support",
    ],
    buttonText: "Start Pro Trial",
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per team",
    features: [
      "Everything in Pro",
      "Team management dashboard",
      "Custom company questions",
      "Bulk user management",
      "API access",
      "Dedicated support",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
]

// Success metrics data
const successMetrics = [
  {
    number: "95%",
    label: "Success Rate",
    description: "of our users report improved interview confidence",
  },
  {
    number: "50K+",
    label: "Mock Interviews",
    description: "conducted through our platform",
  },
  {
    number: "200+",
    label: "Companies",
    description: "hire candidates trained by InterviewPro",
  },
  {
    number: "85%",
    label: "Offer Rate",
    description: "for users who complete our program",
  },
]

// Testimonials data
const testimonials = [
  {
    name: "Alice Johnson",
    role: "Software Engineer at Google",
    feedback:
      "InterviewPro transformed my interview skills. The AI mock sessions were incredibly realistic and helped me prepare for edge cases I wouldn't have considered otherwise.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    name: "Bob Smith",
    role: "Product Manager at Uber",
    feedback:
      "The personalized feedback and interactive lessons boosted my confidence immensely. I went from nervous wreck to composed professional in just three weeks of practice.",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    rating: 5,
  },
  {
    name: "Carla Gomez",
    role: "Data Scientist at Tesla",
    feedback:
      "A game changer for interview preparation. The data science specific questions were spot on, and the AI feedback helped me refine my technical explanations to non-technical stakeholders.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 4,
  },
]

// FAQ data
const faqs = [
  {
    question: "How does the AI mock interview work?",
    answer:
      "Our AI interviewer uses advanced natural language processing to conduct realistic interview sessions. It asks questions, listens to your responses, and provides real-time feedback on your answers, communication style, and body language through your device's camera and microphone.",
  },
  {
    question: "Can I practice for specific companies?",
    answer:
      "Yes! InterviewPro offers company-specific interview preparation for over 200 top employers. Our database includes actual interview questions reported by candidates, along with tailored preparation strategies for each company's unique interview process.",
  },
  {
    question: "How many mock interviews can I do?",
    answer:
      "Free users can conduct up to 5 AI mock interviews per month. Pro subscribers enjoy unlimited mock interviews, allowing you to practice as much as needed before your actual interview.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "Yes, InterviewPro is available on iOS and Android devices. The mobile app allows you to practice on the go, review your performance analytics, and access our question bank from anywhere.",
  },
]

// Trusted by companies
const trustedCompanies = ["Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Uber", "Airbnb"]

export default function Home() {
  const [pricingMode, setPricingMode] = useState("monthly")
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.98])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Remove dark mode class from document
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const togglePricingMode = () => {
    setPricingMode(pricingMode === "monthly" ? "yearly" : "monthly")
  }

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      
      <main className="">
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-gray-50 to-white"></div>
          </div>

          <motion.div style={{ opacity, scale }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Interview Training
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
                  Master Your <span className="text-primary">Interview Skills</span> With Confidence
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Our AI-powered platform provides personalized interview preparation, real-time feedback, and expert
                  coaching to help you land your dream job.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="group bg-primary hover:bg-primary/90 text-white">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsDemoOpen(true)}
                    className="group border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Button>
                </div>

                <div className="mt-12">
                  <p className="text-sm text-gray-500 mb-4">Trusted by professionals from leading companies</p>
                  <div className="flex flex-wrap gap-6 items-center">
                    {trustedCompanies.slice(0, 4).map((company, index) => (
                      <div key={index} className="text-gray-400 font-medium text-sm">
                        {company}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative lg:ml-auto">
                
                  <Image
                    src="https://img.freepik.com/free-vector/job-interview-conversation_74855-7566.jpg?ga=GA1.1.179287188.1741811315&semt=ais_hybrid?height=600&width=800"
                    width={800}
                    height={600}
                    alt="AI Interview Platform"
                    className="w-full h-auto relative z-10"
                  />

                  

                  
                </div>

                
            </div>
          </motion.div>
        </section>

        {/* Success Metrics */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {successMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{metric.number}</div>
                  <div className="font-medium mb-1 text-gray-900">{metric.label}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Everything You Need to Succeed</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive tools designed to prepare you for any interview scenario
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="transition-all duration-300"
                >
                  <Card className="h-full border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="p-3 rounded-lg bg-primary/10 inline-flex mb-2">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Feature Highlight */}
            <div className="mt-24 grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden   bg-white">
                  
                  <Image
                    src="/placeholder.svg?height=500&width=700"
                    width={700}
                    height={500}
                    alt="AI Interview Analysis"
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="max-w-xl"
              >
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Advanced Feature
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Real-time Performance Analysis</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Our AI doesn't just listen to your answers—it analyzes your delivery, confidence, and content quality
                  to provide comprehensive feedback that helps you improve with every session.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-green-100 text-green-600 mt-0.5">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Speech Analysis</h4>
                      <p className="text-gray-600">
                        Detects filler words, pace, and clarity to help you communicate more effectively.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-green-100 text-green-600 mt-0.5">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Content Evaluation</h4>
                      <p className="text-gray-600">
                        Assesses the relevance and depth of your answers against industry standards.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-green-100 text-green-600 mt-0.5">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Improvement Tracking</h4>
                      <p className="text-gray-600">
                        Monitors your progress over time and suggests targeted practice areas.
                      </p>
                    </div>
                  </li>
                </ul>

                <Button className="group bg-primary hover:bg-primary/90">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Practice Areas */}
        <section id="practice" className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Practice Areas
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Specialized Interview Preparation</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tailored practice sessions for different roles and industries
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {practiceAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="transition-all duration-300"
                >
                  <Card className="h-full border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-primary/10 p-6 md:w-1/3 flex items-center justify-center">
                          <div className="p-4 rounded-full bg-white">
                            <area.icon className="w-8 h-8 text-primary" />
                          </div>
                        </div>
                        <div className="p-6 md:w-2/3">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{area.title}</h3>
                          <p className="text-gray-600 mb-4">{area.description}</p>
                          <Button variant="link" className="p-0 h-auto text-primary group">
                            Start Practice{" "}
                            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Testimonials
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What Our Users Say</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Success stories from professionals who landed their dream jobs
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="relative overflow-hidden py-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="px-4"
                  >
                    <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-xl">
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                              <Image
                                src={testimonials[testimonialIndex].image || "/placeholder.svg"}
                                alt={testimonials[testimonialIndex].name}
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                              <div className="bg-primary text-white p-1 rounded-full">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i < testimonials[testimonialIndex].rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>

                          <p className="text-lg md:text-xl text-gray-700 mb-6">
                            "{testimonials[testimonialIndex].feedback}"
                          </p>

                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {testimonials[testimonialIndex].name}
                            </h4>
                            <p className="text-gray-600">{testimonials[testimonialIndex].role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="rounded-full border-gray-300 hover:bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span className="sr-only">Previous testimonial</span>
                  </Button>

                  <div className="flex items-center gap-3">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setTestimonialIndex(index)}
                        className={`w-3 h-3 rounded-full ${index === testimonialIndex ? "bg-primary" : "bg-gray-300"}`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="rounded-full border-gray-300 hover:bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span className="sr-only">Next testimonial</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Pricing
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Choose Your Plan</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Flexible pricing options to match your interview preparation needs
              </p>

              <div className="flex items-center justify-center gap-3 mb-8">
                <span className={pricingMode === "monthly" ? "font-medium text-primary" : "text-gray-500"}>
                  Monthly
                </span>
                <Switch checked={pricingMode === "yearly"} onCheckedChange={() => togglePricingMode()} />
                <span className={pricingMode === "yearly" ? "font-medium text-primary" : "text-gray-500"}>Yearly</span>
                {pricingMode === "yearly" && (
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                    Save 20%
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => {
                const price = pricingMode === "monthly" ? plan.price : plan.yearlyPrice || plan.price
                const period = pricingMode === "monthly" ? plan.period : plan.yearlyPeriod || plan.period

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-white border-primary">{plan.badge}</Badge>
                      </div>
                    )}

                    <Card
                      className={`h-full overflow-hidden border-gray-200 ${plan.popular ? "relative z-10 scale-105 my-4 shadow-xl" : "shadow-lg"}`}
                    >
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline mb-6">
                          <span className="text-4xl font-bold text-gray-900">{price}</span>
                          <span className="ml-1 text-gray-500">/{period}</span>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"}`}
                        >
                          {plan.buttonText}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Enterprise Info */}
            <div className="mt-16 max-w-3xl mx-auto text-center">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Need a custom solution for your team?</h3>
              <p className="text-gray-600 mb-6">
                We offer tailored enterprise plans for companies looking to prepare multiple candidates or entire teams
                for interviews.
              </p>
              <Button variant="outline" className="gap-2 border-gray-300 hover:bg-gray-50 text-gray-900">
                Contact Our Sales Team
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to know about InterviewPro</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className={`border border-gray-200 rounded-lg overflow-hidden ${
                        expandedFaq === index ? "bg-white shadow-lg" : "bg-gray-50"
                      }`}
                    >
                      <button
                        className="flex justify-between items-center w-full p-5 text-left"
                        onClick={() => toggleFaq(index)}
                      >
                        <h3 className="font-medium text-lg text-gray-900">{faq.question}</h3>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedFaq === index ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`px-5 overflow-hidden transition-all ${
                          expandedFaq === index ? "pb-5 max-h-96" : "max-h-0"
                        }`}
                      >
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <p className="text-gray-600 mb-4">Still have questions? We're here to help.</p>
                <Button variant="outline" className="gap-2 border-gray-300 hover:bg-gray-50 text-gray-900">
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="py-24 bg-gradient-to-r from-primary/10 to-blue-500/5 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/80 text-primary text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started Today
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  Ready to Transform Your Interview Skills?
                </h2>
                <p className="text-xl mb-8 text-gray-700">
                  Join thousands of successful professionals who have improved their interview performance with
                  InterviewPro. Start your journey today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="group bg-primary hover:bg-primary/90">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 text-gray-900">
                    Schedule Demo
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Intervw</span>
              </div>
              <p className="text-gray-600 mb-4">Empowering careers through AI-driven interview preparation.</p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <Zap className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Interview Guides
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Legal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Intervw All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal */}
      {isDemoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full mx-4 relative border border-gray-200 shadow-xl">
            <button
              onClick={() => setIsDemoOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating chat button */}
      <div className="fixed bottom-8 right-8 z-40">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90 shadow-lg h-14 w-14">
                <MessageSquare className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Chat with support</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

