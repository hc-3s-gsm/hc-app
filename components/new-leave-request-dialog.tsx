"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database } from "@/lib/database"
import { LEAVE_TYPES, SITES } from "@/lib/mock-data"
import { generateId, calculateDaysBetween } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/lib/types"

interface NewLeaveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewLeaveRequestDialog({ open, onOpenChange, onSuccess }: NewLeaveRequestDialogProps) {
  const { user } = useAuth()
  const [site, setSite] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [jenisPengajuanCuti, setJenisPengajuanCuti] = useState("")
  const [tanggalPengajuan, setTanggalPengajuan] = useState(new Date().toISOString().split("T")[0])
  const [tanggalMulai, setTanggalMulai] = useState("")
  const [tanggalSelesai, setTanggalSelesai] = useState("")
  const [berangkatDari, setBerangkatDari] = useState("")
  const [tujuan, setTujuan] = useState("")
  const [tanggalKeberangkatan, setTanggalKeberangkatan] = useState("")
  const [sisaCutiTahunan, setSisaCutiTahunan] = useState(0)
  const [tanggalCutiPeriodikBerikutnya, setTanggalCutiPeriodikBerikutnya] = useState("")
  const [daysUntilNextLeave, setDaysUntilNextLeave] = useState<number | null>(null)
  const [catatan, setCatatan] = useState("")
  const [alasan, setAlasan] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && user && user.role !== "hr_site") {
      setError("Hanya HR Site yang dapat membuat pengajuan cuti")
      return
    }
  }, [open, user])

  useEffect(() => {
    if (open) {
      const users = Database.getUsers()
      setAllUsers(users)
    }
  }, [open])

  useEffect(() => {
    if (selectedUserId) {
      const user = allUsers.find((u) => u.id === selectedUserId)
      if (user) {
        setSelectedUser(user)
        setSite(user.site)
        setTanggalKeberangkatan(user.tanggalKeberangkatan || "")
      }
    } else {
      setSelectedUser(null)
    }
  }, [selectedUserId, allUsers])

  useEffect(() => {
    if (tanggalCutiPeriodikBerikutnya) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const nextLeaveDate = new Date(tanggalCutiPeriodikBerikutnya)
      nextLeaveDate.setHours(0, 0, 0, 0)

      const diffTime = nextLeaveDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      setDaysUntilNextLeave(diffDays)
    } else {
      setDaysUntilNextLeave(null)
    }
  }, [tanggalCutiPeriodikBerikutnya])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user || user.role !== "hr_site") {
      setError("Hanya HR Site yang dapat membuat pengajuan cuti")
      return
    }

    if (!selectedUser) return

    if (
      !site ||
      !selectedUserId ||
      !jenisPengajuanCuti ||
      !tanggalPengajuan ||
      !tanggalMulai ||
      !tanggalSelesai ||
      !berangkatDari ||
      !tujuan ||
      !tanggalKeberangkatan ||
      !alasan
    ) {
      setError("Semua field wajib harus diisi")
      return
    }

    if (site !== user.site) {
      setError(`Anda hanya dapat membuat pengajuan untuk site ${user.site}`)
      return
    }

    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      setError("Tanggal selesai harus setelah tanggal mulai")
      return
    }

    setIsSubmitting(true)

    const jumlahHari = calculateDaysBetween(tanggalMulai, tanggalSelesai)

    const newRequest = {
      id: generateId("req"),
      userId: selectedUser.id,
      userName: selectedUser.nama,
      userNik: selectedUser.nik,
      site: selectedUser.site,
      jabatan: selectedUser.jabatan,
      departemen: selectedUser.departemen,
      poh: selectedUser.poh,
      statusKaryawan: selectedUser.statusKaryawan,
      noKtp: selectedUser.noKtp,
      noTelp: selectedUser.noTelp,
      email: selectedUser.email,
      tanggalLahir: selectedUser.tanggalLahir,
      jenisKelamin: selectedUser.jenisKelamin,
      jenisPengajuanCuti,
      tanggalPengajuan,
      tanggalMulai,
      tanggalSelesai,
      jumlahHari,
      berangkatDari,
      tujuan,
      tanggalKeberangkatan,
      sisaCutiTahunan,
      tanggalCutiPeriodikBerikutnya,
      catatan,
      alasan,
      status: "pending_dic" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedBy: user.id,
      submittedByName: user.nama,
    }

    Database.addLeaveRequest(newRequest)

    setSite("")
    setSelectedUserId("")
    setSelectedUser(null)
    setJenisPengajuanCuti("")
    setTanggalPengajuan(new Date().toISOString().split("T")[0])
    setTanggalMulai("")
    setTanggalSelesai("")
    setBerangkatDari("")
    setTujuan("")
    setTanggalKeberangkatan("")
    setSisaCutiTahunan(0)
    setTanggalCutiPeriodikBerikutnya("")
    setCatatan("")
    setAlasan("")
    setIsSubmitting(false)

    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajukan Pengajuan Cuti Baru</DialogTitle>
          <DialogDescription>Isi formulir di bawah ini untuk mengajukan cuti</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Select value={site} onValueChange={setSite} disabled={!!selectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih site" />
              </SelectTrigger>
              <SelectContent>
                {SITES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih karyawan" />
              </SelectTrigger>
              <SelectContent>
                {allUsers
                  .filter((u) => !site || u.site === site)
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nama} ({u.nik})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Tanggal Lahir</Label>
                <p className="text-sm font-medium">
                  {selectedUser.tanggalLahir ? new Date(selectedUser.tanggalLahir).toLocaleDateString("id-ID") : "-"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Jenis Kelamin</Label>
                <p className="text-sm font-medium">{selectedUser.jenisKelamin}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">No KTP</Label>
                <p className="text-sm font-medium">{selectedUser.noKtp}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Jabatan</Label>
                <p className="text-sm font-medium">{selectedUser.jabatan}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Departemen</Label>
                <p className="text-sm font-medium">{selectedUser.departemen}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Site / Lokasi Kerja</Label>
                <p className="text-sm font-medium">{selectedUser.site}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">POH</Label>
                <p className="text-sm font-medium">{selectedUser.poh}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Status Karyawan</Label>
                <p className="text-sm font-medium">{selectedUser.statusKaryawan}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">No Telp</Label>
                <p className="text-sm font-medium">{selectedUser.noTelp}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Email</Label>
                <p className="text-sm font-medium">{selectedUser.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="jenisPengajuanCuti">Jenis Pengajuan Cuti</Label>
            <Select value={jenisPengajuanCuti} onValueChange={setJenisPengajuanCuti}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis pengajuan cuti" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggalPengajuan">Tanggal Pengajuan Cuti</Label>
            <Input
              id="tanggalPengajuan"
              type="date"
              value={tanggalPengajuan}
              onChange={(e) => setTanggalPengajuan(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai">Tanggal Mulai Cuti</Label>
              <Input
                id="tanggalMulai"
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalSelesai">Tanggal Akhir Cuti</Label>
              <Input
                id="tanggalSelesai"
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                required
              />
            </div>
          </div>

          {tanggalMulai && tanggalSelesai && new Date(tanggalSelesai) >= new Date(tanggalMulai) && (
            <div className="text-sm text-slate-600">
              Durasi: {calculateDaysBetween(tanggalMulai, tanggalSelesai)} hari
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="berangkatDari">Berangkat dari</Label>
              <Input
                id="berangkatDari"
                type="text"
                placeholder="Lokasi keberangkatan"
                value={berangkatDari}
                onChange={(e) => setBerangkatDari(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tujuan">Tujuan</Label>
              <Input
                id="tujuan"
                type="text"
                placeholder="Lokasi tujuan"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggalKeberangkatan">Tanggal Keberangkatan</Label>
            <Input
              id="tanggalKeberangkatan"
              type="date"
              value={tanggalKeberangkatan}
              onChange={(e) => setTanggalKeberangkatan(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sisaCutiTahunan">Sisa Cuti Tahunan</Label>
              <Input
                id="sisaCutiTahunan"
                type="number"
                min="0"
                placeholder="Jumlah hari"
                value={sisaCutiTahunan}
                onChange={(e) => setSisaCutiTahunan(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalCutiPeriodikBerikutnya">Tanggal Cuti Periodik Berikutnya</Label>
              <Input
                id="tanggalCutiPeriodikBerikutnya"
                type="date"
                value={tanggalCutiPeriodikBerikutnya}
                onChange={(e) => setTanggalCutiPeriodikBerikutnya(e.target.value)}
              />
              {daysUntilNextLeave !== null && (
                <p className="text-sm text-slate-600 mt-1">
                  {daysUntilNextLeave > 0 ? (
                    <span className="font-medium text-blue-600">
                      {daysUntilNextLeave} hari lagi menjelang cuti berikutnya
                    </span>
                  ) : daysUntilNextLeave === 0 ? (
                    <span className="font-medium text-green-600">Cuti periodik hari ini</span>
                  ) : (
                    <span className="font-medium text-orange-600">
                      Tanggal cuti periodik sudah terlewat ({Math.abs(daysUntilNextLeave)} hari yang lalu)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan (Bila Pengajuan tidak sesuai Roster atau tidak sesuai POH)</Label>
            <Textarea
              id="catatan"
              placeholder="Catatan tambahan jika ada"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan</Label>
            <Textarea
              id="alasan"
              placeholder="Jelaskan alasan pengajuan cuti Anda"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              rows={4}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mengirim..." : "Ajukan Cuti"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
