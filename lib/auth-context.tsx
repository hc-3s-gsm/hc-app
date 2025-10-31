"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (nik: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (nik: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nik, password }),
      })

      console.log("[v0] Login response status:", response.status)

      if (!response.ok) {
        console.log("[v0] Login failed with status:", response.status)
        return false
      }

      const data = await response.json()
      console.log("[v0] Login response data:", data)

      if (!data.success || !data.user) {
        console.log("[v0] Login failed - invalid response structure")
        return false
      }

      const userData = data.user
      console.log("[v0] Login successful, user:", userData.nik)

      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(userData))
      return true
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
