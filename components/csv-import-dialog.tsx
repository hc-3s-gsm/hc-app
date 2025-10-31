"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ParsedUser {
  nik: string
  nama: string
  emailPrefix: string
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
}

const VALID_ROLES = ["admin", "user", "approver", "super_admin"]
const VALID_SITES = ["Jakarta", "Bandung", "Surabaya", "Medan", "Makassar"]
const VALID_STATUS = ["Aktif", "Non-Aktif", "Cuti"]

export function CSVImportDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string[]
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setResult(null)
    } else {
      setResult({
        success: false,
        message: "Please select a valid CSV file",
      })
    }
  }

  const parseCSV = (text: string): ParsedUser[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows")
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    // Validate required headers
    const requiredHeaders = [
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

    const missingHeaders = requiredHeaders.filter(
      (h) => !headers.includes(h)
    )
    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required columns: ${missingHeaders.join(", ")}`
      )
    }

    // Get column indices
    const nikIndex = headers.indexOf("nik")
    const namaIndex = headers.indexOf("nama")
    const emailPrefixIndex = headers.indexOf("email_prefix")
    const passwordIndex = headers.indexOf("password")
    const roleIndex = headers.indexOf("role")
    const siteIndex = headers.indexOf("site")
    const jabatanIndex = headers.indexOf("jabatan")
    const departemenIndex = headers.indexOf("departemen")
    const pohIndex = headers.indexOf("poh")
    const statusKaryawanIndex = headers.indexOf("status_karyawan")
    const noKtpIndex = headers.indexOf("no_ktp")
    const noTelpIndex = headers.indexOf("no_telp")
    const tanggalLahirIndex = headers.indexOf("tanggal_lahir")
    const jenisKelaminIndex = headers.indexOf("jenis_kelamin")

    const parsedUsers: ParsedUser[] = []
    const emailPrefixes = new Set<string>()
    const niks = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())

      if (values.length < requiredHeaders.length) {
        throw new Error(`Row ${i + 1}: Insufficient columns`)
      }

      let emailPrefixValue = values[emailPrefixIndex] || ""
      
      // Handle full email addresses by extracting prefix
      if (emailPrefixValue.includes("@")) {
        emailPrefixValue = emailPrefixValue.split("@")[0]
      }

      const user: ParsedUser = {
        nik: values[nikIndex] || "",
        nama: values[namaIndex] || "",
        emailPrefix: emailPrefixValue,
        password: values[passwordIndex] || "",
        role: values[roleIndex] || "",
        site: values[siteIndex] || "",
        jabatan: values[jabatanIndex] || "",
        departemen: values[departemenIndex] || "",
        poh: values[pohIndex] || "",
        statusKaryawan: values[statusKaryawanIndex] || "",
        noKtp: values[noKtpIndex] || "",
        noTelp: values[noTelpIndex] || "",
        tanggalLahir: values[tanggalLahirIndex] || "",
        jenisKelamin: values[jenisKelaminIndex] || "",
      }

      // Validate required fields
      if (!user.nik) throw new Error(`Row ${i + 1}: NIK is required`)
      if (!user.nama) throw new Error(`Row ${i + 1}: Nama is required`)
      if (!user.emailPrefix)
        throw new Error(`Row ${i + 1}: Email prefix is required`)
      if (!user.password)
        throw new Error(`Row ${i + 1}: Password is required`)

      // Validate role
      if (!VALID_ROLES.includes(user.role)) {
        throw new Error(
          `Row ${i + 1}: Invalid role "${user.role}". Must be one of: ${VALID_ROLES.join(", ")}`
        )
      }

      // Validate site
      if (!VALID_SITES.includes(user.site)) {
        throw new Error(
          `Row ${i + 1}: Invalid site "${user.site}". Must be one of: ${VALID_SITES.join(", ")}`
        )
      }

      // Validate status
      if (!VALID_STATUS.includes(user.statusKaryawan)) {
        throw new Error(
          `Row ${i + 1}: Invalid status "${user.statusKaryawan}". Must be one of: ${VALID_STATUS.join(", ")}`
        )
      }

      // Validate jenis kelamin
      if (!["Laki-laki", "Perempuan"].includes(user.jenisKelamin)) {
        throw new Error(
          `Row ${i + 1}: Invalid jenis kelamin "${user.jenisKelamin}". Must be "Laki-laki" or "Perempuan"`
        )
      }

      // Check for duplicate NIK within the CSV file itself
      if (niks.has(user.nik)) {
        throw new Error(`Row ${i + 1}: NIK duplikat dalam file: ${user.nik}`)
      }
      niks.add(user.nik)

      // Check for duplicate email prefix within the CSV file
      if (emailPrefixes.has(user.emailPrefix)) {
        throw new Error(
          `Row ${i + 1}: Email prefix duplikat dalam file: ${user.emailPrefix}. Setiap karyawan harus memiliki email prefix yang unik.`
        )
      }
      emailPrefixes.add(user.emailPrefix)

      parsedUsers.push(user)
    }

    return parsedUsers
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const text = await file.text()
      const parsedUsers = parseCSV(text)

      // Import users one by one
      const results = []
      for (const user of parsedUsers) {
        try {
          const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nik: user.nik,
              nama: user.nama,
              email: `${user.emailPrefix}@3s-gsm.com`,
              password: user.password,
              role: user.role,
              site: user.site,
              jabatan: user.jabatan,
              departemen: user.departemen,
              poh: user.poh,
              statusKaryawan: user.statusKaryawan,
              noKtp: user.noKtp,
              noTelp: user.noTelp,
              tanggalLahir: user.tanggalLahir,
              jenisKelamin: user.jenisKelamin,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            results.push(`❌ ${user.nik} - ${user.nama}: ${error.error}`)
          } else {
            results.push(`✓ ${user.nik} - ${user.nama}`)
          }
        } catch (error) {
          results.push(
            `❌ ${user.nik} - ${user.nama}: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        }
      }

      const successCount = results.filter((r) => r.startsWith("✓")).length
      const failCount = results.length - successCount

      setResult({
        success: failCount === 0,
        message:
          failCount === 0
            ? `Successfully imported ${successCount} users`
            : `Imported ${successCount} users, ${failCount} failed`,
        details: results,
      })

      if (failCount === 0) {
        setTimeout(() => {
          setOpen(false)
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to import CSV",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with user data. Required columns: nik, nama,
            email_prefix, password, role, site, jabatan, departemen, poh,
            status_karyawan, no_ktp, no_telp, tanggal_lahir, jenis_kelamin
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={importing}
            />
          </div>

          {result && (
            <Alert
              variant={result.success ? "default" : "destructive"}
              className="mt-4"
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="font-medium">{result.message}</div>
                {result.details && (
                  <div className="mt-2 max-h-[200px] overflow-y-auto text-sm">
                    {result.details.map((detail, i) => (
                      <div key={i} className="py-1">
                        {detail}
                      </div>
                    ))}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
