import { neon } from "@neondatabase/serverless"

let sql: any = null

function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    sql = neon(process.env.DATABASE_URL)
  }
  return sql
}

// ============ USER OPERATIONS ============

export async function getUsers() {
  try {
    const result = await getSql()`SELECT * FROM users ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUserById(id: string) {
  try {
    const result = await getSql()`SELECT * FROM users WHERE id = ${id}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await getSql()`SELECT * FROM users WHERE email = ${email}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export async function getUserByNIK(nik: string) {
  try {
    const result = await getSql()`SELECT * FROM users WHERE nik = ${nik}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user by NIK:", error)
    return null
  }
}

export async function getUsersByRole(role: string) {
  try {
    const result = await getSql()`SELECT * FROM users WHERE role = ${role} ORDER BY name`
    return result
  } catch (error) {
    console.error("Error fetching users by role:", error)
    return []
  }
}

export async function addUser(user: any) {
  try {
    const result = await getSql()`
      INSERT INTO users (id, email, password, name, role, department, position, created_at, updated_at)
      VALUES (${user.id}, ${user.email}, ${user.password}, ${user.name}, ${user.role}, ${user.department}, ${user.position}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `
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
    const result = await getSql().query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// ============ LEAVE REQUEST OPERATIONS ============

export async function getLeaveRequests() {
  try {
    const result = await getSql()`SELECT * FROM leave_requests ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return []
  }
}

export async function getLeaveRequestById(id: string) {
  try {
    const result = await getSql()`SELECT * FROM leave_requests WHERE id = ${id}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching leave request:", error)
    return null
  }
}

export async function getLeaveRequestsByUserId(userId: string) {
  try {
    const result = await getSql()`SELECT * FROM leave_requests WHERE user_id = ${userId} ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching leave requests by user:", error)
    return []
  }
}

export async function getLeaveRequestsSubmittedBy(userId: string) {
  try {
    const result = await getSql()`SELECT * FROM leave_requests WHERE submitted_by = ${userId} ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching leave requests submitted by user:", error)
    return []
  }
}

export async function getLeaveRequestsByStatus(status: string) {
  try {
    const result = await getSql()`SELECT * FROM leave_requests WHERE status = ${status} ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching leave requests by status:", error)
    return []
  }
}

export async function getPendingRequestsForApprover(approverRole: string) {
  try {
    const result = await getSql()`
      SELECT lr.* FROM leave_requests lr
      INNER JOIN approvals a ON lr.id = a.leave_request_id
      WHERE a.approver_role = ${approverRole} AND a.status = 'pending'
      ORDER BY lr.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching pending requests for approver:", error)
    return []
  }
}

export async function addLeaveRequest(request: any) {
  try {
    const result = await getSql()`
      INSERT INTO leave_requests (
        id, user_id, submitted_by, submitted_by_name, leave_type_id,
        start_date, end_date, reason, status, created_at, updated_at
      ) VALUES (
        ${request.id}, ${request.userId}, ${request.submittedBy}, ${request.submittedByName}, 
        ${request.leaveTypeId}, ${request.startDate}, ${request.endDate}, ${request.reason}, 
        ${request.status || "pending"}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `
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
    const result = await getSql().query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error("Error updating leave request:", error)
    throw error
  }
}

// ============ APPROVAL OPERATIONS ============

export async function getApprovals() {
  try {
    const result = await getSql()`SELECT * FROM approvals ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching approvals:", error)
    return []
  }
}

export async function getApprovalsByRequestId(requestId: string) {
  try {
    const result = await getSql()`SELECT * FROM approvals WHERE leave_request_id = ${requestId} ORDER BY created_at ASC`
    return result
  } catch (error) {
    console.error("Error fetching approvals by request:", error)
    return []
  }
}

export async function getApprovalsByApproverId(approverId: string) {
  try {
    const result = await getSql()`SELECT * FROM approvals WHERE approver_id = ${approverId} ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching approvals by approver:", error)
    return []
  }
}

export async function addApproval(approval: any) {
  try {
    const result = await getSql()`
      INSERT INTO approvals (
        id, leave_request_id, approver_id, approver_name, approver_role,
        status, notes, created_at, updated_at
      ) VALUES (
        ${approval.id}, ${approval.leaveRequestId}, ${approval.approverId}, ${approval.approverName}, 
        ${approval.approverRole}, ${approval.status || "pending"}, ${approval.notes}, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error adding approval:", error)
    throw error
  }
}

export async function updateApproval(id: string, updates: any) {
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
    const query = `UPDATE approvals SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`
    const result = await getSql().query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error("Error updating approval:", error)
    throw error
  }
}

// ============ LEAVE TYPE OPERATIONS ============

export async function getLeaveTypes() {
  try {
    const result = await getSql()`SELECT * FROM leave_types ORDER BY name`
    return result
  } catch (error) {
    console.error("Error fetching leave types:", error)
    return []
  }
}

export async function getLeaveTypeById(id: string) {
  try {
    const result = await getSql()`SELECT * FROM leave_types WHERE id = ${id}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching leave type:", error)
    return null
  }
}
