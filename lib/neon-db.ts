import { neon } from "@neondatabase/serverless"

// Export sql untuk digunakan langsung di API routes
export const sql = neon(process.env.DATABASE_URL!)

// Export NeonDB object untuk backward compatibility
export const NeonDB = {
  async getUsers() {
    return await sql`SELECT id, nik, nama, role, created_at, updated_at FROM users ORDER BY created_at DESC`
  },

  async getUserByNik(nik: string) {
    const users = await sql`SELECT * FROM users WHERE nik = ${nik} LIMIT 1`
    return users[0] || null
  },

  async createUser(nik: string, nama: string, password: string, role: string) {
    const result = await sql`
      INSERT INTO users (nik, nama, password, role)
      VALUES (${nik}, ${nama}, ${password}, ${role})
      RETURNING id, nik, nama, role, created_at
    `
    return result[0]
  },

  async updateUser(id: number, nik: string, nama: string, password: string | null, role: string) {
    if (password) {
      await sql`
        UPDATE users 
        SET nik = ${nik}, nama = ${nama}, password = ${password}, role = ${role}, updated_at = NOW()
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE users 
        SET nik = ${nik}, nama = ${nama}, role = ${role}, updated_at = NOW()
        WHERE id = ${id}
      `
    }
  },

  async deleteUser(id: number) {
    await sql`DELETE FROM users WHERE id = ${id}`
  },
}
