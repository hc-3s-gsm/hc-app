import { type NextRequest, NextResponse } from "next/server"
import { getUserByNik } from "@/lib/neon-db-new"

export async function POST(request: NextRequest) {
  try {
    const { nik, password } = await request.json()

    console.log("[v0] Login attempt - NIK:", nik)

    if (!nik || !password) {
      return NextResponse.json({ error: "NIK dan password harus diisi" }, { status: 400 })
    }

    const user = await getUserByNik(nik)

    console.log("[v0] User found:", user ? "YES" : "NO")
    if (user) {
      console.log("[v0] User NIK from DB:", user.nik)
      console.log("[v0] Password from DB:", user.password)
      console.log("[v0] Password from input:", password)
      console.log("[v0] Password match:", password === user.password)
    }

    if (!user) {
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    if (password !== user.password) {
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat login" }, { status: 500 })
  }
}
