"use client"

import { useState } from "react"

const AuthContext = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

      const user = data.user
      console.log("[v0] Login successful, user:", user.nik)

      setUser(user)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(user))
      return true
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    }
  }

  return <div>{/* ... existing code ... */}</div>
}

export default AuthContext
