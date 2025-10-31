import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-db"
import { verifyPassword } from "@/lib/password"

export async function POST(request: NextRequest) {
  try {
    const { nik, password } = await request.json()

    if (!nik || !password) {
      return NextResponse.json({ error: "NIK dan password harus diisi" }, { status: 400 })
    }

    const users = await sql`SELECT * FROM users WHERE nik = ${nik} LIMIT 1`

    if (users.length === 0) {
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    const user = users[0]
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
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
