"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { adminUsers, type AdminUser, type AdminScreenKey } from "@/lib/admin-data"

const demoAccounts = [
  { label: "Super Admin", id: "ADM-001", password: "admin123" },
  { label: "Hotel Admin", id: "ADM-002", password: "hotel123" },
  { label: "Parking Admin", id: "ADM-003", password: "park123" },
  { label: "Traffic Admin", id: "ADM-004", password: "traffic123" },
  { label: "Lost & Found", id: "ADM-005", password: "lost123" },
]

export function AdminLoginScreen({
  onLogin,
}: {
  onLogin: (user: AdminUser) => void
}) {
  const [adminId, setAdminId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      const found = adminUsers.find(
        (u) => u.id.toLowerCase() === adminId.toLowerCase() && u.isActive,
      )
      if (found) {
        onLogin(found)
      } else {
        setError("Invalid Admin ID or account is disabled")
      }
      setLoading(false)
    }, 800)
  }

  const handleQuickLogin = (id: string) => {
    setAdminId(id)
    setPassword("••••••••")
    const found = adminUsers.find((u) => u.id === id)
    if (found) {
      setLoading(true)
      setTimeout(() => onLogin(found), 600)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] px-4 py-8">
      {/* Decorative background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "300px" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo & Branding */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl border-2 border-[#D4AF37]/30 bg-white p-2 shadow-lg"
          >
            <Image
              src="/images/khatu-shyam-logo.png"
              alt="Khatu Shyam Ji"
              width={64}
              height={64}
              className="size-full object-contain"
            />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-wide">
            Temple Operations
          </h1>
          <p className="mt-1 font-heading text-sm font-medium tracking-[0.2em] text-[#D97706]">
            COMMAND CENTER
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin Portal · Khatu Shyam Ji Dham
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Admin ID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="User" className="size-4" />
                </span>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. ADM-001"
                  className="!pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="Lock" className="size-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="!pl-10 !pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} className="size-4" />
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-medium text-red-600"
              >
                <Icon name="TriangleAlert" className="size-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Icon name="Loader2" className="size-5" />
                </motion.div>
              ) : (
                <>
                  <Icon name="LogIn" className="size-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleQuickLogin(acc.id)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-left transition-all hover:bg-[#FFF3E0] hover:border-[#FFB74D] active:scale-[0.97]"
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-[#FFF3E0] text-[#D97706]">
                    <Icon name="UserCircle" className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{acc.label}</p>
                    <p className="text-[9px] text-muted-foreground">{acc.id}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] font-heading tracking-widest text-muted-foreground">
          JAI SHREE SHYAM · DIGITAL DARSHAN · V2.0
        </p>
      </motion.div>
    </div>
  )
}
