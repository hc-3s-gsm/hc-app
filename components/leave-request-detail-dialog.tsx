"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { LeaveRequest, ApprovalHistory } from "@/lib/types"
import { Database } from "@/lib/database"
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils"
import { Calendar, FileText, Clock, MapPin, Plane, AlertCircle } from "lucide-react"
import { ApprovalTimeline } from "@/components/approval-timeline"
import { ApprovalProgress } from "@/components/approval-progress"

interface LeaveRequestDetailDialogProps {
  request: LeaveRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
  currentUserId?: string
  isUserRole?: boolean
}

export function LeaveRequestDetailDialog({
  request,
  open,
  onOpenChange,
  currentUserId,
  isUserRole,
}: LeaveRequestDetailDialogProps) {
  const [history, setHistory] = useState<ApprovalHistory[]>([])
  const [hasAccess, setHasAccess] = useState(true)

  useEffect(() => {
    if (open) {
      if (isUserRole && currentUserId && request.userId !== currentUserId) {
        setHasAccess(false)
        return
      }

      setHasAccess(true)
      const approvalHistory = Database.getApprovalHistoryByRequestId(request.id)
      setHistory(approvalHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
    }
  }, [request.id, open, currentUserId, isUserRole, request.userId])

  if (!hasAccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Akses Ditolak</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Anda tidak memiliki akses untuk melihat pengajuan ini.</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pengajuan Cuti</DialogTitle>
          <DialogDescription>Informasi lengkap dan riwayat persetujuan</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Badge className={`${getStatusColor(request.status)} text-base px-3 py-1`}>
              {getStatusLabel(request.status)}
            </Badge>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-3">Data Karyawan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Nama</p>
                <p className="font-medium">{request.userName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">NIK</p>
                <p className="font-medium">{request.userNik}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Jabatan</p>
                <p className="font-medium">{request.jabatan}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Departemen</p>
                <p className="font-medium">{request.departemen}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Site / Lokasi Kerja</p>
                <p className="font-medium">{request.site}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">POH</p>
                <p className="font-medium">{request.poh}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status Karyawan</p>
                <p className="font-medium">{request.statusKaryawan}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">No KTP</p>
                <p className="font-medium">{request.noKtp}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">No Telp</p>
                <p className="font-medium">{request.noTelp}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium">{request.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Jenis Pengajuan Cuti</p>
                  <p className="font-medium">{request.jenisPengajuanCuti}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Tanggal Pengajuan</p>
                  <p className="text-sm">{formatDate(request.tanggalPengajuan)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Periode Cuti</p>
                  <p className="font-medium">
                    {formatDate(request.tanggalMulai)} - {formatDate(request.tanggalSelesai)}
                  </p>
                  <p className="text-sm text-slate-600">{request.jumlahHari} hari</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Berangkat dari</p>
                  <p className="font-medium">{request.berangkatDari}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Plane className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Tujuan</p>
                  <p className="font-medium">{request.tujuan}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Tanggal Keberangkatan</p>
                  <p className="font-medium">{formatDate(request.tanggalKeberangkatan)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Sisa Cuti Tahunan</p>
                  <p className="font-medium">{request.sisaCutiTahunan} hari</p>
                </div>
              </div>

              {request.tanggalCutiPeriodikBerikutnya && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Tanggal Cuti Periodik Berikutnya</p>
                    <p className="font-medium">{formatDate(request.tanggalCutiPeriodikBerikutnya)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {request.catatan && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Catatan:</p>
              <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                {request.catatan}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Alasan:</p>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{request.alasan}</p>
          </div>

          {request.bookingCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-900">Kode Booking: {request.bookingCode}</p>
            </div>
          )}

          <ApprovalProgress request={request} history={history} />

          <ApprovalTimeline history={history} currentStatus={request.status} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
