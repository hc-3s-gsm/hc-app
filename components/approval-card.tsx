"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { LeaveRequest } from "@/lib/types"
import { Database } from "@/lib/database"
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils"
import { Calendar, User, Building2, FileText, CheckCircle, XCircle, Eye, Plane } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApprovalCardProps {
  request: LeaveRequest
  onApprove?: () => void
  onReject?: () => void
  onViewDetail?: () => void
  showSite?: boolean
  readOnly?: boolean
}

export function ApprovalCard({
  request,
  onApprove,
  onReject,
  onViewDetail,
  showSite = false,
  readOnly = false,
}: ApprovalCardProps) {
  const { user } = useAuth()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const handleApprove = () => {
    if (!user || !notes.trim()) {
      setError("Catatan harus diisi")
      return
    }

    setError("")
    setIsApproving(true)

    Database.approveRequest(request.id, user.id, user.nama, user.role, notes)

    setNotes("")
    setIsApproving(false)
    onApprove?.()
  }

  const handleReject = () => {
    if (!user || !notes.trim()) {
      setError("Catatan penolakan harus diisi")
      return
    }

    setError("")
    setIsRejecting(true)

    Database.rejectRequest(request.id, user.id, user.nama, user.role, notes)

    setNotes("")
    setIsRejecting(false)
    onReject?.()
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{request.jenisIzin}</h3>
            <Badge className={getStatusColor(request.status)}>{getStatusLabel(request.status)}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="h-4 w-4" />
              <span>
                {request.userName} ({request.userNik})
              </span>
            </div>

            {showSite && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="h-4 w-4" />
                <span>
                  {request.site} - {request.departemen}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(request.tanggalMulai)} - {formatDate(request.tanggalSelesai)} ({request.jumlahHari} hari)
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Plane className="h-4 w-4" />
              <span>Berangkat: {formatDate(request.tanggalKeberangkatan)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
            <p className="text-slate-700">{request.alasan}</p>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="space-y-2">
            <Label htmlFor={`notes-${request.id}`}>Catatan Persetujuan/Penolakan</Label>
            <Textarea
              id={`notes-${request.id}`}
              placeholder="Masukkan catatan Anda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetail} className="flex-1 bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              Lihat Detail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isApproving || isRejecting}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isRejecting ? "Menolak..." : "Tolak"}
            </Button>
            <Button size="sm" onClick={handleApprove} disabled={isApproving || isRejecting} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              {isApproving ? "Menyetujui..." : "Setujui"}
            </Button>
          </div>
        </div>
      )}

      {readOnly && (
        <div className="pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onViewDetail} className="w-full bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            Lihat Detail
          </Button>
        </div>
      )}
    </div>
  )
}
