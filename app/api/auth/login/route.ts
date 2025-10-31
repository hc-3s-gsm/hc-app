import { NextResponse } from "next/server"
import { getUserByNik, updateUser } from "@/lib/neon-db-new"
import { verifyPassword, hashPassword } from "@/lib/password"

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

    const dbPassword = user.password

    // <CHANGE> Cek apakah password sudah di-hash atau masih plain text
    const isPasswordHashed = dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$")

    let isPasswordValid = false

    if (isPasswordHashed) {
      // Password sudah di-hash, gunakan bcrypt verification
      isPasswordValid = await verifyPassword(password, dbPassword)
    } else {
      // Password masih plain text, bandingkan langsung
      isPasswordValid = dbPassword === password

      // <CHANGE> Auto-migrate: hash password lama saat login berhasil
      if (isPasswordValid) {
        const hashedPassword = await hashPassword(password)
        await updateUser(user.id, user.nik, user.nama, hashedPassword, user.role)
        console.log("[v0] Password auto-migrated for user:", user.nik)
      }
    }

    if (!isPasswordValid) {
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
