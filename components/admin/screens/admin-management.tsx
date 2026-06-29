"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, QuickAction, LiveDot } from "@/components/admin/admin-shared"
import { adminUsers, adminRoles, type AdminScreenKey } from "@/lib/admin-data"

export function AdminManagementScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const activeCount = adminUsers.filter((u) => u.isActive).length

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#B45309] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Admin Management</h1>
            <p className="text-sm text-white/80 mt-1">User accounts, roles & access control</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Users" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Total Admins", value: adminUsers.length },
            { label: "Active", value: activeCount },
            { label: "Inactive", value: adminUsers.length - activeCount },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <QuickAction icon="UserPlus" label="Create Admin" onClick={() => setShowCreateForm(true)} />
        <QuickAction icon="Key" label="Reset Password" />
        <QuickAction icon="Shield" label="Assign Roles" />
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#FFB74D] bg-[#FFF8F0] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Create New Admin</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. Ramesh Sharma" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Phone</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Email</label>
              <input type="email" placeholder="admin@khatushyamji.org" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">Assign Roles</label>
              <div className="grid grid-cols-2 gap-2">
                {adminRoles.map((role) => (
                  <label key={role.key} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 cursor-pointer hover:bg-muted/30 transition">
                    <input type="checkbox" className="size-4 rounded accent-[#D97706]" />
                    <span className="text-[11px] font-semibold text-foreground">{role.name.replace("Temple Operations Command Center", "Super Admin")}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]">
              <Icon name="UserPlus" className="size-4" />
              Create Admin Account
            </button>
          </div>
        </motion.section>
      )}

      {/* Admin User Cards */}
      <section>
        <AdminSectionTitle title="Admin Accounts" icon="Users" action={<span className="text-[11px] text-muted-foreground">{adminUsers.length} accounts</span>} />
        <div className="space-y-3">
          {adminUsers.map((admin) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-card p-4 shadow-sm ${admin.isActive ? "border-border" : "border-red-200 opacity-60"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`grid size-12 place-items-center rounded-2xl font-heading text-lg font-bold shadow-sm shrink-0 ${
                    admin.isActive ? "bg-[#FFF3E0] text-[#D97706]" : "bg-red-50 text-red-400"
                  }`}>
                    {admin.initials}
                  </span>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{admin.name}</p>
                    <p className="text-[11px] text-muted-foreground">{admin.email}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{admin.phone}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                    admin.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    <span className={`size-1.5 rounded-full ${admin.isActive ? "bg-green-500" : "bg-red-500"}`} />
                    {admin.isActive ? "Active" : "Disabled"}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{admin.id}</span>
                </div>
              </div>

              {/* Roles */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {admin.roles.map((roleKey) => {
                  const role = adminRoles.find((r) => r.key === roleKey)
                  return role ? (
                    <span key={roleKey} className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-1 text-[10px] font-semibold text-foreground">
                      <Icon name={role.icon} className="size-3 text-[#D97706]" />
                      {role.name.replace("Temple Operations Command Center", "Super Admin").split(" ").slice(0, 2).join(" ")}
                    </span>
                  ) : null
                })}
              </div>

              {/* Last login & Actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Icon name="Clock" className="size-3" /> Last: {admin.lastLogin}
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition" title="Edit">
                    <Icon name="Pencil" className="size-3.5" />
                  </button>
                  <button className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition" title="Reset Password">
                    <Icon name="Key" className="size-3.5" />
                  </button>
                  <button className={`grid size-8 place-items-center rounded-lg border transition ${
                    admin.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-500 hover:bg-green-50"
                  }`} title={admin.isActive ? "Disable" : "Enable"}>
                    <Icon name={admin.isActive ? "UserX" : "UserCheck"} className="size-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
