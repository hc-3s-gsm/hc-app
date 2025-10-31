import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-db"
import { hashPassword } from "@/lib/password"

// GET - Ambil semua users
export async function GET() {
  try {
    const users = await sql`
      SELECT id, nik, nama, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `
    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 })
  }
}

// POST - Tambah user baru dengan auto-hash password
export async function POST(request: NextRequest) {
  try {
    const { nik, nama, password, role } = await request.json()

    if (!nik || !nama || !password || !role) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 })
    }

    const existingUser = await sql`SELECT id FROM users WHERE nik = ${nik} LIMIT 1`

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await sql`
      INSERT INTO users (nik, nama, password, role)
      VALUES (${nik}, ${nama}, ${hashedPassword}, ${role})
      RETURNING id, nik, nama, role, created_at
    `

    return NextResponse.json({
      success: true,
      user: newUser[0],
    })
  } catch (error) {
    console.error("[v0] Create user error:", error)
    return NextResponse.json({ error: "Gagal menambahkan pengguna" }, { status: 500 })
  }
}

// PUT - Update user dengan auto-hash password jika diubah
export async function PUT(request: NextRequest) {
  try {
    const { id, nik, nama, password, role } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID pengguna harus disertakan" }, { status: 400 })
    }

    if (password) {
      const hashedPassword = await hashPassword(password)
      await sql`
        UPDATE users 
        SET nik = ${nik}, nama = ${nama}, password = ${hashedPassword}, role = ${role}, updated_at = NOW()
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE users 
        SET nik = ${nik}, nama = ${nama}, role = ${role}, updated_at = NOW()
        WHERE id = ${id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json({ error: "Gagal mengupdate pengguna" }, { status: 500 })
  }
}

// DELETE - Hapus user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID pengguna harus disertakan" }, { status: 400 })
    }

    await sql`DELETE FROM users WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 })
  }
}
