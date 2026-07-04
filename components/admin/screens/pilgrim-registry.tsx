"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, QrMock } from "@/components/shared"
import { AdminSectionTitle, MetricCard } from "@/components/admin/admin-shared"
import { adminApi } from "@/lib/api-client"
import {
  type RegisteredProfile,
  type DarshanBooking,
  type BookingMember,
  type AdminScreenKey,
} from "@/lib/admin-data"

export function PilgrimRegistryScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [profilesList, setProfilesList] = useState<RegisteredProfile[]>([])
  const [bookingsList, setBookingsList] = useState<DarshanBooking[]>([])
  const [membersList, setMembersList] = useState<BookingMember[]>([])
  const [scansList, setScansList] = useState<any[]>([])
  const [loadingDb, setLoadingDb] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<"database" | "bookings" | "scanner">("database")

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [regDateFilter, setRegDateFilter] = useState("all") // all, today, last-7, last-30
  const [bookingFilter, setBookingFilter] = useState("all") // all, has-bookings, no-bookings
  const [statusFilter, setStatusFilter] = useState("all") // all, upcoming, completed, cancelled

  // Selected profile for Details modal
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  // Selected booking inside details modal for passenger details
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  // Scanner Simulator States
  const [ticketCode, setTicketCode] = useState("")
  const [gateName, setGateName] = useState("Gate 1 Main Entrance")
  const [scanLoading, setScanLoading] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    bookingInfo?: any
    members?: any[]
  } | null>(null)

  // Real check-in states
  const [scannedBooking, setScannedBooking] = useState<any | null>(null)
  const [scannedMembers, setScannedMembers] = useState<any[]>([])
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>([])
  const [checkingIn, setCheckingIn] = useState(false)

  // Today's date reference
  const TODAY_STR = "2026-07-01"

  useEffect(() => {
    const loadDbData = async () => {
      setLoadingDb(true)
      try {
        const data = await adminApi.getPilgrims()

        if (data.profiles) {
          setProfilesList(data.profiles.map((p: any) => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            email: p.email || undefined,
            createdAt: p.created_at.split("T")[0]
          })))
        }
        if (data.bookings) {
          setBookingsList(data.bookings.map((b: any) => {
            const bookingMembers = data.members ? data.members.filter((m: any) => m.booking_id === b.id) : []
            const checkedInCount = bookingMembers.filter((m: any) => m.checked_in).length
            return {
              id: b.id,
              bookingNumber: b.booking_number,
              profileId: b.profile_id,
              bookingType: b.booking_type as "solo" | "group",
              bookingDate: b.booking_date,
              visitorCount: b.visitor_count,
              status: b.status as "upcoming" | "completed" | "cancelled",
              createdAt: b.created_at.split("T")[0],
              devoteeName: b.profiles?.name || "Unknown",
              mobileNumber: b.profiles?.phone || "Unknown",
              timeSlot: b.time_slot || "09:00 AM - 12:00 PM",
              qrStatus: b.qr_signature ? "Secure Signed" : "Standard",
              scanStatus: `${checkedInCount} / ${b.visitor_count} In`
            }
          }))
        }
        if (data.members) {
          setMembersList(data.members.map((m: any) => ({
            id: String(m.id),
            bookingId: m.booking_id,
            name: m.name,
            age: m.age,
            gender: m.gender,
            nationality: m.nationality,
            isChild: m.is_child,
            checkedIn: m.checked_in
          })))
        }
        if (data.scans) {
          setScansList(data.scans.map((s: any) => ({
            id: s.id,
            bookingNumber: s.darshan_bookings?.booking_number || "Unknown",
            scannedAt: new Date(s.scanned_at).toLocaleTimeString(),
            validationGate: s.validation_gate,
            scanStatus: s.scan_status,
            visitors: s.darshan_bookings?.visitor_count || 1
          })))
        }
      } catch (err) {
        console.error("Failed to load live database lists", err)
      } finally {
        setLoadingDb(false)
      }
    }

    loadDbData()
  }, [])

  // Process profiles data with bookings and devotees mapping
  const profilesWithStats = useMemo(() => {
    return profilesList.map((profile) => {
      const userBookings = bookingsList.filter((b) => b.profileId === profile.id)
      const bookingIds = userBookings.map((b) => b.id)
      const userMembers = membersList.filter((m) => bookingIds.includes(m.bookingId))

      // Unique devotee names ever registered
      const uniqueDevoteeNames = new Set(userMembers.map((m) => m.name))
      uniqueDevoteeNames.add(profile.name)

      // Find last booking date
      let lastBookingDate = "No Bookings"
      if (userBookings.length > 0) {
        const sorted = [...userBookings].sort(
          (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        )
        lastBookingDate = sorted[0].bookingDate
      }

      return {
        ...profile,
        totalBookings: userBookings.length,
        totalDevotees: uniqueDevoteeNames.size,
        lastBooking: lastBookingDate,
        bookings: userBookings,
        uniqueDevotees: Array.from(uniqueDevoteeNames),
      }
    })
  }, [profilesList, bookingsList, membersList])

  // Filtered profiles list
  const filteredProfiles = useMemo(() => {
    return profilesWithStats.filter((p) => {
      // 1. Search filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      // 2. Registration Date filter
      if (regDateFilter === "today") {
        if (p.createdAt !== TODAY_STR) return false
      } else if (regDateFilter === "last-7") {
        const diff =
          (new Date(TODAY_STR).getTime() - new Date(p.createdAt).getTime()) / (1000 * 3600 * 24)
        if (diff > 7) return false
      } else if (regDateFilter === "last-30") {
        const diff =
          (new Date(TODAY_STR).getTime() - new Date(p.createdAt).getTime()) / (1000 * 3600 * 24)
        if (diff > 30) return false
      }

      // 3. Booking Count filter
      if (bookingFilter === "has-bookings" && p.totalBookings === 0) return false
      if (bookingFilter === "no-bookings" && p.totalBookings > 0) return false

      // 4. Status Filter (requires checking status of any booking under this user)
      if (statusFilter !== "all") {
        const hasMatchingStatus = p.bookings.some((b) => b.status === statusFilter)
        if (!hasMatchingStatus) return false
      }

      return true
    })
  }, [profilesWithStats, searchTerm, regDateFilter, bookingFilter, statusFilter])

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const totalAccounts = profilesWithStats.length
    const todayRegistrations = profilesWithStats.filter((p) => p.createdAt === TODAY_STR).length
    const todayBookings = bookingsList.filter((b) => b.bookingDate === TODAY_STR).length

    // Total unique devotees across all accounts
    const allUniqueDevotees = new Set<string>()
    profilesWithStats.forEach((p) => {
      p.uniqueDevotees.forEach((name) => allUniqueDevotees.add(name))
    })

    return {
      totalAccounts,
      todayRegistrations,
      todayBookings,
      totalDevotees: allUniqueDevotees.size,
    }
  }, [profilesWithStats, bookingsList])

  // Get details for currently selected profile
  const selectedProfileDetails = useMemo(() => {
    if (!selectedProfileId) return null
    return profilesWithStats.find((p) => p.id === selectedProfileId) || null
  }, [profilesWithStats, selectedProfileId])

  // Get members for selected booking
  const selectedBookingMembers = useMemo(() => {
    if (!selectedBookingId) return []
    return membersList.filter((m) => m.bookingId === selectedBookingId)
  }, [selectedBookingId, membersList])

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Name", "Mobile Number", "Email", "Total Bookings", "Total Devotees", "Registration Date", "Last Booking"]
    const escapeCSV = (val: any) => {
      const str = String(val ?? "")
      if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = filteredProfiles.map((p) => [
      escapeCSV(p.name),
      escapeCSV(p.phone),
      escapeCSV(p.email),
      p.totalBookings,
      p.totalDevotees,
      p.createdAt,
      p.lastBooking,
    ])

    const csvText = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `pilgrim_registry_${TODAY_STR}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Excel Export
  const handleExportExcel = () => {
    const headers = ["Name", "Mobile Number", "Email", "Total Bookings", "Total Devotees", "Registration Date", "Last Booking"]
    const rows = filteredProfiles.map((p) => [
      p.name,
      p.phone,
      p.email || "N/A",
      p.totalBookings,
      p.totalDevotees,
      p.createdAt,
      p.lastBooking,
    ])

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #D97706; color: white; font-weight: bold;">
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `pilgrim_registry_${TODAY_STR}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleScanPass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketCode.trim()) return
    setScanLoading(true)
    setScanResult(null)
    setScannedBooking(null)
    setScannedMembers([])
    setSelectedPassengerIds([])

    try {
      const code = ticketCode.trim()

      // Query verification through API
      const result = await adminApi.verifyPilgrimPass({
        qr_data: code,
        gate_name: gateName
      })

      setScannedBooking(result.booking)
      setScannedMembers(result.members)
      
      // Auto-select pending passengers for convenience
      const pendingIds = result.members
        .filter((m: any) => !m.checked_in)
        .map((m: any) => m.passenger_id)
      setSelectedPassengerIds(pendingIds)

      setScanResult({
        success: true,
        message: `EPass verified successfully! Registered for ${result.booking.visitor_count} devotees. Please mark checked-in passengers below.`,
        bookingInfo: result.booking,
        members: result.members
      })
      setTicketCode("")
    } catch (err: any) {
      console.error(err)
      setScanResult({
        success: false,
        message: `Verification Failed: ${err.message || err}`
      })
    } finally {
      setScanLoading(false)
    }
  }

  const handleConfirmCheckIn = async () => {
    if (!scannedBooking) return
    setCheckingIn(true)

    try {
      const result = await adminApi.checkInPassengers({
        booking_id: scannedBooking.id,
        passenger_ids: selectedPassengerIds,
        gate_name: gateName
      })

      // Update members in registry list
      setMembersList((prev: BookingMember[]) => {
        const updated = [...prev]
        result.members.forEach((updatedMember: any) => {
          const idx = updated.findIndex(m => String(m.id) === String(updatedMember.id) || (m as any).passengerId === updatedMember.passenger_id)
          if (idx !== -1) {
            (updated[idx] as any).checkedIn = updatedMember.checked_in
          }
        })
        return updated
      })

      // Update booking status in registry list
      setBookingsList((prev: DarshanBooking[]) => prev.map(b => b.id === scannedBooking.id ? { ...b, status: result.booking_status } : b))

      // Refresh check-in states
      setScannedBooking({ ...scannedBooking, status: result.booking_status })
      setScannedMembers(result.members)

      // Add to scans list locally
      if (result.scanLog) {
        const newScan = {
          id: result.scanLog.id,
          bookingNumber: scannedBooking.booking_number,
          scannedAt: new Date(result.scanLog.created_at || result.scanLog.scanned_at || new Date()).toLocaleTimeString(),
          validationGate: result.scanLog.validation_gate,
          scanStatus: result.scanLog.scan_status,
          visitors: scannedBooking.visitor_count
        }
        setScansList(prev => [newScan, ...prev])
      }

      setScanResult({
        success: true,
        message: result.booking_status === "completed" 
          ? "All passengers are checked in! Pass is now fully completed."
          : `Check-in updated! Checked in ${selectedPassengerIds.length} of ${result.members.length} passengers.`,
        bookingInfo: { ...scannedBooking, status: result.booking_status },
        members: result.members
      })
    } catch (err: any) {
      console.error("Check in failed", err)
      alert(`Check-in failed: ${err.message || err}`)
    } finally {
      setCheckingIn(false)
    }
  }

  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ")

  return (
    <div className="space-y-6 pb-12">
      {/* Premium Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#B45309] p-6 text-white shadow-lg">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
              <Icon name="BookOpen" className="size-6 text-yellow-200" />
              Pilgrim Registry
            </h1>
            <p className="text-sm text-amber-55 mt-1">
              Devotee account monitoring, booking histories, and identity audits
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold transition active:scale-95"
            >
              <Icon name="Download" className="size-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 rounded-xl bg-white/25 hover:bg-white/35 border border-white/35 px-3.5 py-2 text-xs font-bold transition active:scale-95"
            >
              <Icon name="FileSpreadsheet" className="size-4" />
              Export Excel
            </button>
          </div>
        </div>
      </section>

      {/* Summary Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="Users" label="Total Accounts" value={metrics.totalAccounts} sub="Registered profiles" />
        <MetricCard icon="UserPlus" label="Today's Registrations" value={metrics.todayRegistrations} sub="New signups today" trend="+20%" trendUp />
        <MetricCard icon="CalendarDays" label="Today's Bookings" value={metrics.todayBookings} sub="Slots reserved today" />
        <MetricCard icon="HeartHandshake" label="Total Devotees" value={metrics.totalDevotees} sub="Unique pilgrims cataloged" />
      </section>

      {/* Sub Tabs Navigation */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveSubTab("database")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold font-heading transition",
            activeSubTab === "database"
              ? "bg-[#D97706] text-white shadow-sm"
              : "bg-white border border-border text-foreground hover:bg-[#D97706]/5"
          )}
        >
          <Icon name="Database" className="size-4 inline mr-1.5" />
          Pilgrim Database
        </button>
        <button
          onClick={() => setActiveSubTab("bookings")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold font-heading transition",
            activeSubTab === "bookings"
              ? "bg-[#D97706] text-white shadow-sm"
              : "bg-white border border-border text-foreground hover:bg-[#D97706]/5"
          )}
        >
          <Icon name="Calendar" className="size-4 inline mr-1.5" />
          Booking Management
        </button>
        <button
          onClick={() => setActiveSubTab("scanner")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold font-heading transition",
            activeSubTab === "scanner"
              ? "bg-[#D97706] text-white shadow-sm"
              : "bg-white border border-border text-foreground hover:bg-[#D97706]/5"
          )}
        >
          <Icon name="Scan" className="size-4 inline mr-1.5" />
          QR Gate Scanner (Sim)
        </button>
      </div>

      {activeSubTab === "database" && (
        <>
          {/* Search and Advanced Filters */}
          <section className="rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search bar */}
              <div className="relative md:col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Search Devotee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Name, mobile number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs font-medium focus:border-amber-500 focus:outline-none"
                  />
                  <Icon name="Search" className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Registration Date filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Registration Date
                </label>
                <select
                  value={regDateFilter}
                  onChange={(e) => setRegDateFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Registered Today</option>
                  <option value="last-7">Last 7 Days</option>
                  <option value="last-30">Last 30 Days</option>
                </select>
              </div>

              {/* Booking filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Booking Activity
                </label>
                <select
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Accounts</option>
                  <option value="has-bookings">Has Darshan Bookings</option>
                  <option value="no-bookings">No Active Bookings</option>
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Booking Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">Any Status</option>
                  <option value="upcoming">Upcoming Only</option>
                  <option value="completed">Completed Only</option>
                  <option value="cancelled">Cancelled Only</option>
                </select>
              </div>
            </div>
          </section>

          {/* Pilgrim Registry Table */}
          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="p-4 border-b border-border bg-amber-50/20 flex items-center justify-between">
              <AdminSectionTitle
                title="Registered Devotee Accounts"
                icon="Users"
                action={
                  <span className="text-xs font-bold text-muted-foreground">
                    Showing {filteredProfiles.length} of {profilesWithStats.length} accounts
                  </span>
                }
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <th className="px-5 py-3">Devotee Name</th>
                    <th className="px-5 py-3">Mobile Number</th>
                    <th className="px-5 py-3 text-center">Total Bookings</th>
                    <th className="px-5 py-3 text-center">Registered Devotees</th>
                    <th className="px-5 py-3">Registration Date</th>
                    <th className="px-5 py-3">Last Booking Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium text-foreground">
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-amber-50/10 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-8 place-items-center rounded-full bg-[#FFF3E0] font-heading text-xs font-bold text-[#D97706] shadow-sm">
                              {profile.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                            <div>
                              <p className="font-bold">{profile.name}</p>
                              <p className="text-[10px] text-muted-foreground">{profile.email || "No email linked"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-muted-foreground">
                          {profile.phone}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                            {profile.totalBookings}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-block rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
                            {profile.totalDevotees}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          {profile.lastBooking !== "No Bookings" ? (
                            <span className="text-foreground">
                              {new Date(profile.lastBooking).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">No bookings</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedProfileId(profile.id)
                              setSelectedBookingId(null)
                            }}
                            className="rounded-xl border border-[#D97706]/30 hover:border-[#D97706] hover:bg-[#D97706]/5 px-3 py-1.5 font-bold text-[#D97706] transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                        <Icon name="SearchX" className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                        No registered accounts matched your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeSubTab === "bookings" && (
        <div className="space-y-6">
          {/* Booking Search & Filter Panel */}
          <section className="rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search bar */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Search Bookings
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by ID, Name, Mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs font-medium focus:border-amber-500 focus:outline-none"
                  />
                  <Icon name="Search" className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Booking Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">Any Status</option>
                  <option value="upcoming">Upcoming Only</option>
                  <option value="completed">Completed Only</option>
                  <option value="cancelled">Cancelled Only</option>
                </select>
              </div>

              {/* Total Display Info */}
              <div className="flex items-end justify-end">
                <span className="text-xs font-bold text-muted-foreground mb-2">
                  Showing {bookingsList.filter(b => {
                    const matchesSearch = 
                      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (b.devoteeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (b.mobileNumber || "").includes(searchTerm)
                    const matchesStatus = statusFilter === "all" || b.status === statusFilter
                    return matchesSearch && matchesStatus
                  }).length} of {bookingsList.length} bookings
                </span>
              </div>
            </div>
          </section>

          {/* Bookings Table */}
          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="p-4 border-b border-border bg-amber-50/20 flex items-center justify-between">
              <AdminSectionTitle title="Live Darshan Bookings Manifest" icon="CalendarRange" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <th className="px-5 py-3">Booking ID</th>
                    <th className="px-5 py-3">Booking Date</th>
                    <th className="px-5 py-3">Slot</th>
                    <th className="px-5 py-3">Devotee Name</th>
                    <th className="px-5 py-3">Mobile Number</th>
                    <th className="px-5 py-3 text-center">Number of Devotees</th>
                    <th className="px-5 py-3 text-center">Booking Status</th>
                    <th className="px-5 py-3 text-center">QR Status</th>
                    <th className="px-5 py-3 text-center">Scan Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium text-foreground">
                  {bookingsList.filter(b => {
                    const matchesSearch = 
                      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (b.devoteeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (b.mobileNumber || "").includes(searchTerm)
                    const matchesStatus = statusFilter === "all" || b.status === statusFilter
                    return matchesSearch && matchesStatus
                  }).length > 0 ? (
                    bookingsList.filter(b => {
                      const matchesSearch = 
                        b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (b.devoteeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (b.mobileNumber || "").includes(searchTerm)
                      const matchesStatus = statusFilter === "all" || b.status === statusFilter
                      return matchesSearch && matchesStatus
                    }).map((booking) => {
                      const statusColors = {
                        upcoming: "bg-blue-50 text-blue-600 border-blue-100",
                        completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
                        cancelled: "bg-red-50 text-red-600 border-red-100",
                      }
                      return (
                        <tr key={booking.id} className="hover:bg-amber-50/10 transition">
                          <td className="px-5 py-3.5 font-mono font-bold text-[#D97706]">
                            {booking.bookingNumber}
                          </td>
                          <td className="px-5 py-3.5">
                            {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {booking.timeSlot}
                          </td>
                          <td className="px-5 py-3.5">
                            {booking.devoteeName}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-muted-foreground">
                            {booking.mobileNumber}
                          </td>
                          <td className="px-5 py-3.5 text-center font-bold">
                            {booking.visitorCount}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-block rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[booking.status] || "bg-muted text-muted-foreground"}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-[#D97706]">
                              <Icon name="ShieldCheck" className="size-3" />
                              {booking.qrStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-block rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600 border border-green-150">
                              {booking.scanStatus}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                        <Icon name="SearchX" className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                        No bookings matched your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeSubTab === "scanner" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Scan Pass Input Panel */}
          <section className="lg:col-span-1 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-1.5 mb-2">
                <Icon name="QrCode" className="size-5 text-[#D97706]" />
                Scan E-Pass Ticket
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Enter pilgrim pass number or scan the QR code to verify details and audit entry at the temple gate.
              </p>

              <form onSubmit={handleScanPass} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Select Entry Gate
                  </label>
                  <select
                    value={gateName}
                    onChange={(e) => setGateName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Gate 1 Main Entrance">Gate 1 Main Entrance</option>
                    <option value="Gate 2 East Courtyard">Gate 2 East Courtyard</option>
                    <option value="Gate 3 VIP Path">Gate 3 VIP Path</option>
                    <option value="Toran Dwar Entrance">Toran Dwar Entrance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Ticket Booking Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KSJ-2026-09120"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none placeholder-muted-foreground/45"
                  />
                </div>

                <button
                  type="submit"
                  disabled={scanLoading || !ticketCode.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 text-xs font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {scanLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Icon name="Loader2" className="size-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Icon name="CheckCircle" className="size-4" />
                      Verify & Log Entry
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="mt-8 border-t border-border pt-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-[10px] font-extrabold text-green-700 uppercase">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Gate Auditor Online
              </span>
            </div>
          </section>

          {/* MIDDLE/RIGHT: Scan Results & Audit Ledger */}
          <section className="lg:col-span-2 space-y-6">
            {/* Scan Outcome Alert Box */}
            <AnimatePresence mode="wait">
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={`rounded-2xl border p-5 ${
                    scanResult.success
                      ? "border-emerald-200 bg-emerald-50/20 text-emerald-900"
                      : "border-red-200 bg-red-50/20 text-red-900"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-white ${
                      scanResult.success ? "bg-emerald-600 shadow-emerald-600/20" : "bg-red-600 shadow-red-600/20"
                    }`}>
                      <Icon name={scanResult.success ? "BadgeCheck" : "AlertTriangle"} className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading text-sm font-extrabold leading-none">
                        {scanResult.success ? "Pass Verified Successfully" : "Pass Verification Failed"}
                      </h4>
                      <p className="text-xs font-semibold mt-2 opacity-90 leading-relaxed">
                        {scanResult.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Passenger Check-In Panel */}
            {scannedBooking && scannedMembers.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/5 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-foreground">
                      Booking: {scannedBooking.booking_number} ({scannedBooking.booking_type})
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Status: <span className="font-bold text-foreground">{scannedBooking.status}</span>
                    </p>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#D97706] uppercase bg-amber-100/50 px-2.5 py-1 rounded-full">
                    {scannedMembers.filter((m: any) => m.checked_in).length} / {scannedMembers.length} Checked In
                  </span>
                </div>

                <div className="space-y-2">
                  {scannedMembers.map((member: any) => {
                    const isChecked = selectedPassengerIds.includes(member.passenger_id)
                    const isDisabled = member.checked_in

                    return (
                      <div 
                        key={member.id} 
                        className={`flex items-center justify-between rounded-xl border p-3 transition ${
                          member.checked_in 
                            ? "bg-green-50/20 border-green-200" 
                            : isChecked 
                              ? "bg-amber-50/30 border-amber-300 shadow-sm" 
                              : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={member.checked_in || isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPassengerIds(prev => [...prev, member.passenger_id])
                              } else {
                                setSelectedPassengerIds(prev => prev.filter(id => id !== member.passenger_id))
                              }
                            }}
                            className="size-4 rounded border-border text-[#D97706] focus:ring-[#D97706] accent-[#D97706] cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground flex items-center gap-2">
                              {member.name}
                              <span className="font-mono text-[9px] font-extrabold text-muted-foreground uppercase bg-muted/60 px-1.5 py-0.5 rounded">
                                {member.passenger_id || `PX-${member.id}`}
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {member.age} Yrs · {member.gender} · {member.nationality}
                            </p>
                          </div>
                        </div>

                        <div>
                          {member.checked_in ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100/60 px-2.5 py-0.5 text-[9px] font-bold text-green-700 uppercase">
                              <Icon name="Check" className="size-2.5" />
                              Checked In
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-100/60 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setScannedBooking(null);
                      setScannedMembers([]);
                      setScanResult(null);
                    }}
                    className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/10 transition"
                  >
                    Clear Scanner
                  </button>
                  <button
                    disabled={checkingIn || scannedBooking.status === "completed"}
                    onClick={handleConfirmCheckIn}
                    className="rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-5 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                  >
                    {checkingIn ? "Saving Check-In..." : "Confirm & Save Check-In"}
                  </button>
                </div>
              </div>
            )}

            {/* Audit Logs Ledger */}
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E8D5B7]/30 bg-muted/20 flex items-center justify-between">
                <h4 className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Icon name="Activity" className="size-4 text-[#D97706]" />
                  Recent Scanner Activity Audit Logs
                </h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                      <th className="px-4 py-2.5">Pass Code</th>
                      <th className="px-4 py-2.5">Gate / Location</th>
                      <th className="px-4 py-2.5">Scan Time</th>
                      <th className="px-4 py-2.5">Visitors</th>
                      <th className="px-4 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground font-medium">
                    {scansList.length > 0 ? (
                      scansList.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/10">
                          <td className="px-4 py-2.5 font-mono font-bold text-[#D97706]">{log.bookingNumber}</td>
                          <td className="px-4 py-2.5">{log.validationGate}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{log.scannedAt}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{log.visitors} persons</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                              {log.scanStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                          No scan entries logged since loader initialized.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Details Slide-Over Drawer Modal */}
      <AnimatePresence>
        {selectedProfileDetails && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfileId(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-over Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-[#FFF8F0] shadow-2xl"
            >
              {/* Header */}
              <div
                className="relative overflow-hidden px-6 py-5 text-white shrink-0"
                style={{ backgroundImage: "linear-gradient(135deg, #D97706 0%, #B45309 100%)" }}
              >
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "160px" }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-xl bg-white font-heading text-lg font-bold text-[#D97706] shadow-md border border-white/20">
                      {selectedProfileDetails.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <h2 className="font-heading text-lg font-bold">{selectedProfileDetails.name}</h2>
                      <p className="text-xs text-amber-100 uppercase tracking-wider">Pilgrim Account Details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProfileId(null)}
                    className="grid size-8 place-items-center rounded-lg bg-black/20 hover:bg-black/35 transition"
                  >
                    <Icon name="X" className="size-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Account Info Section */}
                <section className="rounded-2xl border border-border bg-white p-4.5 shadow-sm">
                  <h3 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Icon name="User" className="size-4 text-[#D97706]" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                        Mobile Number
                      </span>
                      <span className="text-foreground text-sm font-semibold">{selectedProfileDetails.phone}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                        Email Address
                      </span>
                      <span className="text-foreground text-sm font-semibold">{selectedProfileDetails.email || "Not Provided"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                        Account Created
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {new Date(selectedProfileDetails.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                        Total Registered Devotees
                      </span>
                      <span className="text-foreground text-sm font-semibold">{selectedProfileDetails.totalDevotees} unique names</span>
                    </div>
                  </div>
                </section>

                {/* Devotees list summary */}
                <section className="rounded-2xl border border-border bg-white p-4.5 shadow-sm">
                  <h3 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Icon name="Users" className="size-4 text-[#D97706]" />
                    Registered Devotees List
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfileDetails.uniqueDevotees.map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-100/60 px-2.5 py-1 text-xs font-semibold text-[#D97706]"
                      >
                        <Icon name="UserCheck" className="size-3" />
                        {name}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Booking History Section */}
                <section className="space-y-3">
                  <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Icon name="Calendar" className="size-4 text-[#D97706]" />
                    Darshan Booking History ({selectedProfileDetails.bookings.length})
                  </h3>
                  {selectedProfileDetails.bookings.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProfileDetails.bookings.map((booking) => {
                        const isSelected = selectedBookingId === booking.id
                        const statusColors = {
                          upcoming: "bg-blue-50 text-blue-600 border-blue-100",
                          completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
                          cancelled: "bg-red-50 text-red-600 border-red-100",
                        }

                        return (
                          <div
                            key={booking.id}
                            className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#D97706] bg-gradient-to-br from-[#FFF8F0] to-white shadow-md"
                                : "border-border bg-white hover:border-[#D97706]/40"
                            }`}
                            onClick={() => setSelectedBookingId(isSelected ? null : booking.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold text-[#D97706]">{booking.bookingNumber}</p>
                                <p className="text-sm font-bold text-foreground mt-1">
                                  {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    weekday: "long",
                                  })}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Booked on {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span
                                  className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    statusColors[booking.status]
                                  }`}
                                >
                                  {booking.status}
                                </span>
                                <span className="text-[11px] font-bold text-muted-foreground">
                                  {booking.visitorCount} pilgrims
                                </span>
                              </div>
                            </div>

                            {/* Collapsible Passenger Details for Selected Booking */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 border-t border-border pt-4 overflow-hidden"
                                >
                                  <h4 className="font-heading text-xs font-bold text-foreground mb-2.5 flex items-center gap-1">
                                    <Icon name="List" className="size-3.5 text-[#D97706]" />
                                    Devotee Passenger Manifest
                                  </h4>
                                  <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                                    <table className="w-full border-collapse text-left text-[11px]">
                                      <thead>
                                        <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                                          <th className="px-3 py-2">Name</th>
                                          <th className="px-3 py-2">Age</th>
                                          <th className="px-3 py-2">Gender</th>
                                          <th className="px-3 py-2">Relationship</th>
                                          <th className="px-3 py-2">Nationality</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border text-foreground font-medium">
                                        {selectedBookingMembers.map((member) => (
                                          <tr key={member.id} className="hover:bg-muted/10">
                                            <td className="px-3 py-2 flex items-center gap-1.5">
                                              {member.isChild && (
                                                <span className="rounded bg-orange-100 text-orange-600 px-1 text-[9px] font-bold uppercase">
                                                  Child
                                                </span>
                                              )}
                                              <span className="font-bold">{member.name}</span>
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">{member.age} yrs</td>
                                            <td className="px-3 py-2">{member.gender}</td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                              {member.relationship || "Self"}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                              {member.nationality}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* QR History Section (Visual verification) */}
                                  {booking.status === "completed" && (
                                    <div className="mt-4 p-3.5 rounded-xl border border-amber-100/50 bg-amber-50/15 flex items-center gap-4">
                                      <div className="shrink-0 rounded-lg border border-border bg-white p-1">
                                        <QrMock size={70} seed={booking.bookingNumber} />
                                      </div>
                                      <div>
                                        <h5 className="text-[11px] font-bold text-[#D97706] flex items-center gap-1">
                                          <Icon name="CheckCircle" className="size-3.5" />
                                          QR Entry Audited
                                        </h5>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                          Verified at VIP Gate 2 Entrance on{" "}
                                          <span className="font-semibold text-foreground">
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                          </span>{" "}
                                          by Operator code `OP-39`.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-xs text-muted-foreground">
                      <Icon name="CalendarX" className="mx-auto size-7 mb-1.5 text-muted-foreground/60" />
                      No darshan bookings found for this account.
                    </div>
                  )}
                </section>
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-white px-6 py-4 flex justify-between shrink-0">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase self-center">
                  Account ID: {selectedProfileDetails.id}
                </span>
                <button
                  onClick={() => setSelectedProfileId(null)}
                  className="rounded-xl bg-[#D97706] hover:bg-[#B45309] px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
