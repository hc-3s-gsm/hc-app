import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function getUsers() {
  try {
    const result = await sql("SELECT * FROM users ORDER BY created_at DESC")
    return result
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUserById(id: string) {
  try {
    const result = await sql("SELECT * FROM users WHERE id = $1", [id])
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUsersByRole(role: string) {
  try {
    const result = await sql("SELECT * FROM users WHERE role = $1 ORDER BY nama", [role])
    return result
  } catch (error) {
    console.error("Error fetching users by role:", error)
    return []
  }
}

export async function getUsersBySite(site: string) {
  try {
    const result = await sql("SELECT * FROM users WHERE site = $1 ORDER BY nama", [site])
    return result
  } catch (error) {
    console.error("Error fetching users by site:", error)
    return []
  }
}

export async function addUser(user: any) {
  try {
    const result = await sql(
      `INSERT INTO users (id, nik, nama, email, password, role, site, jabatan, departemen, poh, status_karyawan, no_ktp, no_telp, tanggal_bergabung)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        user.id,
        user.nik,
        user.nama,
        user.email,
        user.password,
        user.role,
        user.site,
        user.jabatan,
        user.departemen,
        user.poh,
        user.statusKaryawan,
        user.noKtp,
        user.noTelp,
        user.tanggalBergabung,
      ],
    )
    return result[0]
  } catch (error) {
    console.error("Error adding user:", error)
    throw error
  }
}

export async function updateUser(id: string, updates: any) {
  try {
    const fields = []
    const values = []
    let paramCount = 1

    Object.entries(updates).forEach(([key, value]) => {
      const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
      fields.push(`${dbKey} = $${paramCount}`)
      values.push(value)
      paramCount++
    })

    values.push(id)
    const query = `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`
    const result = await sql(query, values)
    return result[0]
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export async function deleteUser(id: string) {
  try {
    await sql("DELETE FROM users WHERE id = $1", [id])
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Leave Request operations
export async function getLeaveRequests() {
  try {
    const result = await sql("SELECT * FROM leave_requests ORDER BY created_at DESC")
    return result
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return []
  }
}

export async function getLeaveRequestById(id: string) {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE id = $1", [id])
    return result[0] || null
  } catch (error) {
    console.error("Error fetching leave request:", error)
    return null
  }
}

export async function getLeaveRequestsByUserId(userId: string) {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    return result
  } catch (error) {
    console.error("Error fetching leave requests by user:", error)
    return []
  }
}

export async function getLeaveRequestsBySite(site: string) {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE site = $1 ORDER BY created_at DESC", [site])
    return result
  } catch (error) {
    console.error("Error fetching leave requests by site:", error)
    return []
  }
}

export async function getLeaveRequestsByStatus(status: string) {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE status = $1 ORDER BY created_at DESC", [status])
    return result
  } catch (error) {
    console.error("Error fetching leave requests by status:", error)
    return []
  }
}

export async function getPendingRequestsForAtasan(site: string) {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE status = $1 AND site = $2 ORDER BY created_at DESC", [
      "pending_atasan",
      site,
    ])
    return result
  } catch (error) {
    console.error("Error fetching pending requests for atasan:", error)
    return []
  }
}

export async function getPendingRequestsForPJO(site: string) {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE status = $1 AND site = $2 ORDER BY created_at DESC", [
      "pending_pjo",
      site,
    ])
    return result
  } catch (error) {
    console.error("Error fetching pending requests for PJO:", error)
    return []
  }
}

export async function getPendingRequestsForHRHO() {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE status = $1 ORDER BY created_at DESC", [
      "pending_hr_ho",
    ])
    return result
  } catch (error) {
    console.error("Error fetching pending requests for HR HO:", error)
    return []
  }
}

export async function getApprovedRequests() {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE status = $1 ORDER BY created_at DESC", ["approved"])
    return result
  } catch (error) {
    console.error("Error fetching approved requests:", error)
    return []
  }
}

export async function addLeaveRequest(request: any) {
  try {
    const result = await sql(
      `INSERT INTO leave_requests (
        id, user_id, user_name, user_nik, site, jabatan, departemen, poh, status_karyawan,
        no_ktp, no_telp, email, jenis_pengajuan_cuti, tanggal_pengajuan, tanggal_mulai,
        tanggal_selesai, jumlah_hari, berangkat_dari, tujuan, sisa_cuti_tahunan,
        tanggal_cuti_periodik_berikutnya, catatan, alasan, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING *`,
      [
        request.id,
        request.userId,
        request.userName,
        request.userNik,
        request.site,
        request.jabatan,
        request.departemen,
        request.poh,
        request.statusKaryawan,
        request.noKtp,
        request.noTelp,
        request.email,
        request.jenisPengajuanCuti,
        request.tanggalPengajuan,
        request.tanggalMulai,
        request.tanggalSelesai,
        request.jumlahHari,
        request.berangkatDari,
        request.tujuan,
        request.sisaCutiTahunan,
        request.tanggalCutiPeriodikBerikutnya,
        request.catatan,
        request.alasan,
        request.status,
      ],
    )
    return result[0]
  } catch (error) {
    console.error("Error adding leave request:", error)
    throw error
  }
}

export async function updateLeaveRequest(id: string, updates: any) {
  try {
    const fields = []
    const values = []
    let paramCount = 1

    Object.entries(updates).forEach(([key, value]) => {
      const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
      fields.push(`${dbKey} = $${paramCount}`)
      values.push(value)
      paramCount++
    })

    values.push(id)
    const query = `UPDATE leave_requests SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`
    const result = await sql(query, values)
    return result[0]
  } catch (error) {
    console.error("Error updating leave request:", error)
    throw error
  }
}

export async function deleteLeaveRequest(id: string) {
  try {
    await sql("DELETE FROM leave_requests WHERE id = $1", [id])
  } catch (error) {
    console.error("Error deleting leave request:", error)
    throw error
  }
}

export async function getLeaveRequestsSubmittedBy(userId: string) {
  try {
    const result = await sql("SELECT * FROM leave_requests WHERE submitted_by = $1 ORDER BY created_at DESC", [userId])
    return result
  } catch (error) {
    console.error("Error fetching leave requests submitted by user:", error)
    return []
  }
}

export async function getApprovedRequestsBySubmitter(userId: string) {
  try {
    const result = await sql(
      "SELECT * FROM leave_requests WHERE submitted_by = $1 AND status = $2 ORDER BY created_at DESC",
      [userId, "approved"],
    )
    return result
  } catch (error) {
    console.error("Error fetching approved requests by submitter:", error)
    return []
  }
}

export async function getRejectedRequestsBySubmitter(userId: string) {
  try {
    const result = await sql(
      "SELECT * FROM leave_requests WHERE submitted_by = $1 AND status = $2 ORDER BY created_at DESC",
      [userId, "rejected"],
    )
    return result
  } catch (error) {
    console.error("Error fetching rejected requests by submitter:", error)
    return []
  }
}

export async function getApprovedRequestsByApprover(approverUserId: string) {
  try {
    const result = await sql(
      `SELECT DISTINCT lr.* FROM leave_requests lr
       INNER JOIN approval_history ah ON lr.id = ah.request_id
       WHERE ah.approver_user_id = $1 AND ah.action = $2 AND lr.status = $3
       ORDER BY lr.created_at DESC`,
      [approverUserId, "approved", "approved"],
    )
    return result
  } catch (error) {
    console.error("Error fetching approved requests by approver:", error)
    return []
  }
}

export async function getRejectedRequestsByApprover(approverUserId: string) {
  try {
    const result = await sql(
      `SELECT DISTINCT lr.* FROM leave_requests lr
       INNER JOIN approval_history ah ON lr.id = ah.request_id
       WHERE ah.approver_user_id = $1 AND ah.action = $2
       ORDER BY lr.created_at DESC`,
      [approverUserId, "rejected"],
    )
    return result
  } catch (error) {
    console.error("Error fetching rejected requests by approver:", error)
    return []
  }
}

export async function addLeaveRequestWithSubmitter(request: any) {
  try {
    const result = await sql(
      `INSERT INTO leave_requests (
        id, user_id, user_name, user_nik, site, jabatan, departemen, poh, status_karyawan,
        no_ktp, no_telp, email, jenis_pengajuan_cuti, tanggal_pengajuan, tanggal_mulai,
        tanggal_selesai, jumlah_hari, berangkat_dari, tujuan, sisa_cuti_tahunan,
        tanggal_cuti_periodik_berikutnya, catatan, alasan, status, submitted_by, submitted_by_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
       RETURNING *`,
      [
        request.id,
        request.userId,
        request.userName,
        request.userNik,
        request.site,
        request.jabatan,
        request.departemen,
        request.poh,
        request.statusKaryawan,
        request.noKtp,
        request.noTelp,
        request.email,
        request.jenisPengajuanCuti,
        request.tanggalPengajuan,
        request.tanggalMulai,
        request.tanggalSelesai,
        request.jumlahHari,
        request.berangkatDari,
        request.tujuan,
        request.sisaCutiTahunan,
        request.tanggalCutiPeriodikBerikutnya,
        request.catatan,
        request.alasan,
        request.status,
        request.submittedBy,
        request.submittedByName,
      ],
    )
    return result[0]
  } catch (error) {
    console.error("Error adding leave request with submitter:", error)
    throw error
  }
}

// Approval History operations
export async function getApprovalHistory() {
  try {
    const result = await sql("SELECT * FROM approval_history ORDER BY timestamp DESC")
    return result
  } catch (error) {
    console.error("Error fetching approval history:", error)
    return []
  }
}

export async function getApprovalHistoryByRequestId(requestId: string) {
  try {
    const result = await sql("SELECT * FROM approval_history WHERE request_id = $1 ORDER BY timestamp DESC", [
      requestId,
    ])
    return result
  } catch (error) {
    console.error("Error fetching approval history by request:", error)
    return []
  }
}

export async function addApprovalHistory(history: any) {
  try {
    const result = await sql(
      `INSERT INTO approval_history (id, request_id, approver_user_id, approver_name, approver_role, action, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        history.id,
        history.requestId,
        history.approverUserId,
        history.approverName,
        history.approverRole,
        history.action,
        history.notes,
      ],
    )
    return result[0]
  } catch (error) {
    console.error("Error adding approval history:", error)
    throw error
  }
}
