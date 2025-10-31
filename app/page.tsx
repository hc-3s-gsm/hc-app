"use client"
import { useRouter } from "next/navigation"
import { Users, Presentation, UserCheck, CalendarCheck, Lock } from "lucide-react"

export default function Home() {
  const router = useRouter()

  const features = [
    {
      title: "Leadership Activity",
      icon: Users,
      href: "/leadership-activity",
      requiresLogin: false,
    },
    {
      title: "Penilaian Presentasi",
      icon: Presentation,
      href: "/penilaian-presentasi",
      requiresLogin: false,
    },
    {
      title: "Assessment Karyawan",
      icon: UserCheck,
      href: "/assessment-karyawan",
      requiresLogin: false,
    },
    {
      title: "Pengajuan Cuti",
      icon: CalendarCheck,
      href: "/login",
      requiresLogin: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/50">
              <span className="text-3xl font-bold text-black">HC</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Human Capital Portal</h1>
          <p className="text-gray-400">PT. Sarana Sukses Sejahtera - PT Gunungmas Sukses Makmur</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <button
                key={feature.title}
                onClick={() => router.push(feature.href)}
                className="group bg-[#1a1a1a] hover:bg-[#222222] rounded-2xl p-8 transition-all duration-300 border border-[#2a2a2a] hover:border-[#D4AF37]/30 flex flex-col items-center justify-center gap-6 min-h-[200px] relative shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/25"
              >
                {feature.requiresLogin && (
                  <div className="absolute top-3 right-3 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Login Required
                  </div>
                )}
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                  <Icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h2 className="text-xl font-semibold text-white text-center">{feature.title}</h2>
              </button>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-[#2a2a2a]">
        © 2025 PT. Sarana Sukses Sejahtera - PT Gunungmas Sukses Makmur | YAN
      </footer>
    </div>
  )
}
