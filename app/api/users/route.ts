import { NextResponse } from "next/server"
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/neon-db-new"
import { hashPassword } from "@/lib/password"

export async function GET() {
  try {
    const users = await getUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nik, nama, password, role } = await request.json()

    // <CHANGE> Hash password sebelum menyimpan ke database
    const hashedPassword = await hashPassword(password)

    await addUser(nik, nama, hashedPassword, role)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding user:", error)
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, nik, nama, password, role } = await request.json()

    // <CHANGE> Hash password jika ada password baru
    let finalPassword = password
    if (password) {
      finalPassword = await hashPassword(password)
    }

    await updateUser(id, nik, nama, finalPassword, role)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    await deleteUser(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
