"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, LiveDot, QuickAction, ActivityItem } from "@/components/admin/admin-shared"
import { trafficAlerts, type AdminScreenKey } from "@/lib/admin-data"
import { adminApi } from "@/lib/api-client"
import TrafficMap from "@/components/shared/TrafficMap"

const routes = [
  { name: "NH-148D (Jaipur → Khatu)", status: "moderate", icon: "ArrowRight", eta: "1h 45m" },
  { name: "NH-148D (Delhi → Khatu)", status: "smooth", icon: "ArrowRight", eta: "5h 20m" },
  { name: "Sikar Road", status: "light", icon: "ArrowRight", eta: "40m" },
  { name: "Temple Approach Road", status: "heavy", icon: "ArrowRight", eta: "15m" },
]

export function TrafficOpsScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [composing, setComposing] = useState(false)
  const [alertForm, setAlertForm] = useState({ 
    route: "", 
    severity: "low", 
    message: "",
    latitude: "" as string | number,
    longitude: "" as string | number,
    alert_type: "closure"
  })
  const [alerts, setAlerts] = useState<any[]>(trafficAlerts)
  const [routesList, setRoutesList] = useState<any[]>(routes)

  // Map settings
  const [showTempleRoute, setShowTempleRoute] = useState(true)
  const [showParkingRoute, setShowParkingRoute] = useState(true)
  const [showAlternativeRoute, setShowAlternativeRoute] = useState(true)
  const [showTrafficLayer, setShowTrafficLayer] = useState(true)

  useEffect(() => {
    const loadTrafficAlerts = async () => {
      try {
        const data = await adminApi.getTraffic()
        if (data.routes) {
          setRoutesList(data.routes)
        }
        if (data.alerts) {
          setAlerts(data.alerts.map((a: any) => ({
            id: a.id,
            route: data.routes?.find((r: any) => r.id === a.route_id)?.name || a.route_id,
            severity: a.severity as "low" | "medium" | "high" | "critical",
            message: a.message,
            source: a.source,
            publishedAt: new Date(a.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            publishedBy: a.published_by_admin_id || "Traffic Ops",
            isActive: a.is_active
          })))
        }
      } catch (e) {
        console.error("Failed to load traffic alerts", e)
      }
    }

    loadTrafficAlerts()
  }, [])

  const activeAlerts = alerts.filter((a) => a.isActive)

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

  const handlePublishAlert = async () => {
    if (!alertForm.route || !alertForm.message.trim()) return

    const newAlert = {
      id: crypto.randomUUID(),
      route: alertForm.route,
      severity: alertForm.severity as "low" | "medium" | "high" | "critical",
      message: alertForm.message,
      source: "Manual",
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      publishedBy: "Prince G.",
      isActive: true
    }

    setAlerts(prev => [newAlert, ...prev])
    setComposing(false)
    const latVal = alertForm.latitude
    const lngVal = alertForm.longitude
    const alertType = alertForm.alert_type
    setAlertForm({ route: "", severity: "low", message: "", latitude: "", longitude: "", alert_type: "closure" })

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        const targetRoute = routesList.find(r => r.name === alertForm.route)
        const routeId = targetRoute ? targetRoute.id : 1

        await adminApi.publishTrafficAlert({
          route_id: routeId,
          severity: alertForm.severity,
          message: alertForm.message,
          source: "Manual",
          latitude: latVal ? Number(latVal) : null,
          longitude: lngVal ? Number(lngVal) : null,
          alert_type: alertType
        })
      }
    } catch (err) {
      console.error("Failed to insert alert", err)
    }
  }

  const handleUnpublishAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isActive: false } : a))

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        await adminApi.resolveTrafficAlert({
          alert_id: alertId
        })
      }
    } catch (err) {
      console.error("Failed to resolve alert", err)
    }
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
                className="w-full rounded-xl border border-border bg-card p-2 text-xs"
              >
                <option value="">Select route…</option>
                {routes.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={alertForm.severity}
                  onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                  className="rounded-xl border border-border bg-card p-2 text-xs"
                >
                  <option value="low">Low Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="high">High Severity</option>
                  <option value="critical">Critical Severity</option>
                </select>

                <select
                  value={alertForm.alert_type}
                  onChange={(e) => setAlertForm({ ...alertForm, alert_type: e.target.value })}
                  className="rounded-xl border border-border bg-card p-2 text-xs"
                >
                  <option value="closure">Road Closure ⛔</option>
                  <option value="diversion">Diversion ⚠️</option>
                  <option value="congestion">Congestion 🚗</option>
                  <option value="accident">Accident 💥</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Latitude (Click Map to set)"
                  value={alertForm.latitude}
                  onChange={(e) => setAlertForm({ ...alertForm, latitude: e.target.value })}
                  className="rounded-xl border border-border bg-card p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Longitude (Click Map to set)"
                  value={alertForm.longitude}
                  onChange={(e) => setAlertForm({ ...alertForm, longitude: e.target.value })}
                  className="rounded-xl border border-border bg-card p-2 text-xs"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Alert message…"
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                className="w-full rounded-xl border border-border bg-card p-2 text-xs resize-none"
              />
              <button
                type="button"
                onClick={handlePublishAlert}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
              >
                <Icon name="Send" className="size-4" />
                Publish Alert
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Live Operations Traffic Map */}
      <section className="space-y-3">
        <AdminSectionTitle title="Live Operations Traffic Map" icon="Map" />
        <TrafficMap
          adminMode={composing}
          showTempleRoute={showTempleRoute}
          showParkingRoute={showParkingRoute}
          showAlternativeRoute={showAlternativeRoute}
          showTrafficLayer={showTrafficLayer}
          onMapClick={(lat, lng) => {
            setAlertForm(prev => ({
              ...prev,
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6)
            }))
          }}
          alerts={alerts.map((a: any) => ({
            id: a.id,
            alert_code: a.alert_code || a.id,
            latitude: a.latitude,
            longitude: a.longitude,
            alert_type: a.alert_type || "closure",
            message: a.message,
            severity: a.severity
          }))}
        />
      </section>

      {/* Active Alerts */}
      <section>
        <AdminSectionTitle
          title="Active Alerts"
          icon="TriangleAlert"
          action={<span className="text-[11px] font-semibold text-muted-foreground">{activeAlerts.length} active</span>}
        />
        <div className="space-y-2">
          {alerts.map((alert) => {
            const c = severityColors[alert.severity as "low" | "medium" | "high" | "critical"] || severityColors.low
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
                      <button
                        onClick={() => handleUnpublishAlert(alert.id)}
                        className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 hover:bg-red-100 transition"
                      >
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
