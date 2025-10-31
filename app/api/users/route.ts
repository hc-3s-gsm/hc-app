import { type NextRequest, NextResponse } from "next/server"
import { getUsers, getUserById, getUsersByRole, addUser, updateUser } from "@/lib/neon-db-new"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const role = searchParams.get("role")

    let result

    if (type === "by-id" && id) {
      result = await getUserById(id)
    } else if (type === "by-role" && role) {
      result = await getUsersByRole(role)
    } else {
      result = await getUsers()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      nik,
      nama,
      email,
      password,
      role,
      site,
      jabatan,
      departemen,
      poh,
      statusKaryawan,
      noKtp,
      noTelp,
      tanggalLahir,
      jenisKelamin,
    } = data

    if (!nik || !nama || !email || !password) {
      return NextResponse.json({ error: "Data wajib: nik, nama, email, password" }, { status: 400 })
    }

    const result = await addUser({
      id: data.id,
      nik,
      nama,
      email_prefix: email.split("@")[0],
      password,
      role,
      site,
      jabatan,
      departemen,
      poh,
      status_karyawan: statusKaryawan,
      no_ktp: noKtp,
      no_telp: noTelp,
      tanggal_lahir: tanggalLahir,
      jenis_kelamin: jenisKelamin,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updates } = data

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })
    }

    const result = await updateUser(id, updates)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
