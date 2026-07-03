"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { adminUsers, type AdminUser, type AdminScreenKey } from "@/lib/admin-data"
import { supabase } from "@/lib/supabase"

const demoPasswords: Record<string, string> = {
  "ADM-001": "admin123",
  "ADM-002": "hotel123",
  "ADM-003": "park123",
  "ADM-004": "traffic123",
  "ADM-005": "lost123",
}

const demoAccounts = [
  { label: "Super Admin", id: "ADM-001" },
  { label: "Hotel Admin", id: "ADM-002" },
  { label: "Parking Admin", id: "ADM-003" },
  { label: "Traffic Admin", id: "ADM-004" },
  { label: "Lost & Found", id: "ADM-005" },
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        // Fallback to local mock mode
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
        return
      }

      // 1. Initialize auth on the server (queries db and signs up/links auth.users securely)
      const res = await fetch("/api/admin/auth-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_code: adminId, password })
      })
      const initResult = await res.json()
      if (!initResult.success) {
        setError(initResult.error || "Invalid Admin ID or account is disabled")
        setLoading(false)
        return
      }

      const { email, adminRecord } = initResult.data

      // 2. Authenticate with Supabase password on client
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (signInError) throw signInError

      // 3. Update last login timestamp in background
      await supabase
        .from("admins")
        .update({ last_login: new Date().toISOString() })
        .eq("id", adminRecord.id)

      const roles = adminRecord.admin_roles_bridge 
        ? adminRecord.admin_roles_bridge.map((b: any) => b.role_key)
        : []
      
      const authenticatedAdmin: AdminUser = {
        id: adminRecord.id,
        name: adminRecord.name,
        phone: adminRecord.phone,
        email: adminRecord.email,
        initials: adminRecord.initials,
        roles: roles,
        isActive: adminRecord.is_active,
        lastLogin: adminRecord.last_login 
          ? new Date(adminRecord.last_login).toLocaleString() 
          : "First time logging in"
      }

      onLogin(authenticatedAdmin)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Invalid Admin ID or incorrect password")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (id: string) => {
    const pw = demoPasswords[id] || "admin123"
    setAdminId(id)
    setPassword(pw)
    setLoading(true)
    setError("")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        const found = adminUsers.find((u) => u.id === id)
        if (found) {
          setTimeout(() => onLogin(found), 600)
        } else {
          setLoading(false)
        }
        return
      }

      // Initialize auth on the server
      const res = await fetch("/api/admin/auth-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_code: id, password: pw })
      })
      const initResult = await res.json()
      if (!initResult.success) {
        // Fallback to local admin
        const found = adminUsers.find((u) => u.id === id)
        if (found) {
          setTimeout(() => onLogin(found), 600)
        } else {
          setError("Quick Login failed. Admin account not synced.")
          setLoading(false)
        }
        return
      }

      const { email, adminRecord } = initResult.data

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: pw,
      })

      if (signInError) throw signInError

      await supabase
        .from("admins")
        .update({ last_login: new Date().toISOString() })
        .eq("id", adminRecord.id)

      const roles = adminRecord.admin_roles_bridge 
        ? adminRecord.admin_roles_bridge.map((b: any) => b.role_key)
        : []
      
      const authenticatedAdmin: AdminUser = {
        id: adminRecord.id,
        name: adminRecord.name,
        phone: adminRecord.phone,
        email: adminRecord.email,
        initials: adminRecord.initials,
        roles: roles,
        isActive: adminRecord.is_active,
        lastLogin: adminRecord.last_login 
          ? new Date(adminRecord.last_login).toLocaleString() 
          : "First time logging in"
      }

      onLogin(authenticatedAdmin)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Quick Login failed. Admin account not synced.")
    } finally {
      setLoading(false)
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
