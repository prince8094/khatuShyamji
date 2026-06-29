"use client"

import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, QuickAction, ActivityItem, LiveDot } from "@/components/admin/admin-shared"
import { sevaBookings, type AdminScreenKey } from "@/lib/admin-data"

export function SevaManagementScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const confirmed = sevaBookings.filter((s) => s.status === "confirmed").length
  const pending = sevaBookings.filter((s) => s.status === "pending").length
  const completed = sevaBookings.filter((s) => s.status === "completed").length
  const totalRevenue = sevaBookings.filter((s) => s.status !== "cancelled").reduce((a, s) => a + s.amount, 0)

  const statusStyle: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: "bg-green-50 border-green-200", text: "text-green-700" },
    pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    completed: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    cancelled: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#DB2777] to-[#BE185D] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Seva Management</h1>
            <p className="text-sm text-white/80 mt-1">Puja bookings, slots & devotee sevas</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Heart" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Today's Sevas", value: sevaBookings.length },
            { label: "Confirmed", value: confirmed },
            { label: "Pending", value: pending },
            { label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-2 py-2 text-center">
              <p className="text-[9px] text-white/70">{s.label}</p>
              <p className="font-heading text-base font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="IndianRupee" label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub="today's sevas" />
        <MetricCard icon="CheckCircle" label="Completed" value={completed} sub="sevas performed" />
      </div>

      {/* Quick Actions */}
      <section>
        <AdminSectionTitle title="Quick Actions" icon="Zap" />
        <div className="grid grid-cols-3 gap-2">
          <QuickAction icon="Plus" label="Add Seva" />
          <QuickAction icon="CalendarX" label="Block Slots" variant="danger" />
          <QuickAction icon="Bell" label="Send Reminder" />
        </div>
      </section>

      {/* Seva Cards */}
      <section>
        <AdminSectionTitle title="Today's Schedule" icon="Calendar" action={
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
            <LiveDot color="bg-green-500" /> Live
          </span>
        } />
        <div className="space-y-3">
          {sevaBookings.map((seva) => {
            const ss = statusStyle[seva.status]
            return (
              <motion.div
                key={seva.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-pink-50 text-pink-600 shadow-sm">
                      <Icon name="Heart" className="size-5" />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground">{seva.sevaName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{seva.devoteeName}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${ss.bg} ${ss.text}`}>
                    {seva.status.charAt(0).toUpperCase() + seva.status.slice(1)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Time</p>
                    <p className="font-heading text-xs font-bold">{seva.timeSlot}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Amount</p>
                    <p className="font-heading text-xs font-bold text-pink-600">₹{seva.amount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">ID</p>
                    <p className="font-heading text-xs font-bold">{seva.id}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon name="Phone" className="size-3" /> {seva.phone}
                  </div>
                  <button className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:text-[#B45309] transition">
                    Manage <Icon name="ArrowRight" className="size-3" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
