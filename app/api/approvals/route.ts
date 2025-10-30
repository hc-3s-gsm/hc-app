import { type NextRequest, NextResponse } from "next/server"
import {
  getApprovals,
  getApprovalsByRequestId,
  getApprovalsByApproverId,
  addApproval,
  updateApproval,
} from "@/lib/neon-db-new"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const requestId = searchParams.get("requestId")
    const approverId = searchParams.get("approverId")

    let result

    if (type === "by-request" && requestId) {
      result = await getApprovalsByRequestId(requestId)
    } else if (type === "by-approver" && approverId) {
      result = await getApprovalsByApproverId(approverId)
    } else {
      result = await getApprovals()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching approvals:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await addApproval(data)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating approval:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updates } = data

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })
    }

    const result = await updateApproval(id, updates)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating approval:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
