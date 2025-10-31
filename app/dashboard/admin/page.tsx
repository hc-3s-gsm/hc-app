"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Building2, Shield, Upload, Download } from "lucide-react"
import { Database } from "@/lib/database"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getRoleLabel } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewUserDialog } from "@/components/new-user-dialog"
import { EditUserDialog } from "@/components/edit-user-dialog"
import { SITES } from "@/lib/mock-data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CSVImportDialog } from "@/components/csv-import-dialog"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [selectedSite, setSelectedSite] = useState<string>("all")
  const [isNewUserOpen, setIsNewUserOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    if (user.role !== "super_admin") {
      router.push("/dashboard")
      return
    }

    loadData()
  }, [user, isAuthenticated, router])

  const loadData = () => {
    const allUsers = Database.getUsers()
    setUsers(allUsers.sort((a, b) => a.nama.localeCompare(b.nama)))
  }

  const handleUserCreated = () => {
    loadData()
    setIsNewUserOpen(false)
    setIsImportOpen(false)
  }

  const handleDownloadTemplate = () => {
    const headers = [
      "nik",
      "nama",
      "email_prefix",
      "password",
      "role",
      "site",
      "jabatan",
      "departemen",
      "poh",
      "status_karyawan",
      "no_ktp",
      "no_telp",
      "tanggal_lahir",
      "jenis_kelamin",
    ]

    const sampleData = [
      [
        "HR001",
        "John Doe",
        "john.doe",
        "password123",
        "user",
        "Head Office",
        "Staff",
        "IT",
        "POH001",
        "Tetap",
        "3201234567890123",
        "081234567890",
        "1990-01-15",
        "Laki-laki",
      ],
      [
        "HR002",
        "Jane Smith",
        "jane.smith",
        "password456",
        "hr_site",
        "Head Office",
        "Manager",
        "HR",
        "POH002",
        "Kontrak",
        "3201234567890124",
        "081234567891",
        "1992-05-20",
        "Perempuan",
      ],
    ]

    const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "template_import_karyawan.csv"
    link.click()
  }

  const handleExportUsers = () => {
    const headers = [
      "nik",
      "nama",
      "email_prefix",
      "password",
      "role",
      "site",
      "jabatan",
      "departemen",
      "poh",
      "status_karyawan",
      "no_ktp",
      "no_telp",
      "tanggal_lahir",
      "jenis_kelamin",
    ]

    const userData = users.map((user) => [
      user.nik,
      user.nama,
      user.email.split("@")[0], // Extract email prefix
      "********", // Don't export actual passwords
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
    ])

    const csvContent = [headers.join(","), ...userData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `export_karyawan_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleUserUpdated = () => {
    loadData()
    setEditingUser(null)
  }

  const handleDeleteUser = () => {
    if (deletingUser) {
      Database.deleteUser(deletingUser.id)
      loadData()
      setDeletingUser(null)
    }
  }

  const filteredUsers = selectedSite === "all" ? users : users.filter((u) => u.site === selectedSite)

  const stats = {
    total: users.length,
    hrSite: users.filter((u) => u.role === "hr_site").length,
    atasan: users.filter((u) => u.role === "atasan_langsung").length,
    pjo: users.filter((u) => u.role === "pjo_site").length,
    hrHo: users.filter((u) => u.role === "hr_ho").length,
    ticketing: users.filter((u) => u.role === "hr_ticketing").length,
    admin: users.filter((u) => u.role === "super_admin").length,
  }

  if (!user) return null

  return (
    <DashboardLayout title="Dashboard Super Admin">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HR Site</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hrSite}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approvers</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.atasan + stats.pjo + stats.hrHo}</div>
              <p className="text-xs text-muted-foreground">Atasan, PJO, HR HO</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin & Ticketing</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ticketing + stats.admin}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Manajemen Pengguna</CardTitle>
                <CardDescription>Kelola akun pengguna sistem</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <select
                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                  >
                    <option value="all">Semua Site</option>
                    {SITES.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Template CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportUsers}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button onClick={() => setIsNewUserOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Tambah Pengguna
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Semua ({filteredUsers.length})</TabsTrigger>
                <TabsTrigger value="hr_site">
                  HR Site ({filteredUsers.filter((u) => u.role === "hr_site").length})
                </TabsTrigger>
                <TabsTrigger value="approvers">
                  Approvers (
                  {
                    filteredUsers.filter(
                      (u) => u.role === "atasan_langsung" || u.role === "pjo_site" || u.role === "hr_ho",
                    ).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="admin">
                  Admin ({filteredUsers.filter((u) => u.role === "hr_ticketing" || u.role === "super_admin").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <UserTable
                  users={filteredUsers}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                  currentUserId={user.id}
                />
              </TabsContent>

              <TabsContent value="hr_site">
                <UserTable
                  users={filteredUsers.filter((u) => u.role === "hr_site")}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                  currentUserId={user.id}
                />
              </TabsContent>

              <TabsContent value="approvers">
                <UserTable
                  users={filteredUsers.filter(
                    (u) => u.role === "atasan_langsung" || u.role === "pjo_site" || u.role === "hr_ho",
                  )}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                  currentUserId={user.id}
                />
              </TabsContent>

              <TabsContent value="admin">
                <UserTable
                  users={filteredUsers.filter((u) => u.role === "hr_ticketing" || u.role === "super_admin")}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                  currentUserId={user.id}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <NewUserDialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen} onSuccess={handleUserCreated} />
      <CSVImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} onSuccess={handleUserCreated} />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={handleUserUpdated}
        />
      )}

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna <strong>{deletingUser?.nama}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  currentUserId: string
}

function UserTable({ users, onEdit, onDelete, currentUserId }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">Tidak ada pengguna</p>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-3 font-medium text-slate-700">NIK</th>
            <th className="text-left p-3 font-medium text-slate-700">Nama</th>
            <th className="text-left p-3 font-medium text-slate-700">Tanggal Lahir</th>
            <th className="text-left p-3 font-medium text-slate-700">Jenis Kelamin</th>
            <th className="text-left p-3 font-medium text-slate-700">Email</th>
            <th className="text-left p-3 font-medium text-slate-700">Role</th>
            <th className="text-left p-3 font-medium text-slate-700">Site</th>
            <th className="text-left p-3 font-medium text-slate-700">Jabatan</th>
            <th className="text-left p-3 font-medium text-slate-700">Tanggal Keberangkatan</th>
            <th className="text-right p-3 font-medium text-slate-700">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-slate-200 hover:bg-slate-50">
              <td className="p-3 font-medium">{user.nik}</td>
              <td className="p-3">{user.nama}</td>
              <td className="p-3 text-slate-600">
                {user.tanggalLahir ? new Date(user.tanggalLahir).toLocaleDateString("id-ID") : "-"}
              </td>
              <td className="p-3 text-slate-600">{user.jenisKelamin}</td>
              <td className="p-3 text-slate-600">{user.email}</td>
              <td className="p-3">
                <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
              </td>
              <td className="p-3 text-slate-600">{user.site}</td>
              <td className="p-3 text-slate-600">{user.jabatan}</td>
              <td className="p-3 text-slate-600">
                {user.tanggalKeberangkatan ? new Date(user.tanggalKeberangkatan).toLocaleDateString("id-ID") : "-"}
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(user)}
                    disabled={user.id === currentUserId}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
