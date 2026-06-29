"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, LiveDot, QuickAction, ActivityItem } from "@/components/admin/admin-shared"
import { trafficAlerts, type AdminScreenKey } from "@/lib/admin-data"

const routes = [
  { name: "NH-148D (Jaipur → Khatu)", status: "moderate", icon: "ArrowRight", eta: "1h 45m" },
  { name: "NH-148D (Delhi → Khatu)", status: "smooth", icon: "ArrowRight", eta: "5h 20m" },
  { name: "Sikar Road", status: "light", icon: "ArrowRight", eta: "40m" },
  { name: "Temple Approach Road", status: "heavy", icon: "ArrowRight", eta: "15m" },
]

export function TrafficOpsScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [composing, setComposing] = useState(false)
  const [alertForm, setAlertForm] = useState({ route: "", severity: "low", message: "" })
  const activeAlerts = trafficAlerts.filter((a) => a.isActive)

  const severityColors = {
    low: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", badge: "bg-green-500" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-500" },
    high: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-500" },
    critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-500" },
  }

  const routeStatusColors: Record<string, string> = {
    smooth: "text-green-600 bg-green-50 border-green-200",
    light: "text-green-600 bg-green-50 border-green-200",
    moderate: "text-amber-600 bg-amber-50 border-amber-200",
    heavy: "text-red-600 bg-red-50 border-red-200",
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Traffic Operations</h1>
            <p className="text-sm text-white/80 mt-1">Route monitoring & alert management</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="TrafficCone" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Active Alerts", value: activeAlerts.length },
            { label: "Routes Monitored", value: routes.length },
            { label: "Data Sources", value: "4" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {["AI", "Google Maps", "IoT", "Manual"].map((src) => (
          <div key={src} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm shrink-0">
            <LiveDot color="bg-green-500" />
            <span className="text-[11px] font-bold text-foreground">{src}</span>
          </div>
        ))}
      </div>

      {/* Route Status */}
      <section>
        <AdminSectionTitle title="Route Status" icon="Route" action={
          <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1.5">
            <LiveDot color="bg-green-500" /> Live
          </span>
        } />
        <div className="space-y-2">
          {routes.map((route) => (
            <div key={route.name} className={`flex items-center justify-between rounded-2xl border p-4 ${routeStatusColors[route.status]}`}>
              <div className="flex items-center gap-3">
                <Icon name="MapPin" className="size-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">{route.name}</p>
                  <p className="text-[11px] opacity-80">ETA: {route.eta}</p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase">{route.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <AdminSectionTitle title="Quick Actions" icon="Zap" />
        <div className="grid grid-cols-3 gap-2">
          <QuickAction icon="Plus" label="New Alert" onClick={() => setComposing(true)} />
          <QuickAction icon="RefreshCw" label="Refresh Data" variant="success" />
          <QuickAction icon="Megaphone" label="Broadcast" />
        </div>
      </section>

      {/* Alert Composer */}
      <AnimatePresence>
        {composing && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-[#FFB74D] bg-[#FFF8F0] p-4 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-foreground">Compose Traffic Alert</h3>
              <button onClick={() => setComposing(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <select
                value={alertForm.route}
                onChange={(e) => setAlertForm({ ...alertForm, route: e.target.value })}
              >
                <option value="">Select route…</option>
                {routes.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
              </select>
              <select
                value={alertForm.severity}
                onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
              >
                <option value="low">Low Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="high">High Severity</option>
                <option value="critical">Critical Severity</option>
              </select>
              <textarea
                rows={2}
                placeholder="Alert message…"
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                className="resize-none"
              />
              <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]">
                <Icon name="Send" className="size-4" />
                Publish Alert
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Active Alerts */}
      <section>
        <AdminSectionTitle
          title="Active Alerts"
          icon="TriangleAlert"
          action={<span className="text-[11px] font-semibold text-muted-foreground">{activeAlerts.length} active</span>}
        />
        <div className="space-y-2">
          {trafficAlerts.map((alert) => {
            const c = severityColors[alert.severity]
            return (
              <div key={alert.id} className={`rounded-2xl border p-4 ${c.bg} ${c.border} ${!alert.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${c.badge}`} />
                    <span className={`text-[10px] font-bold uppercase ${c.text}`}>{alert.severity}</span>
                    <span className="text-[10px] text-muted-foreground">· {alert.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {alert.isActive && (
                      <button className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 hover:bg-red-100 transition">
                        Unpublish
                      </button>
                    )}
                  </div>
                </div>
                <p className={`mt-2 text-sm font-semibold ${c.text}`}>{alert.route}</p>
                <p className="mt-1 text-xs text-foreground">{alert.message}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Icon name="Clock" className="size-3" /> {alert.publishedAt}
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  <Icon name="User" className="size-3" /> {alert.publishedBy}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
