import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nik, password } = body

    console.log("[v0] Login attempt with NIK:", nik)

    if (!nik || !password) {
      console.log("[v0] Missing NIK or password")
      return NextResponse.json({ error: "NIK dan password diperlukan" }, { status: 400 })
    }

    const users = Database.getUsers()
    const user = users.find((u) => u.nik === nik)
    console.log("[v0] User found:", user ? user.nik : "not found")

    if (!user || user.password !== password) {
      console.log("[v0] Invalid credentials")
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    console.log("[v0] Login successful")
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat login" }, { status: 500 })
  }
}
