"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, LiveDot } from "@/components/admin/admin-shared"
import { type AdminScreenKey } from "@/lib/admin-data"
import { adminApi, devoteeApi } from "@/lib/api-client"

export function SevaManagementScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [tab, setTab] = useState<"applications" | "opportunities">("applications")
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState("")

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3500)
  }

  // Fetch live volunteer opportunities
  useEffect(() => {
    devoteeApi.getTempleInfo()
      .then((res: any) => {
        if (Array.isArray(res)) {
          const rec = res.find(r => r.section_key === "volunteer_opportunities")
          if (rec && Array.isArray(rec.content)) {
            setOpportunities(rec.content)
          }
        }
      })
      .catch((err) => console.error("Failed to load volunteer opportunities in admin", err))
  }, [])

  // Fetch live applications from Supabase
  useEffect(() => {
    const loadApplications = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) return

      try {
        const data = await adminApi.getVolunteers()

        if (data && data.length > 0) {
          setApplications(data.map((app: any) => {
            let displayDate = app.preferred_date
            if (app.preferred_date) {
              const [y, m, d] = app.preferred_date.split("-")
              displayDate = `${d}/${m}/${y}`
            }

            return {
              id: app.id,
              fullName: app.full_name,
              email: app.email,
              mobile: app.mobile,
              age: app.age,
              gender: app.gender,
              city: app.city,
              preferredRole: app.preferred_role === "crowd" ? "Crowd Management Volunteer" :
                             app.preferred_role === "devotee-assist" ? "Devotee Assistance Volunteer" :
                             app.preferred_role === "prasad" ? "Prasad Distribution Volunteer" :
                             app.preferred_role === "cleanliness" ? "Temple Cleanliness Volunteer" :
                             app.preferred_role === "queue" ? "Queue Management Volunteer" :
                             app.preferred_role === "medical" ? "Medical Assistance Volunteer" :
                             app.preferred_role === "info-desk" ? "Information Desk Volunteer" : app.preferred_role,
              preferredDate: displayDate,
              preferredTimeSlot: app.preferred_time_slot.replace(/\b\w/g, (char: string) => char.toUpperCase()),
              experience: app.experience,
              reason: app.reason,
              emergencyContact: app.emergency_contact,
              status: app.status as "pending" | "approved" | "rejected",
              createdAt: app.created_at || new Date().toISOString()
            }
          }))
        }
      } catch (err) {
        console.error("Failed to load volunteer applications", err)
      }
    }

    loadApplications()
  }, [])

  // Handle application approval
  const handleApprove = async (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "approved" as const } : app))
    )
    const app = applications.find((a) => a.id === appId)
    if (app) {
      triggerToast(`Volunteer application for ${app.fullName} has been APPROVED.`)
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        await adminApi.actionVolunteer({
          application_id: appId,
          status: "approved"
        })
      }
    } catch (err) {
      console.error("Failed to update status in Supabase", err)
    }
  }

  // Handle application rejection
  const handleReject = async (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "rejected" as const } : app))
    )
    const app = applications.find((a) => a.id === appId)
    if (app) {
      triggerToast(`Volunteer application for ${app.fullName} has been REJECTED.`)
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        await adminApi.actionVolunteer({
          application_id: appId,
          status: "rejected"
        })
      }
    } catch (err) {
      console.error("Failed to update status in Supabase", err)
    }
  }

  const toggleOpportunityStatus = async (oppId: string) => {
    const nextOpp = opportunities.map(o => {
      if (o.id === oppId) {
        return { ...o, status: o.status === "Open" ? "Closed" : "Open" }
      }
      return o
    })
    setOpportunities(nextOpp)
    try {
      await adminApi.updateTempleInfo({
        section_key: "volunteer_opportunities",
        title: "Volunteer Opportunities",
        content: nextOpp
      })
      triggerToast("Opportunity status updated successfully!")
    } catch (err) {
      console.error("Failed to update opportunity in database", err)
    }
  }

  // Unique list of roles and dates for filter dropdowns
  const rolesList = useMemo(() => {
    const roles = new Set(applications.map((app) => app.preferredRole))
    return Array.from(roles)
  }, [applications])

  const datesList = useMemo(() => {
    const dates = new Set(applications.map((app) => app.preferredDate))
    return Array.from(dates)
  }, [applications])

  // Filter & Search Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      const matchesRole = roleFilter === "all" || app.preferredRole === roleFilter
      const matchesDate = dateFilter === "all" || app.preferredDate === dateFilter
      const matchesSearch =
        app.fullName.toLowerCase().includes(search.toLowerCase()) ||
        app.mobile.includes(search)

      return matchesStatus && matchesRole && matchesDate && matchesSearch
    })
  }, [applications, statusFilter, roleFilter, dateFilter, search])

  // Dashboard Stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      approved: applications.filter((a) => a.status === "approved").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    }
  }, [applications])

  // Selected Application Details
  const selectedAppDetails = useMemo(() => {
    if (!selectedAppId) return null
    return applications.find((app) => app.id === selectedAppId) || null
  }, [applications, selectedAppId])

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#DB2777] to-[#BE185D] p-6 text-white shadow-lg">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Icon name="HeartHandshake" className="size-6 text-pink-200" />
              Volunteer Management
            </h1>
            <p className="text-xs text-white/80 mt-1">
              Review pilgrim registrations and coordinate temple volunteers
            </p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Heart" className="size-6 text-white" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Total Applications", value: stats.total },
            { label: "Pending Review", value: stats.pending },
            { label: "Approved Volunteers", value: stats.approved },
            { label: "Rejected Applications", value: stats.rejected },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-black/20 backdrop-blur-sm px-2 py-2 text-center border border-white/5"
            >
              <p className="text-[9px] text-white/70 uppercase tracking-wide font-semibold">
                {s.label}
              </p>
              <p className="font-heading text-base font-extrabold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toast alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-3 shadow-lg text-xs font-bold"
          >
            <Icon name="CheckCircle" className="size-4 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("applications")}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            tab === "applications" ? "border-pink-650 text-pink-650" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Applications Queue
        </button>
        <button
          onClick={() => setTab("opportunities")}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            tab === "opportunities" ? "border-pink-650 text-pink-650" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Volunteering Opportunities
        </button>
      </div>

      {tab === "applications" ? (
        <>
          {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
        {/* Name / Mobile Search */}
        <div className="relative">
          <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Search Applicant
          </label>
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 pl-9 pr-4 py-2 text-xs font-bold focus:border-[#DB2777] focus:outline-none"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold focus:border-[#DB2777] focus:outline-none"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Volunteer Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold focus:border-[#DB2777] focus:outline-none"
          >
            <option value="all">Any Preferred Role</option>
            {rolesList.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Preferred Date
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold focus:border-[#DB2777] focus:outline-none"
          >
            <option value="all">Any Date</option>
            {datesList.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications list queue */}
      <section>
        <AdminSectionTitle
          title="Volunteer Applications"
          icon="ClipboardList"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-pink-600">
              <LiveDot color="bg-pink-500" /> Live Pipeline
            </span>
          }
        />

        <div className="grid grid-cols-1 gap-3.5">
          {filteredApps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-xs text-muted-foreground">
              <Icon name="SearchX" className="mx-auto size-7 mb-1.5 text-muted-foreground/60" />
              No matching volunteer applications found.
            </div>
          ) : (
            filteredApps.map((app) => {
              const statusColors = {
                pending: "bg-amber-50 text-amber-700 border-amber-200",
                approved: "bg-green-50 text-green-700 border-green-200",
                rejected: "bg-red-50 text-red-700 border-red-200",
              }

              return (
                <motion.div
                  key={app.id}
                  layoutId={app.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-extrabold text-foreground">
                          {app.fullName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({app.age} yrs · {app.gender})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Preferred Role:{" "}
                        <span className="font-bold text-foreground">{app.preferredRole}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Icon name="Phone" className="size-3 text-[#DB2777]" /> {app.mobile}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="MapPin" className="size-3 text-[#DB2777]" /> {app.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" className="size-3 text-[#DB2777]" /> {app.preferredDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" className="size-3 text-[#DB2777]" /> {app.preferredTimeSlot}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-start shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          statusColors[app.status]
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            app.status === "pending"
                              ? "bg-amber-500 animate-pulse"
                              : app.status === "approved"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions Transition Bar */}
                  <div className="mt-3.5 border-t border-border/40 pt-3 flex items-center justify-between gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedAppId(app.id)
                      }}
                      className="rounded-xl border border-[#DB2777]/30 hover:border-[#DB2777] hover:bg-[#DB2777]/5 px-4 py-1.5 text-[10px] font-bold text-[#DB2777] transition active:scale-95"
                    >
                      View Details
                    </button>

                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(app.id)}
                          className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] px-3.5 py-1.5 font-bold transition active:scale-95"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="rounded-xl bg-green-600 hover:bg-green-700 text-white text-[10px] px-4 py-1.5 font-bold shadow-sm transition active:scale-95"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </section>

      {/* Details Slide-Over Drawer Modal */}
      <AnimatePresence>
        {selectedAppDetails && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppId(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-over Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-10 flex h-full w-full max-w-xl flex-col bg-[#FFF8F0] shadow-2xl"
            >
              {/* Header */}
              <div
                className="relative overflow-hidden px-6 py-5 text-white shrink-0"
                style={{ backgroundImage: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)" }}
              >
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "160px" }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-xl bg-white font-heading text-lg font-bold text-[#DB2777] shadow-md border border-white/20">
                      {selectedAppDetails.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <h2 className="font-heading text-lg font-bold">{selectedAppDetails.fullName}</h2>
                      <p className="text-xs text-pink-100 uppercase tracking-wider">
                        Volunteer Application Details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAppId(null)}
                    className="grid size-8 place-items-center rounded-lg bg-black/20 hover:bg-black/35 transition"
                  >
                    <Icon name="X" className="size-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Status indicator */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                    Application ID: {selectedAppDetails.id}
                  </span>
                  <span
                    className={`inline-flex items-center border px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      selectedAppDetails.status === "pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : selectedAppDetails.status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {selectedAppDetails.status}
                  </span>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      Full Name
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {selectedAppDetails.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      Mobile Number
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {selectedAppDetails.mobile}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      Email Address
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {selectedAppDetails.email}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      Age & Gender
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {selectedAppDetails.age} yrs · {selectedAppDetails.gender}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      City
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {selectedAppDetails.city}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      Preferred Date
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {selectedAppDetails.preferredDate}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      Preferred Volunteer Role
                    </span>
                    <span className="text-[#DB2777] text-sm font-bold flex items-center gap-1">
                      <Icon name="HeartHandshake" className="size-4" />
                      {selectedAppDetails.preferredRole}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                      Preferred Time Slot
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {selectedAppDetails.preferredTimeSlot}
                    </span>
                  </div>
                </div>

                {/* Custom text areas */}
                <div className="space-y-4 pt-3 border-t border-border/60">
                  {/* Prior Experience */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">
                      Prior Experience Details
                    </label>
                    <div className="rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground leading-relaxed">
                      {selectedAppDetails.experience || "No prior volunteering experience listed."}
                    </div>
                  </div>

                  {/* Reason for volunteering */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">
                      Reason for Volunteering
                    </label>
                    <div className="rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground leading-relaxed">
                      {selectedAppDetails.reason}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">
                      Emergency Contact Details
                    </label>
                    <div className="rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground leading-relaxed">
                      {selectedAppDetails.emergencyContact || "No emergency contact listed."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-white px-6 py-4 flex items-center justify-between shrink-0">
                {selectedAppDetails.status === "pending" ? (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        handleReject(selectedAppDetails.id)
                        setSelectedAppId(null)
                      }}
                      className="flex-1 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs py-2.5 font-bold transition active:scale-95"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedAppDetails.id)
                        setSelectedAppId(null)
                      }}
                      className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs py-2.5 font-bold shadow-sm transition active:scale-95"
                    >
                      Approve Application
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-muted-foreground/75 uppercase">
                      Application Audited
                    </span>
                    <button
                      onClick={() => setSelectedAppId(null)}
                      className="rounded-xl bg-[#DB2777] hover:bg-[#BE185D] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      ) : (
        <div className="space-y-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <AdminSectionTitle title="Configure Volunteering Opportunities" icon="Settings" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="rounded-xl border border-border p-4 bg-muted/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-lg bg-pink-100 text-pink-650">
                        <Icon name={opp.icon} className="size-4" />
                      </span>
                      <h4 className="font-bold text-sm text-foreground">{opp.role}</h4>
                    </span>
                    <button
                      onClick={() => toggleOpportunityStatus(opp.id)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold transition border ${
                        opp.status === "Open" 
                          ? "bg-green-50 border-green-200 text-green-600" 
                          : "bg-red-50 border-red-200 text-red-650"
                      }`}
                    >
                      {opp.status === "Open" ? "Active (Open)" : "Inactive (Closed)"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opp.desc}</p>
                  <p className="text-[11px] font-semibold text-foreground mt-2">Duration: {opp.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
