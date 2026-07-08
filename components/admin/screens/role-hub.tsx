"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Icon } from "@/components/shared"
import { LiveDot } from "@/components/admin/admin-shared"
import { adminRoles, type AdminRoleKey, type AdminScreenKey, type AdminUser } from "@/lib/admin-data"

export function RoleHubScreen({
  user,
  navigate,
  onLogout,
}: {
  user: AdminUser
  navigate: (s: AdminScreenKey) => void
  onLogout: () => void
}) {
  const userRoles = adminRoles.filter((r) => user.roles.includes(r.key))

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Decorative BG */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "300px" }}
      />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#D97706] to-[#D4AF37] px-5 pt-8 pb-6 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "220px" }}
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white p-1.5 shadow-lg border border-white/30">
              <Image
                src="/images/khatu-shyam-logo.png"
                alt="Khatu Shyam Ji"
                width={40}
                height={40}
                className="size-full object-contain"
              />
            </span>
            <div>
              <p className="font-heading text-lg font-bold tracking-wide drop-shadow-sm">
                Temple Operations
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                Command Center
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="grid size-10 place-items-center rounded-xl bg-white/20 transition hover:bg-white/30"
            title="Logout"
          >
            <Icon name="LogOut" className="size-5 text-white" />
          </button>
        </div>

        {/* Admin Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mt-5 flex items-center gap-3 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 p-4"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-white font-heading text-xl font-bold text-[#D97706] shadow-inner shrink-0">
            {user.initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-white/70">Jai Shree Shyam</p>
            <p className="font-heading text-lg font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-white/80">{user.email}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-white/60">Last login</p>
            <p className="text-[11px] font-semibold text-white/90">{user.lastLogin.split(",")[1]?.trim()}</p>
          </div>
        </motion.div>
      </div>

      {/* Role Cards */}
      <div className="relative w-full max-w-[1700px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Your Workspaces</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {userRoles.length} role{userRoles.length !== 1 ? "s" : ""} assigned
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <LiveDot color="bg-green-500" />
            All systems online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {userRoles.map((role, i) => (
            <motion.button
              key={role.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(role.screen)}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:shadow-lg hover:border-[#FFB74D] active:scale-[0.98]"
            >
              {/* Gradient accent top bar */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${role.color}`} />

              <div className="flex items-start justify-between">
                <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${role.color} text-white shadow-lg`}>
                  <Icon name={role.icon} className="size-6" />
                </span>
                {role.notifications > 0 && (
                  <span className="flex size-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white shadow-md">
                    {role.notifications}
                  </span>
                )}
              </div>

              <h3 className="mt-3 font-heading text-sm font-bold text-foreground leading-tight">
                {role.name}
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                {role.description}
              </p>

              {/* Live stat */}
              {role.liveCount !== undefined && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <LiveDot color={role.liveCount > 0 ? "bg-green-500" : "bg-gray-400"} />
                    <span className="text-[10px] font-medium text-muted-foreground">{role.liveLabel}</span>
                  </div>
                  <span className="font-heading text-sm font-bold text-foreground">
                    {typeof role.liveCount === "number" ? role.liveCount.toLocaleString() : role.liveCount}
                  </span>
                </div>
              )}

              {/* Arrow */}
              <div className="mt-3 flex items-center gap-1 text-[#D97706]">
                <span className="text-[11px] font-bold">Open Workspace</span>
                <Icon name="ArrowRight" className="size-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-heading tracking-widest text-muted-foreground">
            DIGITAL DARSHAN · ADMIN V2.0
          </p>
        </div>
      </div>
    </div>
  )
}
