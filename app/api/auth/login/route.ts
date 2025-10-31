import { NextResponse } from "next/server"
import { getUserByNik } from "@/lib/neon-db-new"

export async function POST(request: Request) {
  try {
    const { nik, password } = await request.json()

    if (!nik || !password) {
      return NextResponse.json({ error: "NIK dan password harus diisi" }, { status: 400 })
    }

    const user = await getUserByNik(nik)

    if (!user) {
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    // Plain text password comparison
    if (user.password !== password) {
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    // Login berhasil
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
