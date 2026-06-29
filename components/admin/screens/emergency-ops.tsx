"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, QuickAction, LiveDot, ActivityItem, AlertBanner } from "@/components/admin/admin-shared"
import { emergencyTypes, type AdminScreenKey } from "@/lib/admin-data"

const incidentLog = [
  { id: "INC-01", type: "medical", title: "Devotee fainted near Gate 2", status: "resolved", time: "10:30 AM", handler: "Medical Team A" },
  { id: "INC-02", type: "crowd", title: "Crowd surge at main entrance", status: "resolved", time: "09:15 AM", handler: "Security Team" },
  { id: "INC-03", type: "medical", title: "Minor injury — child tripped", status: "resolved", time: "08:45 AM", handler: "Medical Team B" },
]

const emergencyContacts = [
  { name: "Police Control Room", phone: "100", icon: "Shield" },
  { name: "Ambulance", phone: "108", icon: "Siren" },
  { name: "Fire Station", phone: "101", icon: "Flame" },
  { name: "Temple Security", phone: "01576-230011", icon: "ShieldCheck" },
  { name: "District Control Room", phone: "112", icon: "Phone" },
  { name: "Medical Camp (On-site)", phone: "01576-230022", icon: "Heart" },
]

export function EmergencyOpsScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [composing, setComposing] = useState(false)
  const [alertType, setAlertType] = useState("")
  const [alertMsg, setAlertMsg] = useState("")
  const activeIncidents = 0

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Emergency Operations</h1>
            <p className="text-sm text-white/80 mt-1">Alerts, incidents & crowd control</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Siren" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Active Incidents", value: activeIncidents },
            { label: "Resolved Today", value: incidentLog.length },
            { label: "Status", value: "ALL CLEAR" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-base font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status Banner */}
      {activeIncidents === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
          <span className="grid size-9 place-items-center rounded-xl bg-green-100 text-green-600">
            <Icon name="ShieldCheck" className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-green-700">All Clear</p>
            <p className="text-[11px] text-green-600">No active emergency incidents</p>
          </div>
          <LiveDot color="bg-green-500" />
        </div>
      ) : (
        <AlertBanner type="emergency" message={`${activeIncidents} active emergency incidents!`} />
      )}

      {/* Quick Alert Types */}
      <section>
        <AdminSectionTitle title="Quick Alert" icon="Zap" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {emergencyTypes.map((et) => (
            <motion.button
              key={et.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setComposing(true); setAlertType(et.key) }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition-all hover:shadow-md hover:border-red-200"
            >
              <span className={`grid size-10 place-items-center rounded-xl ${et.color} text-white shadow-sm`}>
                <Icon name={et.icon} className="size-5" />
              </span>
              <span className="text-[10px] font-bold text-foreground leading-tight">{et.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Alert Composer */}
      <AnimatePresence>
        {composing && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-red-700">
                Compose Emergency Alert — {emergencyTypes.find((e) => e.key === alertType)?.label}
              </h3>
              <button onClick={() => setComposing(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder="Describe the emergency…"
                value={alertMsg}
                onChange={(e) => setAlertMsg(e.target.value)}
                className="resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-heading text-sm font-bold text-white shadow-md transition hover:bg-red-700 active:scale-[0.98]">
                  <Icon name="Siren" className="size-4" />
                  Send Alert
                </button>
                <button onClick={() => setComposing(false)} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 font-heading text-sm font-bold text-foreground transition hover:bg-muted/50">
                  Cancel
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Emergency Contacts */}
      <section>
        <AdminSectionTitle title="Emergency Contacts" icon="Phone" />
        <div className="grid grid-cols-2 gap-2">
          {emergencyContacts.map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm transition hover:border-red-200 hover:bg-red-50/30"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-600 shrink-0">
                <Icon name={contact.icon} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-foreground truncate">{contact.name}</p>
                <p className="text-[11px] font-mono font-semibold text-red-600">{contact.phone}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Crowd Control Status */}
      <section>
        <AdminSectionTitle title="Crowd Control" icon="Users" />
        <div className="grid grid-cols-3 gap-2">
          {[
            { gate: "Gate 1", status: "Normal", color: "bg-green-50 border-green-200 text-green-700" },
            { gate: "Gate 2", status: "Busy", color: "bg-amber-50 border-amber-200 text-amber-700" },
            { gate: "Gate 3", status: "Normal", color: "bg-green-50 border-green-200 text-green-700" },
          ].map((g) => (
            <div key={g.gate} className={`rounded-xl border px-3 py-2.5 text-center ${g.color}`}>
              <p className="text-[10px] font-medium">{g.gate}</p>
              <p className="text-xs font-bold mt-0.5">{g.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Medical Camp */}
      <section>
        <AdminSectionTitle title="Medical Camp Status" icon="Heart" />
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Doctors</p>
              <p className="font-heading text-lg font-bold text-green-600">4</p>
              <p className="text-[10px] text-green-600">On duty</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Patients Today</p>
              <p className="font-heading text-lg font-bold text-foreground">23</p>
              <p className="text-[10px] text-muted-foreground">treated</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Ambulances</p>
              <p className="font-heading text-lg font-bold text-green-600">2</p>
              <p className="text-[10px] text-green-600">standby</p>
            </div>
          </div>
        </div>
      </section>

      {/* Incident Log */}
      <section>
        <AdminSectionTitle title="Incident Log" icon="ClipboardList" action={<span className="text-[11px] text-muted-foreground">Today</span>} />
        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm">
          {incidentLog.map((inc) => (
            <ActivityItem
              key={inc.id}
              time={inc.time}
              action={`${inc.title} — ${inc.handler}`}
              department="emergency"
              actor={inc.status}
              icon={emergencyTypes.find((e) => e.key === inc.type)?.icon || "Siren"}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
