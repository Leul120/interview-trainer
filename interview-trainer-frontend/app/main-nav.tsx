"use client"

import React, { useContext, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Brain,
  Users,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Moon,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react"
import axios from "axios"
import { UNDERSCORE_NOT_FOUND_ROUTE_ENTRY } from "next/dist/shared/lib/constants"
import { AppContext } from "./layout"

const navItems = [
  { name: "AI Interview", href: "/interview", icon: Sparkles, badge: { text: "New", variant: "default" } },
  { name: "Real Person", href: "/interviewers-list", icon: Users },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
    badge: { text: "Beta", variant: "default" },
  },
]

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [user, setUser]=useState({})
  // State to manage authentication based on token existence in localStorage
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  const {token}=useContext(AppContext)
  const router=useRouter()
  
    // Get token after component mounts on the client
    useEffect(() => {
      
      console.log(token)
      setIsAuthenticated(!!token)
      if(token){
      getUser(token)
      }
    }, [token]);    
    const getUser=async(token)=>{
      try{
          const response=await axios.get(`https://apigateway-25az.onrender.com/api/v1/user/get-user-by-id`,{
              headers:{
                  Authorization:`Bearer ${token}`
              }
          })
          console.log(response.data)
          setUser(response.data)
      }catch(error){
          console.log(error)
      }
    }
    const logout=()=>{
      localStorage.removeItem("token")
    router.refresh()
    }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Brain className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold">
                Interv
                <span className="text-primary text-xs align-top">beta</span>
              </span>
            </Link>
          </div>

          {/* Main Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pathname.startsWith(item.href)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground/60 hover:text-foreground"
                        }`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.name} asChild>
                          <Link href={child.href} className="flex items-center justify-between">
                            <span className="flex items-center">
                              <child.icon className="mr-2 h-4 w-4" />
                              {child.name}
                            </span>
                            {child.badge && (
                              <Badge variant={child.badge.variant} className="ml-2">
                                {child.badge.text}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                  {item.badge && (
                    <Badge variant={item.badge.variant} className="ml-2">
                      {item.badge.text}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip> */}

            {/* Auth Buttons if not authenticated, else show Profile Dropdown */}
            {!isAuthenticated ? (
              <div className="hidden md:flex">
                <Link href="/login" >
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.profilePicture} alt="Profile" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center text-red-500 focus:text-red-500" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-2 p-4">
                {navItems.map((item) => {
                  if(item.children) {
                    return (
                      <div key={item.name} className="space-y-2">
                        <div className="font-medium text-sm text-muted-foreground px-4">{item.name}</div>
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                              pathname === child.href
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-foreground/60 hover:text-foreground"
                            }`}
                          >
                            <child.icon className="mr-2 h-4 w-4" />
                            {child.name}
                            {child.badge && (
                              <Badge variant={child.badge.variant} className="ml-2">
                                {child.badge.text}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                      {item.badge && (
                        <Badge variant={item.badge.variant} className="ml-2">
                          {item.badge.text}
                        </Badge>
                      )}
                    </Link>
                  )
                })}

                {/* Mobile Auth Buttons */}
                {!isAuthenticated && (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="default" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </TooltipProvider>
  )
}

