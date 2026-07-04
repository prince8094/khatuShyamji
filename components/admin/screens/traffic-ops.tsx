"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, LiveDot, QuickAction, ActivityItem } from "@/components/admin/admin-shared"
import { trafficAlerts, type AdminScreenKey } from "@/lib/admin-data"
import { adminApi } from "@/lib/api-client"
import TrafficMap from "@/components/shared/TrafficMap"
import { supabase } from "@/lib/supabase"

const routes = [
  { name: "NH-148D (Jaipur → Khatu)", status: "moderate", icon: "ArrowRight", eta: "1h 45m" },
  { name: "NH-148D (Delhi → Khatu)", status: "smooth", icon: "ArrowRight", eta: "5h 20m" },
  { name: "Sikar Road", status: "light", icon: "ArrowRight", eta: "40m" },
  { name: "Temple Approach Road", status: "heavy", icon: "ArrowRight", eta: "15m" },
]

export function TrafficOpsScreen({ navigate, currentAdmin }: { navigate: (s: AdminScreenKey) => void, currentAdmin?: any }) {
  const isSuperAdmin = currentAdmin?.roles?.includes("super-admin") || false
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
            routeId: a.route_id,
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

    const channel = supabase
      .channel("admin:traffic")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "traffic_routes" },
        () => {
          console.log("Admin realtime traffic routes update!")
          loadTrafficAlerts()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "traffic_alerts" },
        () => {
          console.log("Admin realtime traffic alerts update!")
          loadTrafficAlerts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

    try {
      const routeRow = routesList.find(r => r.name === alertForm.route)
      await adminApi.publishTrafficAlert({
        route_id: routeRow?.id,
        severity: alertForm.severity,
        message: alertForm.message,
        source: "Manual",
        latitude: alertForm.latitude ? Number(alertForm.latitude) : null,
        longitude: alertForm.longitude ? Number(alertForm.longitude) : null,
        alert_type: alertForm.alert_type
      })
    } catch (err) {
      console.error("Failed to publish alert in DB", err)
    }
  }

  // Create / Edit Route form state
  const [showCreateEditRouteModal, setShowCreateEditRouteModal] = useState(false)
  const [createEditRouteFormMode, setCreateEditRouteFormMode] = useState<"create" | "edit">("create")
  const [createEditRouteForm, setCreateEditRouteForm] = useState({
    id: "",
    name: "",
    origin: "",
    destination: "",
    coordinates: "",
    eta: "",
    congestion_level: "smooth",
    status: "smooth",
    google_maps_polyline: "",
    google_maps_url: ""
  })

  const handleCreateRouteClick = () => {
    setCreateEditRouteFormMode("create")
    setCreateEditRouteForm({
      id: "",
      name: "",
      origin: "",
      destination: "",
      coordinates: JSON.stringify([
        { lat: 27.3512, lng: 75.5629 },
        { lat: 27.3693, lng: 75.4746 }
      ], null, 2),
      eta: "30 mins",
      congestion_level: "smooth",
      status: "smooth",
      google_maps_polyline: "",
      google_maps_url: ""
    })
    setShowCreateEditRouteModal(true)
  }

  const handleEditRouteClick = (route: any) => {
    setCreateEditRouteFormMode("edit")
    setCreateEditFormModeEdit(route)
  }

  const setCreateEditFormModeEdit = (route: any) => {
    setCreateEditRouteForm({
      id: route.id || "",
      name: route.name,
      origin: route.origin || "",
      destination: route.destination || "",
      coordinates: route.coordinates ? JSON.stringify(route.coordinates, null, 2) : "",
      eta: route.eta,
      congestion_level: route.congestion_level || route.status,
      status: route.status,
      google_maps_polyline: route.google_maps_polyline || "",
      google_maps_url: route.google_maps_url || ""
    })
    setShowCreateEditRouteModal(true)
  }

  const handleDeleteRoute = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this traffic route? This will permanently remove it from the system.")) return
    try {
      await adminApi.deleteTrafficRoute({ id })
      setRoutesList(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error("Failed to delete route", err)
      alert("Failed to delete route.")
    }
  }

  const handleCreateEditRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let parsedCoords = null
    try {
      if (createEditRouteForm.coordinates.trim()) {
        parsedCoords = JSON.parse(createEditRouteForm.coordinates)
      }
    } catch (err) {
      alert("Invalid JSON format for Coordinates. Must be an array of objects: [{\"lat\": x, \"lng\": y}, ...]")
      return
    }

    const payload = {
      id: createEditRouteForm.id,
      name: createEditRouteForm.name,
      origin: createEditRouteForm.origin,
      destination: createEditRouteForm.destination,
      coordinates: parsedCoords,
      eta: createEditRouteForm.eta,
      congestion_level: createEditRouteForm.congestion_level,
      status: createEditRouteForm.status,
      google_maps_polyline: createEditRouteForm.google_maps_polyline,
      google_maps_url: createEditRouteForm.google_maps_url
    }

    try {
      if (createEditRouteFormMode === "create") {
        await adminApi.addTrafficRoute(payload)
      } else {
        await adminApi.editTrafficRoute(payload)
      }
      setShowCreateEditRouteModal(false)
    } catch (err: any) {
      console.error("Failed to save traffic route", err)
      alert(err.message || "Failed to save traffic route.")
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

  const handleUpdateRouteStatus = async (routeId: number, status: string, eta: string) => {
    setRoutesList(prev => prev.map(r => r.id === routeId ? { ...r, status, eta } : r))
    try {
      await adminApi.updateTrafficRouteStatus({
        route_id: routeId,
        status,
        eta
      })
    } catch (err) {
      console.error("Failed to update route status in database", err)
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
            { label: "Routes Monitored", value: routesList.length },
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
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <button
                onClick={() => handleCreateRouteClick()}
                className="flex items-center gap-1 rounded-xl bg-red-650 hover:bg-red-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition"
              >
                <Icon name="Plus" className="size-3.5" />
                Add Route
              </button>
            )}
            <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1.5">
              <LiveDot color="bg-green-500" /> Live
            </span>
          </div>
        } />
        <div className="space-y-2">
          {routesList.map((route) => (
            <div key={route.name} className={`flex items-center justify-between rounded-2xl border p-4 ${routeStatusColors[route.status] || "text-green-650 bg-green-50 border-green-200"}`}>
              <div className="flex items-center gap-3">
                <Icon name="MapPin" className="size-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">{route.name}</p>
                  <p className="text-[11px] opacity-80">ETA: {route.eta}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={route.eta}
                  onChange={(e) => handleUpdateRouteStatus(route.id, route.status, e.target.value)}
                  placeholder="ETA"
                  className="w-20 rounded-xl border border-border bg-card p-1 text-center text-xs font-semibold focus:outline-none"
                />
                <select
                  value={route.status}
                  onChange={(e) => handleUpdateRouteStatus(route.id, e.target.value, route.eta)}
                  className="text-xs font-bold uppercase rounded-xl border border-border bg-card p-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="smooth">Smooth</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                  <option value="congested">Congested</option>
                </select>
                {isSuperAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditRouteClick(route)}
                      className="p-1 rounded-lg border border-border bg-card hover:bg-muted/40 text-foreground transition"
                      title="Edit Route"
                    >
                      <Icon name="Edit3" className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route.id)}
                      className="p-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-650 transition"
                      title="Delete Route"
                    >
                      <Icon name="Trash2" className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
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
          routes={routesList}
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
      {/* Route CRUD Modals */}
      {renderCreateEditRouteModal()}
    </div>
  )

  function renderCreateEditRouteModal() {
    if (!showCreateEditRouteModal) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold text-foreground">
              {createEditRouteFormMode === "create" ? "Add New Traffic Route" : "Edit Traffic Route"}
            </h3>
            <button
              onClick={() => setShowCreateEditRouteModal(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleCreateEditRouteSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Route Name *</label>
              <input
                type="text"
                value={createEditRouteForm.name}
                onChange={(e) => setCreateEditRouteForm({ ...createEditRouteForm, name: e.target.value })}
                placeholder="e.g. NH-148D (Jaipur → Khatu)"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Origin</label>
                <input
                  type="text"
                  value={createEditRouteForm.origin}
                  onChange={(e) => setCreateEditRouteForm({ ...createEditRouteForm, origin: e.target.value })}
                  placeholder="e.g. Jaipur"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Destination</label>
                <input
                  type="text"
                  value={createEditRouteForm.destination}
                  onChange={(e) => setCreateEditRouteForm({ ...createEditRouteForm, destination: e.target.value })}
                  placeholder="e.g. Khatu"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">ETA *</label>
                <input
                  type="text"
                  value={createEditRouteForm.eta}
                  onChange={(e) => setCreateEditRouteForm({ ...createEditRouteForm, eta: e.target.value })}
                  placeholder="e.g. 45 mins"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Congestion Level / Status</label>
                <select
                  value={createEditRouteForm.status}
                  onChange={(e) => setCreateEditRouteForm({ ...createEditRouteForm, status: e.target.value, congestion_level: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
                >
                  <option value="smooth">Smooth</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                  <option value="congested">Congested</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Route Coordinates (JSON Array) *</label>
              <textarea
                value={createEditRouteForm.coordinates}
                onChange={(e) => setCreateEditRouteForm({ ...createEditRouteForm, coordinates: e.target.value })}
                placeholder='[{"lat": 27.3512, "lng": 75.5629}, ...]'
                rows={5}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-mono focus:border-green-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Google Maps URL / Navigation Link</label>
              <input
                type="text"
                value={createEditRouteForm.google_maps_url}
                onChange={(e) => setCreateEditRouteForm({ ...createEditRouteForm, google_maps_url: e.target.value })}
                placeholder="e.g. https://www.google.com/maps/dir/..."
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCreateEditRouteModal(false)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Save Route
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }
}
