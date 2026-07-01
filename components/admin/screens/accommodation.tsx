"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle } from "@/components/admin/admin-shared"
import { hotels as initialHotels, type AdminScreenKey } from "@/lib/admin-data"

type ExtendedHotel = {
  id: string
  name: string
  stars: number
  priceRange: string
  managerName: string
  status: "active" | "hidden" | "maintenance"
  rating: number
  contactPhone: string
  address: string
  type: "hotel" | "dharamshala"
  isVerified: boolean
  isVisibleInPilgrimApp: boolean
  googleMapsLink: string
  photos: string[]
}

export function AccommodationScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [accommodations, setAccommodations] = useState<ExtendedHotel[]>(() =>
    initialHotels.map((h, index) => ({
      id: h.id,
      name: h.name,
      stars: h.stars,
      priceRange: h.priceRange,
      managerName: h.assignedAdmin,
      status: h.status === "closed" ? "hidden" : h.status as any,
      rating: h.rating,
      contactPhone: h.contactPhone,
      address: h.address,
      type: index === 2 || index === 3 ? "dharamshala" : "hotel",
      isVerified: index !== 4,
      isVisibleInPilgrimApp: index !== 4,
      googleMapsLink: `https://maps.google.com/?q=${encodeURIComponent(h.name + ", Khatu Dham")}`,
      photos: ["/images/hotel-room-1.jpg", "/images/hotel-room-2.jpg"],
    }))
  )

  const [activityLogs, setActivityLogs] = useState<any[]>([
    { id: "act-1", time: "11:45 AM", action: "Shyam Palace details updated", actor: "Priya S." },
    { id: "act-2", time: "10:30 AM", action: "Bhakti Niwas marked as Verified", actor: "Priya S." },
    { id: "act-3", time: "09:15 AM", action: "Temple View Inn status changed to Maintenance", actor: "System" },
  ])

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState<string | null>(null)

  // Add form fields
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"hotel" | "dharamshala">("hotel")
  const [newStars, setNewStars] = useState(3)
  const [newPrice, setNewPrice] = useState("₹800 – ₹2,000")
  const [newManager, setNewManager] = useState("Priya Sharma")
  const [newContact, setNewContact] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newMapsLink, setNewMapsLink] = useState("")

  // Edit form state (used in manage modal)
  const [editForm, setEditForm] = useState<ExtendedHotel | null>(null)

  // Filter category state
  const [filterType, setFilterType] = useState<"all" | "hotel" | "dharamshala">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filtered List
  const filteredList = accommodations.filter(a => {
    const matchesCategory = filterType === "all" || a.type === filterType
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.managerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newId = `HTL-00${accommodations.length + 1}`
    const newAcc: ExtendedHotel = {
      id: newId,
      name: newName,
      stars: newType === "hotel" ? newStars : 0,
      priceRange: newPrice,
      managerName: newManager,
      status: "active",
      rating: 4.0,
      contactPhone: newContact,
      address: newAddress,
      type: newType,
      isVerified: true,
      isVisibleInPilgrimApp: true,
      googleMapsLink: newMapsLink || `https://maps.google.com/?q=${encodeURIComponent(newName + ", Khatu Dham")}`,
      photos: ["/images/hotel-room-1.jpg"],
    }

    setAccommodations(prev => [...prev, newAcc])

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(logs => [
      {
        id: `act-${Date.now()}`,
        time: timeStr,
        action: `Published new accommodation listing — ${newName}`,
        actor: "Priya S.",
      },
      ...logs,
    ])

    // Reset fields & close
    setNewName("")
    setNewContact("")
    setNewAddress("")
    setNewMapsLink("")
    setNewManager("Priya Sharma")
    setNewPrice("₹800 – ₹2,000")
    setShowAddModal(false)
  }

  const openManageModal = (hotel: ExtendedHotel) => {
    setEditForm({ ...hotel })
    setShowManageModal(hotel.id)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm) return

    setAccommodations(prev =>
      prev.map(a => (a.id === editForm.id ? { ...editForm } : a))
    )

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(logs => [
      {
        id: `act-${Date.now()}`,
        time: timeStr,
        action: `Updated configurations for stay ${editForm.name}`,
        actor: "Priya S.",
      },
      ...logs,
    ])

    setShowManageModal(null)
    setEditForm(null)
  }

  const handleAddPhoto = () => {
    if (!editForm) return
    const photoUrl = prompt("Enter photo URL:")
    if (photoUrl && photoUrl.trim()) {
      setEditForm({
        ...editForm,
        photos: [...editForm.photos, photoUrl.trim()],
      })
    }
  }

  const handleDeletePhoto = (photoIndex: number) => {
    if (!editForm) return
    const updatedPhotos = editForm.photos.filter((_, idx) => idx !== photoIndex)
    setEditForm({
      ...editForm,
      photos: updatedPhotos,
    })
  }

  const renderAddModal = () => {
    if (!showAddModal) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold text-foreground">Add New Stay Listing</h3>
            <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Accommodation Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Radhey Niwas"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 XXXXX XXXXX"
                  value={newContact}
                  onChange={e => setNewContact(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Manager / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Manager Full Name"
                  value={newManager}
                  onChange={e => setNewManager(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Address / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Near Shyam Kund"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Google Maps Link (Optional)</label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                value={newMapsLink}
                onChange={e => setNewMapsLink(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Type *</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="hotel">Hotel</option>
                  <option value="dharamshala">Dharamshala</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Price Range Description</label>
                <input
                  type="text"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="e.g. ₹500 – ₹1,500"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
            {newType === "hotel" && (
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Stars Rating</label>
                <select
                  value={newStars}
                  onChange={e => setNewStars(parseInt(e.target.value) || 3)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-[#2563EB] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map(s => (
                    <option key={s} value={s}>{s} Stars</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Publish Stay Listing
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  const renderManageModal = () => {
    if (!showManageModal || !editForm) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h3 className="font-heading text-base font-bold text-foreground">Manage Accommodation Details</h3>
            <button onClick={() => setShowManageModal(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Accommodation Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Contact Number</label>
                <input
                  type="tel"
                  required
                  value={editForm.contactPhone}
                  onChange={e => setEditForm({ ...editForm, contactPhone: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Manager / Owner Name</label>
                <input
                  type="text"
                  required
                  value={editForm.managerName}
                  onChange={e => setEditForm({ ...editForm, managerName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Address / Location</label>
              <input
                type="text"
                required
                value={editForm.address}
                onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Google Maps Link</label>
              <input
                type="url"
                value={editForm.googleMapsLink}
                onChange={e => setEditForm({ ...editForm, googleMapsLink: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
              {/* Status Controls */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Operational Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isVerified}
                      onChange={e => setEditForm({ ...editForm, isVerified: e.target.checked })}
                      className="size-4 rounded border-border text-[#2563EB] focus:ring-0"
                    />
                    <span>Verified Accommodation Stay</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-bold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isVisibleInPilgrimApp}
                      onChange={e => setEditForm({ ...editForm, isVisibleInPilgrimApp: e.target.checked })}
                      className="size-4 rounded border-border text-[#2563EB] focus:ring-0"
                    />
                    <span>Visible in Pilgrim App</span>
                  </label>
                </div>
              </div>

              {/* Photo Management */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-foreground">Photos Catalog</label>
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5"
                  >
                    <Icon name="Plus" className="size-3" /> Add Photo
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 border border-border rounded-xl p-2 bg-muted/20 h-28 overflow-y-auto">
                  {editForm.photos.length === 0 ? (
                    <p className="col-span-3 text-center text-[10px] text-muted-foreground py-8">No photos uploaded.</p>
                  ) : (
                    editForm.photos.map((photo, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg border bg-white overflow-hidden shadow-sm">
                        <img src={photo} alt="" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition"
                        >
                          <Icon name="Trash2" className="size-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setShowManageModal(null)
                  setEditForm(null)
                }}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Save Listing Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Accommodation Directory</h1>
            <p className="text-xs text-white/80 mt-1">Manage listings directory for Hotels & Dharamshalas</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="BedDouble" className="size-6 text-white" />
          </span>
        </div>
      </section>

      {/* Filters Search Bar & Add stays */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card border border-border rounded-2xl p-3 shadow-sm">
        <div className="flex gap-1 bg-secondary/80 p-1 rounded-xl shrink-0">
          {(["all", "hotel", "dharamshala"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${filterType === tab
                  ? "bg-white text-[#2563EB] shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab === "all" ? "All Stays" : tab + "s"}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Icon name="Search" className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by hotel name or manager…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 pl-9 pr-4 py-2 text-xs font-bold focus:border-[#2563EB] focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] shrink-0"
        >
          <Icon name="Plus" className="size-4" /> Add Accommodation
        </button>
      </div>

      {/* Accommodations Grid List */}
      <section>
        <AdminSectionTitle
          title="Accommodation Registry"
          icon="Building2"
          action={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
              {filteredList.length} Directory listings
            </span>
          }
        />
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map(hotel => (
            <motion.div
              key={hotel.id}
              layoutId={hotel.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <span className={`grid size-11 place-items-center rounded-xl shadow-sm shrink-0 ${hotel.type === "hotel" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    }`}>
                    <Icon name="Building" className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading text-sm font-extrabold text-foreground">{hotel.name}</p>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${hotel.type === "hotel" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}>
                        {hotel.type}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Icon name="Phone" className="size-3.5 text-blue-600" /> <strong>Contact Phone:</strong> {hotel.contactPhone}</span>
                      <span className="flex items-center gap-1"><Icon name="MapPin" className="size-3.5 text-blue-600" /> <strong>Location address:</strong> {hotel.address}</span>
                      <span className="flex items-center gap-1"><Icon name="User" className="size-3.5 text-blue-600" /> <strong>Manager / Owner:</strong> {hotel.managerName}</span>
                      {hotel.googleMapsLink && (
                        <a
                          href={hotel.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline mt-0.5"
                        >
                          <Icon name="ExternalLink" className="size-3.5" />
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges Column */}
                <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${hotel.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                      hotel.status === "maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-red-50 text-red-700 border-red-200"
                    }`}>
                    <span className={`size-1.5 rounded-full ${hotel.status === "active" ? "bg-green-500" :
                        hotel.status === "maintenance" ? "bg-amber-500" : "bg-red-500"
                      }`} />
                    {hotel.status}
                  </span>

                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${hotel.isVerified ? "bg-green-100 text-green-800 border-green-200" : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}>
                    <Icon name={hotel.isVerified ? "Check" : "AlertTriangle"} className="size-2.5" />
                    {hotel.isVerified ? "Verified Stay" : "Unverified"}
                  </span>

                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${hotel.isVisibleInPilgrimApp ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                    <Icon name={hotel.isVisibleInPilgrimApp ? "Eye" : "EyeOff"} className="size-2.5" />
                    {hotel.isVisibleInPilgrimApp ? "Visible to Pilgrims" : "Hidden in App"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2 border-t border-border/40 pt-3.5">
                <button
                  onClick={() => openManageModal(hotel)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-[#2563EB] hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow active:scale-[0.98] transition"
                >
                  <Icon name="Settings" className="size-3.5" />
                  Manage Accommodation
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Add Accommodation Portal */}
      {renderAddModal()}

      {/* Manage Accommodation Portal */}
      {renderManageModal()}
    </div>
  )
}
