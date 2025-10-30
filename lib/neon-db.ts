import { neon } from "@neondatabase/serverless"

let sql: any = null

try {
  if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL)
    console.log("[v0] Database connection initialized")
  } else {
    console.log("[v0] DATABASE_URL not found in environment variables")
  }
} catch (error) {
  console.error("[v0] Failed to initialize database connection:", error)
}

export async function getUserByNik(nik: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    console.log("[v0] Querying database for NIK:", nik)
    const result = await sql("SELECT * FROM users WHERE nik = $1", [nik])
    console.log("[v0] Query result:", result)
    return result[0] || null
  } catch (error) {
    console.error("[v0] Error fetching user by NIK:", error)
    return null
  }
}

export async function getUsers() {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM users ORDER BY created_at DESC")
    return result
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUserById(id: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM users WHERE id = $1", [id])
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUsersByRole(role: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM users WHERE role = $1 ORDER BY nama", [role])
    return result
  } catch (error) {
    console.error("Error fetching users by role:", error)
    return []
  }
}

export async function getUsersBySite(site: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM users WHERE site = $1 ORDER BY nama", [site])
    return result
  } catch (error) {
    console.error("Error fetching users by site:", error)
    return []
  }
}

export async function addUser(user: any) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql(
      `INSERT INTO users (nik, nama, email_prefix, password, role, site, jabatan, departemen, poh, status_karyawan, no_ktp, no_telp, tanggal_lahir, jenis_kelamin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        user.nik,
        user.nama,
        user.emailPrefix,
        user.password,
        user.role,
        user.site,
        user.jabatan,
        user.departemen,
        user.poh,
        user.statusKaryawan,
        user.noKtp,
        user.noTelp,
        user.tanggalLahir,
        user.jenisKelamin,
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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    await sql("DELETE FROM users WHERE id = $1", [id])
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Leave Request operations
export async function getLeaveRequests() {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM leave_requests ORDER BY created_at DESC")
    return result
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return []
  }
}

export async function getLeaveRequestById(id: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM leave_requests WHERE id = $1", [id])
    return result[0] || null
  } catch (error) {
    console.error("Error fetching leave request:", error)
    return null
  }
}

export async function getLeaveRequestsByUserId(userId: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM leave_requests WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    return result
  } catch (error) {
    console.error("Error fetching leave requests by user:", error)
    return []
  }
}

export async function getLeaveRequestsBySite(site: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM leave_requests WHERE site = $1 ORDER BY created_at DESC", [site])
    return result
  } catch (error) {
    console.error("Error fetching leave requests by site:", error)
    return []
  }
}

export async function getLeaveRequestsByStatus(status: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM leave_requests WHERE status = $1 ORDER BY created_at DESC", [status])
    return result
  } catch (error) {
    console.error("Error fetching leave requests by status:", error)
    return []
  }
}

export async function getPendingRequestsForAtasan(site: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM leave_requests WHERE status = $1 ORDER BY created_at DESC", ["approved"])
    return result
  } catch (error) {
    console.error("Error fetching approved requests:", error)
    return []
  }
}

export async function addLeaveRequest(request: any) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    await sql("DELETE FROM leave_requests WHERE id = $1", [id])
  } catch (error) {
    console.error("Error deleting leave request:", error)
    throw error
  }
}

// Approval History operations
export async function getApprovalHistory() {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

    const result = await sql("SELECT * FROM approval_history ORDER BY timestamp DESC")
    return result
  } catch (error) {
    console.error("Error fetching approval history:", error)
    return []
  }
}

export async function getApprovalHistoryByRequestId(requestId: string) {
  try {
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
    if (!sql) {
      console.log("[v0] Database not available, returning null")
      return null
    }

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
