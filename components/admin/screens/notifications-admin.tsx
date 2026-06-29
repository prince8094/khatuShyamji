"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, QuickAction, LiveDot } from "@/components/admin/admin-shared"
import type { AdminScreenKey } from "@/lib/admin-data"

const sentNotifications = [
  { id: "NOT-01", title: "Ekadashi Special Arrangements", body: "Extended darshan hours on 30 Jun. Extra counters open.", department: "Global", sentAt: "29 Jun, 09:15 AM", sentBy: "Rajesh K.", delivered: 12450, icon: "Megaphone" },
  { id: "NOT-02", title: "Parking Block C Full", body: "Use Lot B or Overflow Lot D. Free shuttle available.", department: "Parking", sentAt: "29 Jun, 11:15 AM", sentBy: "Vikram S.", delivered: 8320, icon: "SquareParking" },
  { id: "NOT-03", title: "Traffic Alert — NH-148D", body: "Heavy traffic near Reengus. Expect 30 min delay.", department: "Traffic", sentAt: "29 Jun, 11:30 AM", sentBy: "Anita D.", delivered: 9150, icon: "TrafficCone" },
  { id: "NOT-04", title: "Prasad Counter 4 Ready", body: "Collect your prasad packet at counter 4.", department: "Seva", sentAt: "28 Jun, 02:30 PM", sentBy: "System", delivered: 1, icon: "ShoppingBag" },
]

const templates = [
  { name: "Darshan Closed", body: "Darshan is temporarily closed. We will update once resumed." },
  { name: "Weather Warning", body: "Heavy rain expected. Please carry umbrellas and wear non-slip footwear." },
  { name: "Parking Full", body: "All parking lots are full. Please use alternative transport." },
  { name: "Festival Notice", body: "Special arrangements for [Festival]. Extended timings and extra security." },
]

export function NotificationsAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [composing, setComposing] = useState(false)
  const [form, setForm] = useState({ title: "", body: "", department: "Global", scheduled: false, scheduleTime: "" })

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Notifications</h1>
            <p className="text-sm text-white/80 mt-1">Compose, send & manage notifications</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Bell" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Sent Today", value: sentNotifications.length },
            { label: "Total Delivered", value: `${(sentNotifications.reduce((a, n) => a + n.delivered, 0) / 1000).toFixed(1)}K` },
            { label: "Templates", value: templates.length },
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
        <QuickAction icon="Plus" label="Compose" onClick={() => setComposing(true)} />
        <QuickAction icon="Clock" label="Schedule" />
        <QuickAction icon="FileText" label="Templates" />
      </div>

      {/* Composer */}
      {composing && (
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#FFB74D] bg-[#FFF8F0] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Compose Notification</h3>
            <button onClick={() => setComposing(false)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {["Global", "Accommodation", "Parking", "Traffic", "Lost & Found", "Seva", "Emergency"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title…" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Message</label>
              <textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your message…" className="resize-none" />
            </div>
            {/* Templates */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Templates</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setForm({ ...form, title: t.name, body: t.body })}
                    className="shrink-0 rounded-xl border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-[#FFF3E0] transition"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]">
              <Icon name="Send" className="size-4" />
              Send Notification
            </button>
          </div>
        </motion.section>
      )}

      {/* Sent Notifications */}
      <section>
        <AdminSectionTitle title="Sent Notifications" icon="Send" action={<span className="text-[11px] text-muted-foreground">{sentNotifications.length} today</span>} />
        <div className="space-y-2">
          {sentNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#FFF3E0] text-[#D97706] shadow-sm shrink-0">
                  <Icon name={notif.icon} className="size-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="font-heading text-sm font-bold text-foreground">{notif.title}</p>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5 shrink-0 ml-2">{notif.department}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{notif.body}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <Icon name="Clock" className="size-3" /> {notif.sentAt}
                    <span className="size-1 rounded-full bg-muted-foreground/30" />
                    <Icon name="User" className="size-3" /> {notif.sentBy}
                    <span className="size-1 rounded-full bg-muted-foreground/30" />
                    <Icon name="Users" className="size-3" /> {notif.delivered.toLocaleString()} delivered
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
