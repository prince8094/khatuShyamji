"use client"

import { useState, useEffect } from "react"
import { Icon } from "@/components/shared"
import { AdminSectionTitle } from "@/components/admin/admin-shared"
import { adminApi } from "@/lib/api-client"
import { type AdminScreenKey } from "@/lib/admin-data"

interface BookingCenter {
  id: string
  name: string
  address: string
  district: string
  state: string
  latitude: number
  longitude: number
  google_maps_url: string
  working_hours: string
  description?: string
  status: "active" | "inactive"
}

export function CentersAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [centers, setCenters] = useState<BookingCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [editingCenter, setEditingCenter] = useState<BookingCenter | null>(null)
  const [mapPreviewCoords, setMapPreviewCoords] = useState<{ lat: number; lng: number } | null>(null)

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(""), 4000)
    } else {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(""), 4000)
    }
  }

  const loadCenters = () => {
    setLoading(true)
    adminApi.getBookingCenters()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setCenters(res)
        }
      })
      .catch((err) => {
        triggerToast("Failed to load booking centers: " + err.message, true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadCenters()
  }, [])

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCenter) return

    adminApi.actionBookingCenter({
      action: "upsert",
      ...editingCenter
    })
      .then(() => {
        triggerToast("Offline booking center saved successfully!")
        setEditingCenter(null)
        setMapPreviewCoords(null)
        loadCenters()
      })
      .catch((err) => {
        triggerToast("Failed to save center: " + err.message, true)
      })
  }

  const handleDeleteCenter = (id: string) => {
    if (!confirm("Are you sure you want to delete this booking center?")) return
    adminApi.actionBookingCenter({ action: "delete", id })
      .then(() => {
        triggerToast("Booking center deleted successfully!")
        loadCenters()
      })
      .catch((err) => {
        triggerToast("Failed to delete center: " + err.message, true)
      })
  }

  const handleToggleStatus = (center: BookingCenter) => {
    const nextStatus = center.status === "active" ? "inactive" : "active"
    adminApi.actionBookingCenter({
      action: "upsert",
      ...center,
      status: nextStatus
    })
      .then(() => {
        triggerToast(`Booking center status updated to ${nextStatus}!`)
        loadCenters()
      })
      .catch((err) => {
        triggerToast("Failed to update status: " + err.message, true)
      })
  }

  const handlePreviewMap = () => {
    if (!editingCenter) return
    const lat = parseFloat(editingCenter.latitude.toString())
    const lng = parseFloat(editingCenter.longitude.toString())
    if (isNaN(lat) || isNaN(lng)) {
      triggerToast("Please enter valid numeric latitude and longitude coordinates first.", true)
      return
    }
    setMapPreviewCoords({ lat, lng })
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Icon name="Building2" className="size-6 text-[#FF8C00]" /> Offline Booking Centers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure offline darshan pass booking centers, location markers, and maps links.
          </p>
        </div>
        <button
          onClick={() => navigate("command-center")}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold transition hover:bg-secondary self-start md:self-auto active:scale-95"
        >
          <Icon name="ArrowLeft" className="size-4" /> Back to CommandCenter
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

      {/* CRUD control */}
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-sm font-bold">Offline Registration Centers ({centers.length})</h3>
        <button
          onClick={() => {
            setEditingCenter({
              id: "",
              name: "",
              address: "",
              district: "",
              state: "Rajasthan",
              latitude: 27.361849,
              longitude: 75.568453,
              google_maps_url: "",
              working_hours: "09:00 AM - 06:00 PM",
              description: "",
              status: "active"
            })
            setMapPreviewCoords(null)
          }}
          className="flex items-center gap-1 text-xs font-bold bg-[#FF8C00]/10 text-[#FF8C00] hover:bg-[#FF8C00]/25 px-3.5 py-2 rounded-xl transition active:scale-95"
        >
          <Icon name="Plus" className="size-4" /> Add Booking Center
        </button>
      </div>

      {/* Form panel */}
      {editingCenter && (
        <form onSubmit={handleSaveCenter} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <AdminSectionTitle title={editingCenter.id ? "Edit Booking Center" : "Add New Booking Center"} icon="Edit" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Center Name *</label>
              <input
                type="text"
                required
                value={editingCenter.name}
                onChange={(e) => setEditingCenter({ ...editingCenter, name: e.target.value })}
                placeholder="e.g. Ringas Junction Passenger Center"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Working Hours *</label>
              <input
                type="text"
                required
                value={editingCenter.working_hours}
                onChange={(e) => setEditingCenter({ ...editingCenter, working_hours: e.target.value })}
                placeholder="e.g. 08:00 AM - 08:00 PM"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Full Address *</label>
            <input
              type="text"
              required
              value={editingCenter.address}
              onChange={(e) => setEditingCenter({ ...editingCenter, address: e.target.value })}
              placeholder="e.g. Gate No. 1 Waiting Area, Reengus Railway Station"
              className="w-full text-xs p-3 rounded-xl border border-border bg-background"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">District *</label>
              <input
                type="text"
                required
                value={editingCenter.district}
                onChange={(e) => setEditingCenter({ ...editingCenter, district: e.target.value })}
                placeholder="e.g. Sikar"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">State *</label>
              <input
                type="text"
                required
                value={editingCenter.state}
                onChange={(e) => setEditingCenter({ ...editingCenter, state: e.target.value })}
                placeholder="e.g. Rajasthan"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Latitude *</label>
              <input
                type="number"
                step="0.000001"
                required
                value={editingCenter.latitude}
                onChange={(e) => setEditingCenter({ ...editingCenter, latitude: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 27.361849"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Longitude *</label>
              <input
                type="number"
                step="0.000001"
                required
                value={editingCenter.longitude}
                onChange={(e) => setEditingCenter({ ...editingCenter, longitude: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 75.568453"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="flex items-end pb-1.5">
              <button
                type="button"
                onClick={handlePreviewMap}
                className="flex items-center gap-1.5 rounded-xl border border-[#FF8C00] text-[#FF8C00] hover:bg-orange-50 px-4 py-2.5 text-xs font-bold transition active:scale-95"
              >
                <Icon name="Map" className="size-4" /> Preview on Map
              </button>
            </div>
          </div>

          {mapPreviewCoords && (
            <div className="border border-border rounded-2xl overflow-hidden h-48 bg-slate-100">
              <iframe
                src={`https://maps.google.com/maps?q=${mapPreviewCoords.lat},${mapPreviewCoords.lng}&z=14&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Google Maps Link *</label>
            <input
              type="url"
              required
              value={editingCenter.google_maps_url}
              onChange={(e) => setEditingCenter({ ...editingCenter, google_maps_url: e.target.value })}
              placeholder="e.g. https://maps.google.com/?q=27.361849,75.568453"
              className="w-full text-xs p-3 rounded-xl border border-border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Description Summary (Optional)</label>
            <textarea
              rows={2}
              value={editingCenter.description || ""}
              onChange={(e) => setEditingCenter({ ...editingCenter, description: e.target.value })}
              placeholder="e.g. Near Exit Gate 1, next to Reengus Tourist Information Desk..."
              className="w-full text-xs p-3 rounded-xl border border-border bg-background"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setEditingCenter(null)
                setMapPreviewCoords(null)
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border hover:bg-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF8C00] text-white shadow hover:opacity-95 transition"
            >
              Save Center
            </button>
          </div>
        </form>
      )}

      {/* Centers Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center col-span-2">
            <div className="size-6 animate-spin rounded-full border-2 border-[#FF8C00] border-t-transparent" />
          </div>
        ) : (
          centers.map((c) => (
            <div key={c.id} className={`bg-card border rounded-3xl p-5 shadow-sm flex items-start justify-between gap-3 ${c.status === "inactive" ? "opacity-60 border-dashed" : "border-border"}`}>
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-[#FF8C00] shrink-0">
                    <Icon name="Building2" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-bold text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.working_hours}</p>
                  </div>
                </div>
                
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="MapPin" className="size-3.5 shrink-0" />
                  <span className="truncate">{c.address}, {c.district}, {c.state}</span>
                </p>

                {c.description && (
                  <p className="text-xs text-muted-foreground italic truncate">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 items-end shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(c)}
                  className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border transition active:scale-95 ${
                    c.status === "active" ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-300 text-slate-500"
                  }`}
                >
                  {c.status === "active" ? "ACTIVE" : "INACTIVE"}
                </button>

                <div className="flex gap-1">
                  <a
                    href={`https://maps.google.com/maps?q=${c.latitude},${c.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-[#FF8C00]"
                  >
                    <Icon name="Map" className="size-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      setEditingCenter(c)
                      setMapPreviewCoords({ lat: Number(c.latitude), lng: Number(c.longitude) })
                    }}
                    className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground"
                  >
                    <Icon name="Edit" className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCenter(c.id)}
                    className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-muted-foreground hover:text-red-600"
                  >
                    <Icon name="Trash2" className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {centers.length === 0 && !loading && (
          <p className="text-center text-xs text-muted-foreground py-8 col-span-2">No offline booking centers configured in database.</p>
        )}
      </div>
    </div>
  )
}
