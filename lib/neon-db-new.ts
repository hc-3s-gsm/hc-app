import { neon } from "@neondatabase/serverless"

const getSql = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export interface User {
  id: number
  nik: string
  nama: string
  email: string
  password: string
  role: string
  site: string
  jabatan: string
  departemen: string
  poh: string
  statusKaryawan: string
  noKtp: string
  noTelp: string
  tanggalLahir: string
  jenisKelamin: string
  createdAt: string
}

export interface LeaveRequest {
  id: number
  userId: number
  userName: string
  userNik: string
  userSite: string
  userDepartemen: string
  userJabatan: string
  jenisIzin: string
  tanggalMulai: string
  tanggalSelesai: string
  jumlahHari: number
  keterangan: string
  status: string
  approvalLevel: number
  createdAt: string
  updatedAt: string
}

export interface Approval {
  id: number
  leaveRequestId: number
  approverId: number
  approverName: string
  approverNik: string
  approverJabatan: string
  level: number
  status: string
  keterangan: string
  createdAt: string
  updatedAt: string
}

export const NeonDB = {
  // User operations
  async getUsers(): Promise<User[]> {
    const sql = getSql()
    const result = await sql`SELECT * FROM users ORDER BY created_at DESC`
    return result.map((row: any) => ({
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
    }))
  },

  async getUserByEmail(email: string): Promise<User | null> {
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
  },

  async getUserByNik(nik: string): Promise<User | null> {
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
  },

  async addUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const sql = getSql()
    const result = await sql`
      INSERT INTO users (
        nik, nama, email, password, role, site, jabatan, departemen, poh,
        status_karyawan, no_ktp, no_telp, tanggal_lahir, jenis_kelamin
      ) VALUES (
        ${user.nik}, ${user.nama}, ${user.email}, ${user.password}, ${user.role},
        ${user.site}, ${user.jabatan}, ${user.departemen}, ${user.poh},
        ${user.statusKaryawan}, ${user.noKtp}, ${user.noTelp}, ${user.tanggalLahir},
        ${user.jenisKelamin}
      )
      RETURNING *
    `
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
  },

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const sql = getSql()
    
    const result = await sql`
      UPDATE users 
      SET 
        nik = COALESCE(${updates.nik}, nik),
        nama = COALESCE(${updates.nama}, nama),
        email = COALESCE(${updates.email}, email),
        password = COALESCE(${updates.password}, password),
        role = COALESCE(${updates.role}, role),
        site = COALESCE(${updates.site}, site),
        jabatan = COALESCE(${updates.jabatan}, jabatan),
        departemen = COALESCE(${updates.departemen}, departemen),
        poh = COALESCE(${updates.poh}, poh),
        status_karyawan = COALESCE(${updates.statusKaryawan}, status_karyawan),
        no_ktp = COALESCE(${updates.noKtp}, no_ktp),
        no_telp = COALESCE(${updates.noTelp}, no_telp),
        tanggal_lahir = COALESCE(${updates.tanggalLahir}, tanggal_lahir),
        jenis_kelamin = COALESCE(${updates.jenisKelamin}, jenis_kelamin)
      WHERE id = ${id}
      RETURNING *
    `
    
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
  },

  async deleteUser(id: number): Promise<void> {
    const sql = getSql()
    await sql`DELETE FROM users WHERE id = ${id}`
  },

  // Leave Request operations
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const sql = getSql()
    const result =
      await sql`SELECT * FROM leave_requests ORDER BY created_at DESC`
    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userNik: row.user_nik,
      userSite: row.user_site,
      userDepartemen: row.user_departemen,
      userJabatan: row.user_jabatan,
      jenisIzin: row.jenis_izin,
      tanggalMulai: row.tanggal_mulai,
      tanggalSelesai: row.tanggal_selesai,
      jumlahHari: row.jumlah_hari,
      keterangan: row.keterangan,
      status: row.status,
      approvalLevel: row.approval_level,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async getLeaveRequestsByUserId(userId: number): Promise<LeaveRequest[]> {
    const sql = getSql()
    const result =
      await sql`SELECT * FROM leave_requests WHERE user_id = ${userId} ORDER BY created_at DESC`
    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userNik: row.user_nik,
      userSite: row.user_site,
      userDepartemen: row.user_departemen,
      userJabatan: row.user_jabatan,
      jenisIzin: row.jenis_izin,
      tanggalMulai: row.tanggal_mulai,
      tanggalSelesai: row.tanggal_selesai,
      jumlahHari: row.jumlah_hari,
      keterangan: row.keterangan,
      status: row.status,
      approvalLevel: row.approval_level,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async addLeaveRequest(
    request: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<LeaveRequest> {
    const sql = getSql()
    const result = await sql`
      INSERT INTO leave_requests (
        user_id, user_name, user_nik, user_site, user_departemen, user_jabatan,
        jenis_izin, tanggal_mulai, tanggal_selesai, jumlah_hari, keterangan,
        status, approval_level
      ) VALUES (
        ${request.userId}, ${request.userName}, ${request.userNik}, ${request.userSite},
        ${request.userDepartemen}, ${request.userJabatan}, ${request.jenisIzin},
        ${request.tanggalMulai}, ${request.tanggalSelesai}, ${request.jumlahHari},
        ${request.keterangan}, ${request.status}, ${request.approvalLevel}
      )
      RETURNING *
    `
    const row = result[0]
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userNik: row.user_nik,
      userSite: row.user_site,
      userDepartemen: row.user_departemen,
      userJabatan: row.user_jabatan,
      jenisIzin: row.jenis_izin,
      tanggalMulai: row.tanggal_mulai,
      tanggalSelesai: row.tanggal_selesai,
      jumlahHari: row.jumlah_hari,
      keterangan: row.keterangan,
      status: row.status,
      approvalLevel: row.approval_level,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  async updateLeaveRequest(
    id: number,
    updates: Partial<LeaveRequest>
  ): Promise<LeaveRequest> {
    const sql = getSql()
    
    const result = await sql`
      UPDATE leave_requests 
      SET 
        status = COALESCE(${updates.status}, status),
        approval_level = COALESCE(${updates.approvalLevel}, approval_level),
        keterangan = COALESCE(${updates.keterangan}, keterangan),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    const row = result[0]
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userNik: row.user_nik,
      userSite: row.user_site,
      userDepartemen: row.user_departemen,
      userJabatan: row.user_jabatan,
      jenisIzin: row.jenis_izin,
      tanggalMulai: row.tanggal_mulai,
      tanggalSelesai: row.tanggal_selesai,
      jumlahHari: row.jumlah_hari,
      keterangan: row.keterangan,
      status: row.status,
      approvalLevel: row.approval_level,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  // Approval operations
  async getApprovals(): Promise<Approval[]> {
    const sql = getSql()
    const result = await sql`SELECT * FROM approvals ORDER BY created_at DESC`
    return result.map((row: any) => ({
      id: row.id,
      leaveRequestId: row.leave_request_id,
      approverId: row.approver_id,
      approverName: row.approver_name,
      approverNik: row.approver_nik,
      approverJabatan: row.approver_jabatan,
      level: row.level,
      status: row.status,
      keterangan: row.keterangan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async getApprovalsByLeaveRequestId(
    leaveRequestId: number
  ): Promise<Approval[]> {
    const sql = getSql()
    const result =
      await sql`SELECT * FROM approvals WHERE leave_request_id = ${leaveRequestId} ORDER BY level ASC`
    return result.map((row: any) => ({
      id: row.id,
      leaveRequestId: row.leave_request_id,
      approverId: row.approver_id,
      approverName: row.approver_name,
      approverNik: row.approver_nik,
      approverJabatan: row.approver_jabatan,
      level: row.level,
      status: row.status,
      keterangan: row.keterangan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async getApprovalsByApproverId(approverId: number): Promise<Approval[]> {
    const sql = getSql()
    const result =
      await sql`SELECT * FROM approvals WHERE approver_id = ${approverId} ORDER BY created_at DESC`
    return result.map((row: any) => ({
      id: row.id,
      leaveRequestId: row.leave_request_id,
      approverId: row.approver_id,
      approverName: row.approver_name,
      approverNik: row.approver_nik,
      approverJabatan: row.approver_jabatan,
      level: row.level,
      status: row.status,
      keterangan: row.keterangan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  },

  async addApproval(
    approval: Omit<Approval, "id" | "createdAt" | "updatedAt">
  ): Promise<Approval> {
    const sql = getSql()
    const result = await sql`
      INSERT INTO approvals (
        leave_request_id, approver_id, approver_name, approver_nik,
        approver_jabatan, level, status, keterangan
      ) VALUES (
        ${approval.leaveRequestId}, ${approval.approverId}, ${approval.approverName},
        ${approval.approverNik}, ${approval.approverJabatan}, ${approval.level},
        ${approval.status}, ${approval.keterangan}
      )
      RETURNING *
    `
    const row = result[0]
    return {
      id: row.id,
      leaveRequestId: row.leave_request_id,
      approverId: row.approver_id,
      approverName: row.approver_name,
      approverNik: row.approver_nik,
      approverJabatan: row.approver_jabatan,
      level: row.level,
      status: row.status,
      keterangan: row.keterangan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  async updateApproval(
    id: number,
    updates: Partial<Approval>
  ): Promise<Approval> {
    const sql = getSql()
    
    const result = await sql`
      UPDATE approvals 
      SET 
        status = COALESCE(${updates.status}, status),
        keterangan = COALESCE(${updates.keterangan}, keterangan),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    const row = result[0]
    return {
      id: row.id,
      leaveRequestId: row.leave_request_id,
      approverId: row.approver_id,
      approverName: row.approver_name,
      approverNik: row.approver_nik,
      approverJabatan: row.approver_jabatan,
      level: row.level,
      status: row.status,
      keterangan: row.keterangan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },
}
