import { neon } from "@neondatabase/serverless"
import type { User } from "./path-to-user-model" // Assuming User is defined in another file

const getSql = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function getUserByNik(nik: string): Promise<User | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM users WHERE nik = ${nik} LIMIT 1`
  if (result.length === 0) return null
  const row = result[0]
  return {
    id: row.id,
    nik: row.nik,
    nama: row.nama,
    email: row.email,
    password: row.password,
    role: row.role,
    site: row.site,
    jabatan: row.jabatan,
    departemen: row.departemen,
    poh: row.poh,
    statusKaryawan: row.status_karyawan,
    noKtp: row.no_ktp,
    noTelp: row.no_telp,
    tanggalLahir: row.tanggal_lahir,
    jenisKelamin: row.jenis_kelamin,
    createdAt: row.created_at,
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
  if (result.length === 0) return null
  const row = result[0]
  return {
    id: row.id,
    nik: row.nik,
    nama: row.nama,
    email: row.email,
    password: row.password,
    role: row.role,
    site: row.site,
    jabatan: row.jabatan,
    departemen: row.departemen,
    poh: row.poh,
    statusKaryawan: row.status_karyawan,
    noKtp: row.no_ktp,
    noTelp: row.no_telp,
    tanggalLahir: row.tanggal_lahir,
    jenisKelamin: row.jenis_kelamin,
    createdAt: row.created_at,
  }
}
