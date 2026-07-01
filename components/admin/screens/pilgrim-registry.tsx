"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, QrMock } from "@/components/shared"
import { AdminSectionTitle, MetricCard } from "@/components/admin/admin-shared"
import {
  mockProfiles,
  mockDarshanBookings,
  mockBookingMembers,
  type RegisteredProfile,
  type DarshanBooking,
  type BookingMember,
  type AdminScreenKey,
} from "@/lib/admin-data"

export function PilgrimRegistryScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [regDateFilter, setRegDateFilter] = useState("all") // all, today, last-7, last-30
  const [bookingFilter, setBookingFilter] = useState("all") // all, has-bookings, no-bookings
  const [statusFilter, setStatusFilter] = useState("all") // all, upcoming, completed, cancelled

  // Selected profile for Details modal
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  // Selected booking inside details modal for passenger details
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  // Today's date reference (matching local time metadata 2026-07-01)
  const TODAY_STR = "2026-07-01"

  // Process profiles data with bookings and devotees mapping
  const profilesWithStats = useMemo(() => {
    return mockProfiles.map((profile) => {
      const userBookings = mockDarshanBookings.filter((b) => b.profileId === profile.id)
      const bookingIds = userBookings.map((b) => b.id)
      const userMembers = mockBookingMembers.filter((m) => bookingIds.includes(m.bookingId))

      // Unique devotee names ever registered
      const uniqueDevoteeNames = new Set(userMembers.map((m) => m.name))
      // Include the profile owner as well
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
  }, [])

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
    const todayBookings = mockDarshanBookings.filter((b) => b.bookingDate === TODAY_STR).length

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
  }, [profilesWithStats])

  // Get details for currently selected profile
  const selectedProfileDetails = useMemo(() => {
    if (!selectedProfileId) return null
    return profilesWithStats.find((p) => p.id === selectedProfileId) || null
  }, [profilesWithStats, selectedProfileId])

  // Get members for selected booking
  const selectedBookingMembers = useMemo(() => {
    if (!selectedBookingId) return []
    return mockBookingMembers.filter((m) => m.bookingId === selectedBookingId)
  }, [selectedBookingId])

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

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `pilgrim_registry_${TODAY_STR}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
