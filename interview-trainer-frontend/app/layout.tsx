'use client'
import type React from "react"
import "../styles/globals.css"
import { Poppins } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "./main-nav"
import { createContext, useState } from "react"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const AppContext = createContext()

const metadata = {
  title: "Intervw - Master Your Interview Skills",
  description: "AI-powered interview preparation platform to help you succeed in your career",
  keywords: ["interview", "practice", "AI", "career", "job search", "skill development"],
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  console.log(token)
  return (
    <html lang="en" >
      <body >
        <AppContext.Provider value={{token}}>
          <MainNav />
          {children}
        </AppContext.Provider>
        <Toaster />
      </body>
    </html>
  )
}



