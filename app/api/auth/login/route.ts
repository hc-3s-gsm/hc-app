import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-db"
import { verifyPassword, hashPassword } from "@/lib/password"

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
    let isPasswordValid = false

    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      // Password is hashed, use bcrypt verification
      isPasswordValid = await verifyPassword(password, user.password)
    } else {
      // Password is plain text, compare directly
      isPasswordValid = password === user.password

      // Auto-migrate: hash the password for next time
      if (isPasswordValid) {
        const hashedPassword = await hashPassword(password)
        await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${user.id}`
        console.log(`[v0] Auto-migrated password for user ${user.nik}`)
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "NIK atau password salah" }, { status: 401 })
    }

    // Login berhasil - return user data tanpa password
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
