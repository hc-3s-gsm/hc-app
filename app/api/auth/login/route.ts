import { type NextRequest, NextResponse } from "next/server"
import * as neonDb from "@/lib/neon-db"
import { INITIAL_USERS } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nik, password } = body

    console.log("[v0] Login attempt with NIK:", nik)

    if (!nik || !password) {
      console.log("[v0] Missing NIK or password")
      return NextResponse.json({ error: "NIK dan password diperlukan" }, { status: 400 })
    }

    let user = await neonDb.getUserByNik(nik)
    console.log("[v0] User from database:", user ? user.nik : "not found")

    if (!user) {
      console.log("[v0] User not in database, checking mock data")
      user = INITIAL_USERS.find((u) => u.nik === nik)
      console.log("[v0] User from mock data:", user ? user.nik : "not found")
    }

    if (!user) {
      console.log("[v0] User not found with NIK:", nik)
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    const dbPassword = (user as any).password
    if (dbPassword !== password) {
      console.log("[v0] Invalid password for NIK:", nik)
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    console.log("[v0] Login successful for NIK:", nik)
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("[v0] Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat login"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
