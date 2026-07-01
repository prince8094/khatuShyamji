"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, LiveDot, ActivityItem } from "@/components/admin/admin-shared"
import { emergencyTypes, type AdminScreenKey } from "@/lib/admin-data"

type DevoteeIncident = {
  id: string
  devoteeName: string
  phone: string
  incidentType: "medical" | "fire" | "crowd" | "security"
  locationText: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "acknowledged" | "dispatched" | "resolved"
  assignedTeam: string
  details: string
  time: string
  resolutionDetails?: string
}

const initialIncidents: DevoteeIncident[] = [
  { id: "INC-2026-001", devoteeName: "Nand Kumar", phone: "+91 98765 43210", incidentType: "medical", locationText: "Queue Complex Section 4, Gate 2", severity: "high", status: "pending", assignedTeam: "", details: "Elderly devotee experiencing extreme breathlessness and chest tightness due to congestion.", time: "10 mins ago" },
  { id: "INC-2026-002", devoteeName: "Amit Patel", phone: "+91 99887 76655", incidentType: "crowd", locationText: "Entrance Gate 1 Outer Courtyard", severity: "critical", status: "dispatched", assignedTeam: "Security Shift Alpha", details: "Crowd surge causing barricade pressure. Direct push alert required.", time: "25 mins ago" },
  { id: "INC-2026-003", devoteeName: "Ramesh Gupta", phone: "+91 94140 11223", incidentType: "fire", locationText: "Prasad Kitchen exhaust exhaust zone", severity: "critical", status: "resolved", assignedTeam: "Fire Team A", details: "Exhaust smoke reported near storage racks. Resolved safely.", time: "1 hour ago", resolutionDetails: "Exhaust fan blockage cleared. All sensors back to green." },
]

export function EmergencyOpsScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [incidents, setIncidents] = useState<DevoteeIncident[]>(initialIncidents)
  const [activityLogs, setActivityLogs] = useState<any[]>([
    { id: "act-1", time: "11:30 AM", action: "INC-2026-003 status resolved by Fire Team A", actor: "Prince G." },
    { id: "act-2", time: "11:15 AM", action: "Security Shift Alpha dispatched to Gate 1 surge", actor: "Prince G." },
  ])

  // Modals state
  const [dispatchId, setDispatchId] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState("Medical Team A")

  const [escalateId, setEscalateId] = useState<string | null>(null)
  const [escalationNote, setEscalationNote] = useState("")
  const [escalateSupervisorCode, setEscalateSupervisorCode] = useState("")

  const [resolveId, setResolveId] = useState<string | null>(null)
  const [resolveNotes, setResolveNotes] = useState("")
  const [resolveSuccess, setResolveSuccess] = useState("")

  // Calculations
  const activeCount = incidents.filter(i => i.status !== "resolved").length
  const pendingCount = incidents.filter(i => i.status === "pending").length
  const criticalCount = incidents.filter(i => i.severity === "critical" && i.status !== "resolved").length

  const handleAcknowledge = (id: string) => {
    setIncidents(prev =>
      prev.map(inc => (inc.id === id ? { ...inc, status: "acknowledged" as const } : inc))
    )
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      { id: `act-${Date.now()}`, time: timeStr, action: `Incident ${id} marked ACKNOWLEDGED`, actor: "Prince G." },
      ...prev,
    ])
  }

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dispatchId) return

    setIncidents(prev =>
      prev.map(inc => (inc.id === dispatchId ? { ...inc, status: "dispatched" as const, assignedTeam: selectedTeam } : inc))
    )

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      { id: `act-${Date.now()}`, time: timeStr, action: `Dispatched ${selectedTeam} to Incident ${dispatchId}`, actor: "Prince G." },
      ...prev,
    ])

    setDispatchId(null)
  }

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!escalateId) return

    // Require supervisor auth code simulation
    if (escalateSupervisorCode !== "SUP-991") {
      alert("Invalid Shift Supervisor Authorization Code!")
      return
    }

    setIncidents(prev =>
      prev.map(inc => (inc.id === escalateId ? { ...inc, severity: "critical" as const, details: `${inc.details} [ESCALATED: ${escalationNote}]` } : inc))
    )

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      { id: `act-${Date.now()}`, time: timeStr, action: `Incident ${escalateId} ESCALATED by Shift Supervisor`, actor: "Prince G." },
      ...prev,
    ])

    setEscalateId(null)
    setEscalationNote("")
    setEscalateSupervisorCode("")
  }

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolveId) return

    setIncidents(prev =>
      prev.map(inc => (inc.id === resolveId ? { ...inc, status: "resolved" as const, resolutionDetails: resolveNotes } : inc))
    )

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      { id: `act-${Date.now()}`, time: timeStr, action: `Incident ${resolveId} RESOLVED: ${resolveNotes}`, actor: "Prince G." },
      ...prev,
    ])

    setResolveId(null)
    setResolveNotes("")
  }

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case "medical": return "Heart"
      case "fire": return "Flame"
      case "crowd": return "Users"
      default: return "ShieldAlert"
    }
  }

  const renderDispatchModal = () => {
    if (!dispatchId) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold text-foreground">Dispatch Emergency Responder</h3>
            <button onClick={() => setDispatchId(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleDispatchSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Select Response Unit</label>
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:outline-none focus:border-red-600"
              >
                <option value="Medical Team A (On-Site)">Medical Team A (On-Site Camp)</option>
                <option value="Emergency Ambulance Unit 1">Ambulance Emergency 108</option>
                <option value="Security Shift Alpha">Security Shift Alpha (Main Gate)</option>
                <option value="Q-Control Volunteers Team 3">Q-Control Volunteers Team 3</option>
                <option value="Fire Response Team A">Fire Response Team A</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setDispatchId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Dispatch Responder Unit
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  const renderEscalateModal = () => {
    if (!escalateId) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <div className="flex items-center gap-2 text-red-600">
              <Icon name="AlertOctagon" className="size-5" />
              <h3 className="font-heading text-base font-bold text-foreground">Escalate Crisis Incident</h3>
            </div>
            <button onClick={() => setEscalateId(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleEscalateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Escalation Justification</label>
              <textarea
                required
                rows={3}
                placeholder="Describe critical issues requiring emergency command clearance..."
                value={escalationNote}
                onChange={e => setEscalationNote(e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-medium focus:border-red-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Shift Supervisor Auth Code *</label>
              <input
                type="password"
                required
                placeholder="e.g. SUP-991"
                value={escalateSupervisorCode}
                onChange={e => setEscalateSupervisorCode(e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-bold focus:border-red-600"
              />
              <p className="text-[9px] text-muted-foreground mt-0.5">Authorization code is required for high-severity dispatch upgrades.</p>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setEscalateId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Confirm Escalation
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  const renderResolveModal = () => {
    if (!resolveId) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold text-foreground">Log Incident Resolution</h3>
            <button onClick={() => setResolveId(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Resolution Report Details *</label>
              <textarea
                required
                rows={4}
                placeholder="Detail resolution actions taken, patient transfer locations, or queue security cleared reports..."
                value={resolveNotes}
                onChange={e => setResolveNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-medium focus:border-red-600 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setResolveId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Resolve Incident & Close Card
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header operations banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Emergency Dispatch Console</h1>
            <p className="text-xs text-white/80 mt-1">Devotee SOS incident tracking & responder rotations</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Siren" className="size-6 text-white" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Active Incidents", value: activeCount },
            { label: "Reported SOS", value: pendingCount },
            { label: "Critical Priority", value: criticalCount },
            { label: "Resolved Today", value: incidents.filter(i => i.status === "resolved").length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-2 py-2.5 text-center border border-white/5">
              <p className="text-[9px] text-white/70 uppercase tracking-wide font-semibold">{s.label}</p>
              <p className="font-heading text-sm font-extrabold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Overview stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="AlertTriangle" label="Pending Dispatch SOS" value={pendingCount} sub="unresolved pilgrim alerts" />
        <MetricCard icon="ShieldCheck" label="Operations status" value={activeCount === 0 ? "ALL CLEAR" : "STANDBY ACTIVE"} sub="live dispatcher monitoring" />
      </div>

      {/* Read-Only Location Map Simulation */}
      <section>
        <AdminSectionTitle title="Live Devotee Locations Map (Read-Only)" icon="MapPin" />
        <div className="relative overflow-hidden rounded-2xl border border-border bg-[#FFF8F0] p-4 text-center shadow-sm h-48 flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "150px" }} />
          <div className="relative space-y-2">
            <div className="flex justify-center gap-6">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1"><LiveDot color="bg-red-500" /> Gate 2 Medical SOS</span>
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1"><LiveDot color="bg-amber-500" /> Gate 1 Crowd Alert</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">GPS integration feeds mapped correctly to pilgrim app coordinates.</p>
            <p className="text-[10px] text-muted-foreground">Coordinates: 27.3785° N, 75.3347° E · Real-time telemetry</p>
          </div>
        </div>
      </section>

      {/* Devotee SOS Incident Queue list */}
      <section>
        <AdminSectionTitle
          title="Active Devotee Incidents Queue"
          icon="ClipboardList"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
              <LiveDot color="bg-red-500" /> Dispatch Board Active
            </span>
          }
        />
        <div className="space-y-4">
          {incidents
            .filter(i => i.status !== "resolved")
            .map((inc) => (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 shadow-sm ${inc.severity === "critical" ? "bg-red-50/40 border-red-200" : "bg-card border-border"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 place-items-center rounded-xl shadow-sm ${inc.severity === "critical" ? "bg-red-600 text-white animate-pulse" : "bg-red-50 text-red-600"
                      }`}>
                      <Icon name={getIncidentIcon(inc.incidentType)} className="size-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-sm font-bold text-foreground">{inc.devoteeName}</p>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-muted-foreground">{inc.id}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${inc.severity === "critical" ? "bg-red-200 text-red-900" :
                            inc.severity === "high" ? "bg-orange-100 text-orange-800" :
                              "bg-blue-100 text-blue-800"
                          }`}>
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Location: <span className="font-bold text-foreground">{inc.locationText}</span></p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase ${inc.status === "pending" ? "bg-red-100 text-red-800 border-red-200 animate-pulse" :
                      inc.status === "acknowledged" ? "bg-amber-100 text-amber-800 border-amber-200" :
                        "bg-blue-100 text-blue-800 border-blue-200"
                    }`}>
                    <span className={`size-1 rounded-full ${inc.status === "pending" ? "bg-red-500" :
                        inc.status === "acknowledged" ? "bg-amber-500" : "bg-blue-500"
                      }`} />
                    {inc.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mt-3 bg-muted/40 p-2.5 rounded-xl border border-border/40 font-medium">
                  {inc.details}
                </p>

                {inc.assignedTeam && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 w-fit">
                    <Icon name="Truck" className="size-3.5" />
                    Response Dispatched: {inc.assignedTeam}
                  </div>
                )}

                {/* Workflow lifecycle buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                  {inc.status === "pending" && (
                    <button
                      onClick={() => handleAcknowledge(inc.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 py-2 text-xs font-bold text-white shadow-sm"
                    >
                      Acknowledge SOS
                    </button>
                  )}

                  {inc.status !== "pending" && !inc.assignedTeam && (
                    <button
                      onClick={() => {
                        setDispatchId(inc.id)
                        setSelectedTeam("Medical Team A (On-Site)")
                      }}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2 text-xs font-bold text-white shadow-sm"
                    >
                      Dispatch Team
                    </button>
                  )}

                  {inc.status === "dispatched" && (
                    <button
                      onClick={() => setResolveId(inc.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-green-600 hover:bg-green-700 py-2 text-xs font-bold text-white shadow-sm"
                    >
                      Resolve Incident
                    </button>
                  )}

                  {inc.severity !== "critical" && (
                    <button
                      onClick={() => setEscalateId(inc.id)}
                      className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 text-xs font-bold"
                    >
                      Escalate Alert
                    </button>
                  )}

                  <span className="text-[10px] text-muted-foreground font-semibold ml-auto">Reported: {inc.time}</span>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* Incident Log (Resolved) */}
      <section>
        <AdminSectionTitle title="Incident Log (Resolved)" icon="History" />
        <div className="space-y-3">
          {incidents
            .filter(i => i.status === "resolved")
            .map((inc) => (
              <div key={inc.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm opacity-85 hover:opacity-100 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-lg bg-green-50 text-green-600">
                      <Icon name="CheckCircle" className="size-4.5" />
                    </span>
                    <div>
                      <p className="font-heading text-xs font-bold text-foreground">{inc.devoteeName} - Resolved</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">ID: {inc.id} · Dispatched: {inc.assignedTeam}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-green-600 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">RESOLVED</span>
                </div>
                {inc.resolutionDetails && (
                  <p className="text-[11px] text-muted-foreground mt-2 bg-muted/30 p-2 rounded-lg border">
                    <strong>Resolution Report:</strong> {inc.resolutionDetails}
                  </p>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* Modals */}
      {renderDispatchModal()}
      {renderEscalateModal()}
      {renderResolveModal()}
    </div>
  )
}
