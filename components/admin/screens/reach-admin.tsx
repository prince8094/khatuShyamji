"use client"

import { useState, useEffect } from "react"
import { Icon } from "@/components/shared"
import { AdminSectionTitle } from "@/components/admin/admin-shared"
import { adminApi } from "@/lib/api-client"
import { type AdminScreenKey } from "@/lib/admin-data"

export function ReachAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [tab, setTab] = useState<"destination" | "options" | "routes" | "instructions">("destination")
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Destination state
  const [destId, setDestId] = useState("")
  const [destName, setDestName] = useState("")
  const [destLat, setDestLat] = useState("")
  const [destLong, setDestLong] = useState("")
  const [destUrl, setDestUrl] = useState("")

  // Travel options list
  const [options, setOptions] = useState<any[]>([])
  const [editingOption, setEditingOption] = useState<any | null>(null)

  // Route info list
  const [routes, setRoutes] = useState<any[]>([])
  const [editingRoute, setEditingRoute] = useState<any | null>(null)

  // Instructions list
  const [instructions, setInstructions] = useState<any[]>([])
  const [editingInstruction, setEditingInstruction] = useState<any | null>(null)

  const loadAll = () => {
    setLoading(true)
    adminApi.getReachInfo()
      .then((res: any) => {
        if (res) {
          if (res.destination) {
            setDestId(res.destination.id)
            setDestName(res.destination.name)
            setDestLat(res.destination.latitude.toString())
            setDestLong(res.destination.longitude.toString())
            setDestUrl(res.destination.google_maps_url)
          }
          setOptions(res.travel_options || [])
          setRoutes(res.routes || [])
          setInstructions(res.instructions || [])
        }
      })
      .catch((err) => {
        setErrorMsg("Failed to load reach information: " + err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadAll()
  }, [])

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(""), 4000)
    } else {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(""), 4000)
    }
  }

  // Submit temple destination update
  const handleUpdateDestination = (e: React.FormEvent) => {
    e.preventDefault()
    adminApi.updateReachDestination({
      id: destId || null,
      name: destName,
      latitude: parseFloat(destLat),
      longitude: parseFloat(destLong),
      google_maps_url: destUrl
    })
      .then((res) => {
        if (res) setDestId(res.id)
        triggerToast("Temple location destination updated successfully!")
      })
      .catch((err) => {
        triggerToast("Failed to update destination: " + err.message, true)
      })
  }

  // Travel option CRUD
  const handleSaveOption = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOption) return

    adminApi.actionReachTravelOption({
      action: "upsert",
      ...editingOption
    })
      .then(() => {
        triggerToast("Travel option saved successfully!")
        setEditingOption(null)
        loadAll()
      })
      .catch((err) => {
        triggerToast("Failed to save travel option: " + err.message, true)
      })
  }

  const handleDeleteOption = (id: string) => {
    if (!confirm("Are you sure you want to delete this travel option?")) return
    adminApi.actionReachTravelOption({ action: "delete", id })
      .then(() => {
        triggerToast("Travel option deleted successfully!")
        loadAll()
      })
      .catch((err) => {
        triggerToast("Failed to delete travel option: " + err.message, true)
      })
  }

  // Route CRUD
  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoute) return

    adminApi.actionReachRouteInfo({
      action: "upsert",
      ...editingRoute
    })
      .then(() => {
        triggerToast("Route info saved successfully!")
        setEditingRoute(null)
        loadAll()
      })
      .catch((err) => {
        triggerToast("Failed to save route: " + err.message, true)
      })
  }

  const handleDeleteRoute = (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return
    adminApi.actionReachRouteInfo({ action: "delete", id })
      .then(() => {
        triggerToast("Route info deleted successfully!")
        loadAll()
      })
      .catch((err) => {
        triggerToast("Failed to delete route: " + err.message, true)
      })
  }

  // Transport Instructions CRUD
  const handleSaveInstruction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingInstruction) return

    adminApi.actionReachTransportInstruction({
      action: "upsert",
      ...editingInstruction
    })
      .then(() => {
        triggerToast("Transit instruction saved successfully!")
        setEditingInstruction(null)
        loadAll()
      })
      .catch((err) => {
        triggerToast("Failed to save instruction: " + err.message, true)
      })
  }

  const handleDeleteInstruction = (id: string) => {
    if (!confirm("Are you sure you want to delete this transit guideline?")) return
    adminApi.actionReachTransportInstruction({ action: "delete", id })
      .then(() => {
        triggerToast("Transit instruction deleted successfully!")
        loadAll()
      })
      .catch((err) => {
        triggerToast("Failed to delete instruction: " + err.message, true)
      })
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Icon name="MapPinned" className="size-6 text-[#FF8C00]" /> How to Reach CMS
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure geographic destination, directions, transit modes, routes, and travel warnings.
          </p>
        </div>
        <button
          onClick={() => navigate("command-center")}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold transition hover:bg-secondary self-start md:self-auto active:scale-95"
        >
          <Icon name="ArrowLeft" className="size-4" /> Back to Dashboard
        </button>
      </div>

      {/* Toast Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 border border-green-200 p-4 text-xs font-semibold text-green-700">
          <Icon name="CheckCircle" className="size-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
          <Icon name="AlertCircle" className="size-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-border -mx-1 overflow-x-auto no-scrollbar">
        {[
          { id: "destination", title: "Temple Location", icon: "MapPin" },
          { id: "options", title: "Travel Modes", icon: "CarFront" },
          { id: "routes", title: "Routes & Distance", icon: "Milestone" },
          { id: "instructions", title: "Transit Guidelines", icon: "AlertTriangle" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id as any)
              setEditingOption(null)
              setEditingRoute(null)
              setEditingInstruction(null)
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 -mb-px shrink-0 ${
              tab === t.id ? "border-[#FF8C00] text-[#FF8C00]" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={t.icon} className="size-4" /> {t.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-[#FF8C00] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* TAB 1: TEMPLE LOCATION */}
          {tab === "destination" && (
            <form onSubmit={handleUpdateDestination} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <AdminSectionTitle title="Configure Destination Details" icon="Settings" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Destination Name *</label>
                  <input
                    type="text"
                    required
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    placeholder="e.g. Shree Khatu Shyam Ji Temple"
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Google Maps URL *</label>
                  <input
                    type="url"
                    required
                    value={destUrl}
                    onChange={(e) => setDestUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Latitude *</label>
                  <input
                    type="number"
                    step="0.00000001"
                    required
                    value={destLat}
                    onChange={(e) => setDestLat(e.target.value)}
                    placeholder="e.g. 27.36965159"
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Longitude *</label>
                  <input
                    type="number"
                    step="0.00000001"
                    required
                    value={destLong}
                    onChange={(e) => setDestLong(e.target.value)}
                    placeholder="e.g. 75.39855581"
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow active:scale-95"
                >
                  <Icon name="Save" className="size-4" /> Save Destination Coordinates
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TRAVEL OPTIONS */}
          {tab === "options" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm font-bold">Configured Travel Options ({options.length})</h3>
                <button
                  onClick={() => setEditingOption({ mode: "", icon: "CarFront", detail: "", detail_hi: "", display_order: 1, is_active: true })}
                  className="flex items-center gap-1 text-xs font-bold bg-[#FF8C00]/10 text-[#FF8C00] hover:bg-[#FF8C00]/25 px-3 py-1.5 rounded-xl transition"
                >
                  <Icon name="Plus" className="size-3.5" /> Add Mode
                </button>
              </div>

              {editingOption && (
                <form onSubmit={handleSaveOption} className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4">
                  <AdminSectionTitle title={editingOption.id ? "Edit Travel Option" : "New Travel Option"} icon="Edit" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Mode Name *</label>
                      <input
                        type="text"
                        required
                        value={editingOption.mode}
                        onChange={(e) => setEditingOption({ ...editingOption, mode: e.target.value })}
                        placeholder="e.g. By Road"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Lucide Icon Name *</label>
                      <input
                        type="text"
                        required
                        value={editingOption.icon}
                        onChange={(e) => setEditingOption({ ...editingOption, icon: e.target.value })}
                        placeholder="e.g. CarFront, TrainFront, BusFront"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Display Order *</label>
                      <input
                        type="number"
                        required
                        value={editingOption.display_order}
                        onChange={(e) => setEditingOption({ ...editingOption, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Detail English *</label>
                      <textarea
                        required
                        rows={2}
                        value={editingOption.detail}
                        onChange={(e) => setEditingOption({ ...editingOption, detail: e.target.value })}
                        placeholder="English travel description details..."
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Detail Hindi</label>
                      <textarea
                        rows={2}
                        value={editingOption.detail_hi || ""}
                        onChange={(e) => setEditingOption({ ...editingOption, detail_hi: e.target.value })}
                        placeholder="यात्रा वर्णन हिंदी में..."
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="opt-active"
                      checked={editingOption.is_active}
                      onChange={(e) => setEditingOption({ ...editingOption, is_active: e.target.checked })}
                    />
                    <label htmlFor="opt-active" className="text-xs font-semibold">Active & Visible in Pilgrim App</label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingOption(null)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border transition hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF8C00] text-white shadow transition hover:opacity-95"
                    >
                      Save Option
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt) => (
                  <div key={opt.id} className={`bg-card border rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 ${!opt.is_active ? "opacity-60 border-dashed" : "border-border"}`}>
                    <div className="flex gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 border border-orange-200 text-[#FF8C00]">
                        <Icon name={opt.icon || "CarFront"} className="size-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-sm font-bold text-foreground">{opt.mode}</p>
                          <span className="text-[9px] font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-slate-100">
                            Order {opt.display_order}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{opt.detail}</p>
                        {opt.detail_hi && (
                          <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed font-hindi border-t border-border/40 pt-1 mt-1.5">{opt.detail_hi}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => setEditingOption(opt)}
                        className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Edit" className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOption(opt.id)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-muted-foreground hover:text-red-600"
                      >
                        <Icon name="Trash2" className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ROUTES & DISTANCE */}
          {tab === "routes" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm font-bold">Configured Route Directions ({routes.length})</h3>
                <button
                  onClick={() => setEditingRoute({ title: "", distance: "", duration: "", description: "", is_active: true })}
                  className="flex items-center gap-1 text-xs font-bold bg-[#FF8C00]/10 text-[#FF8C00] hover:bg-[#FF8C00]/25 px-3 py-1.5 rounded-xl transition"
                >
                  <Icon name="Plus" className="size-3.5" /> Add Route
                </button>
              </div>

              {editingRoute && (
                <form onSubmit={handleSaveRoute} className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4">
                  <AdminSectionTitle title={editingRoute.id ? "Edit Route" : "New Route"} icon="Edit" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Route Path Title *</label>
                      <input
                        type="text"
                        required
                        value={editingRoute.title}
                        onChange={(e) => setEditingRoute({ ...editingRoute, title: e.target.value })}
                        placeholder="e.g. Delhi to Khatu Dham"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Distance *</label>
                      <input
                        type="text"
                        required
                        value={editingRoute.distance}
                        onChange={(e) => setEditingRoute({ ...editingRoute, distance: e.target.value })}
                        placeholder="e.g. 280 km"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Duration *</label>
                      <input
                        type="text"
                        required
                        value={editingRoute.duration}
                        onChange={(e) => setEditingRoute({ ...editingRoute, duration: e.target.value })}
                        placeholder="e.g. 5 hours"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Directions Description *</label>
                    <textarea
                      required
                      rows={2}
                      value={editingRoute.description}
                      onChange={(e) => setEditingRoute({ ...editingRoute, description: e.target.value })}
                      placeholder="e.g. Take NH-48 via Jaipur-Delhi Highway and exit at Ringas Junction..."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="route-active"
                      checked={editingRoute.is_active}
                      onChange={(e) => setEditingRoute({ ...editingRoute, is_active: e.target.checked })}
                    />
                    <label htmlFor="route-active" className="text-xs font-semibold">Active & Visible in Pilgrim App</label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingRoute(null)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border transition hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF8C00] text-white shadow transition hover:opacity-95"
                    >
                      Save Route
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {routes.map((rt) => (
                  <div key={rt.id} className={`bg-card border rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 ${!rt.is_active ? "opacity-60 border-dashed" : "border-border"}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-sm font-bold text-foreground">{rt.title}</p>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF8C00]">
                          {rt.distance}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-muted-foreground">
                          {rt.duration}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rt.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingRoute(rt)}
                        className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Edit" className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoute(rt.id)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-muted-foreground hover:text-red-600"
                      >
                        <Icon name="Trash2" className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TRANSIT GUIDELINES */}
          {tab === "instructions" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm font-bold">Transit Warning Warnings & Instructions ({instructions.length})</h3>
                <button
                  onClick={() => setEditingInstruction({ title: "", instructions: "", is_active: true })}
                  className="flex items-center gap-1 text-xs font-bold bg-[#FF8C00]/10 text-[#FF8C00] hover:bg-[#FF8C00]/25 px-3 py-1.5 rounded-xl transition"
                >
                  <Icon name="Plus" className="size-3.5" /> Add Warning/Warning
                </button>
              </div>

              {editingInstruction && (
                <form onSubmit={handleSaveInstruction} className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4">
                  <AdminSectionTitle title={editingInstruction.id ? "Edit Warning" : "New Warning"} icon="Edit" />
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Guideline Title *</label>
                    <input
                      type="text"
                      required
                      value={editingInstruction.title}
                      onChange={(e) => setEditingInstruction({ ...editingInstruction, title: e.target.value })}
                      placeholder="e.g. Ringas-Khatu Peak Congestion"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Instruction Text *</label>
                    <textarea
                      required
                      rows={3}
                      value={editingInstruction.instructions}
                      onChange={(e) => setEditingInstruction({ ...editingInstruction, instructions: e.target.value })}
                      placeholder="Instructions or warnings text..."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ins-active"
                      checked={editingInstruction.is_active}
                      onChange={(e) => setEditingInstruction({ ...editingInstruction, is_active: e.target.checked })}
                    />
                    <label htmlFor="ins-active" className="text-xs font-semibold">Active & Visible in Pilgrim App</label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingInstruction(null)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border transition hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF8C00] text-white shadow transition hover:opacity-95"
                    >
                      Save Instruction
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {instructions.map((ins) => (
                  <div key={ins.id} className={`bg-card border rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 ${!ins.is_active ? "opacity-60 border-dashed" : "border-border"}`}>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground">{ins.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ins.instructions}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setEditingInstruction(ins)}
                        className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Edit" className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInstruction(ins.id)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-muted-foreground hover:text-red-600"
                      >
                        <Icon name="Trash2" className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
