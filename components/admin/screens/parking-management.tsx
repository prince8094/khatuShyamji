"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, ProgressBar, LiveDot, ActivityItem } from "@/components/admin/admin-shared"
import { parkingBlocks as initialBlocks, type AdminScreenKey, type AdminUser } from "@/lib/admin-data"

type ParkingBlockState = typeof initialBlocks[0] & {
  todayEntries: number
  todayExits: number
  lastUpdated: string
}

type ActivityLog = {
  id: string
  blockId: string
  time: string
  user: string
  action: string
  reason: string
}

export function ParkingManagementScreen({
  navigate,
  currentAdmin,
}: {
  navigate: (s: AdminScreenKey) => void
  currentAdmin?: AdminUser
}) {
  const activeUser = currentAdmin?.name || "Vijay Kumar Gupta"
  const isSuperAdmin = currentAdmin?.roles.includes("super-admin") || false

  // State for live blocks data
  const [blocks, setBlocks] = useState<ParkingBlockState[]>(() =>
    initialBlocks.map((b) => ({
      ...b,
      todayEntries: b.id === "PKG-A" ? 480 : b.id === "PKG-B" ? 350 : b.id === "PKG-C" ? 310 : 210,
      todayExits: b.id === "PKG-A" ? 60 : b.id === "PKG-B" ? 30 : b.id === "PKG-C" ? 10 : 10,
      lastUpdated: "Just now",
    }))
  )

  // Local state for audit logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: "L-1", blockId: "PKG-A", time: "11:15 AM", user: "Vikram Singh", action: "Occupancy set to 420", reason: "Standard update" },
    { id: "L-2", blockId: "PKG-B", time: "11:30 AM", user: "Vijay Kumar Gupta", action: "Occupancy set to 320", reason: "Mid-day rush" },
    { id: "L-3", blockId: "PKG-C", time: "11:00 AM", user: "Vikram Singh", action: "Status set to CLOSED", reason: "Maintenance" },
    { id: "L-4", blockId: "PKG-D", time: "09:30 AM", user: "System IoT", action: "Occupancy set to 200", reason: "Sensor automatic sync" },
  ])

  // Navigation state within the module (Manage view)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)

  // Modals state
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [modalBlockId, setModalBlockId] = useState<string | null>(null)
  const [closureReason, setClosureReason] = useState("Maintenance")
  const [expectedReopen, setExpectedReopen] = useState("12:30 PM")
  const [closureNotes, setClosureNotes] = useState("")

  const [showOccupancyModal, setShowOccupancyModal] = useState(false)
  const [occupancyBlockId, setOccupancyBlockId] = useState<string | null>(null)
  const [newOccupancy, setNewOccupancy] = useState<number>(0)
  const [occupancyError, setOccupancyError] = useState("")

  // Filter blocks list based on permission
  const visibleBlocks = blocks.filter((b) => {
    if (isSuperAdmin) return true
    if (b.assignedAdmin === activeUser) return true
    // Fallback: If this parking admin doesn't own any blocks in list, let them manage PKG-B
    const hasExplicitAssignment = blocks.some((x) => x.assignedAdmin === activeUser)
    if (!hasExplicitAssignment && b.id === "PKG-B") return true
    return false
  })

  // Calculations for dashboard summary widgets (relative only to visible scope)
  const totalCapacity = visibleBlocks.reduce((a, b) => a + b.totalCapacity, 0)
  const totalOccupied = visibleBlocks.reduce((a, b) => a + b.occupied, 0)
  const totalAvailable = visibleBlocks.reduce((a, b) => a + b.available, 0)
  const totalRevenue = visibleBlocks.reduce((a, b) => a + b.revenueToday, 0)

  // Close block execution
  const handleCloseBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalBlockId) return

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === modalBlockId) {
          return {
            ...b,
            status: "closed",
            available: b.totalCapacity, // closed frees spaces technically or blocks booking
            lastUpdated: "Just now",
          }
        }
        return b
      })
    )

    // Add entry to audit log
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      {
        id: `L-${Date.now()}`,
        blockId: modalBlockId,
        time: timeStr,
        user: activeUser,
        action: "Status set to CLOSED",
        reason: `${closureReason} (Expected reopen: ${expectedReopen}) ${closureNotes ? `· Note: ${closureNotes}` : ""}`,
      },
      ...prev,
    ])

    setShowCloseModal(false)
    setModalBlockId(null)
    setClosureNotes("")
  }

  // Reopen block execution
  const handleReopenBlock = (blockId: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            status: "open",
            lastUpdated: "Just now",
          }
        }
        return b
      })
    )

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      {
        id: `L-${Date.now()}`,
        blockId,
        time: timeStr,
        user: activeUser,
        action: "Status set to OPEN",
        reason: "Operational status restored",
      },
      ...prev,
    ])
  }

  // Update occupancy count
  const handleOccupancySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!occupancyBlockId) return

    const targetBlock = blocks.find(b => b.id === occupancyBlockId)
    if (!targetBlock) return

    if (newOccupancy < 0 || newOccupancy > targetBlock.totalCapacity) {
      setOccupancyError(`Occupancy must be between 0 and total capacity (${targetBlock.totalCapacity})`)
      return
    }

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === occupancyBlockId) {
          return {
            ...b,
            occupied: newOccupancy,
            available: b.totalCapacity - newOccupancy,
            lastUpdated: "Just now",
          }
        }
        return b
      })
    )

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      {
        id: `L-${Date.now()}`,
        blockId: occupancyBlockId,
        time: timeStr,
        user: activeUser,
        action: `Occupancy set to ${newOccupancy}`,
        reason: "Manual check count",
      },
      ...prev,
    ])

    setShowOccupancyModal(false)
    setOccupancyBlockId(null)
    setOccupancyError("")
  }

  const toggleShuttle = (blockId: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          const newState = !b.shuttleActive
          const now = new Date()
          const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
          
          setActivityLogs(logs => [
            {
              id: `L-${Date.now()}`,
              blockId,
              time: timeStr,
              user: activeUser,
              action: `Shuttle toggled to ${newState ? "ACTIVE" : "INACTIVE"}`,
              reason: "Operational adjustments",
            },
            ...logs,
          ])
          
          return {
            ...b,
            shuttleActive: newState,
            lastUpdated: "Just now",
          }
        }
        return b
      })
    )
  }

  // Active block details for the Manage Screen view
  const activeBlock = blocks.find((b) => b.id === activeBlockId)

  // Status mapping
  const statusColor = (s: string) => (s === "open" ? "green" : s === "full" ? "red" : "amber")

  // Render detail view if a block is selected for management
  if (activeBlockId && activeBlock) {
    const usagePct = Math.round((activeBlock.occupied / activeBlock.totalCapacity) * 100)
    const blockHistory = activityLogs.filter((log) => log.blockId === activeBlock.id)

    return (
      <div className="space-y-5 pb-6">
        {/* Back navigation header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveBlockId(null)}
            className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition hover:shadow-sm"
          >
            <Icon name="ChevronLeft" className="size-4" /> Back to Parking Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground">Admin: {activeBlock.assignedAdmin}</span>
            <span className="size-1 rounded-full bg-muted-foreground/30" />
            <span className="text-[11px] font-bold text-muted-foreground">{activeBlock.lastUpdated}</span>
          </div>
        </div>

        {/* SECTION 1: Block Information */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#059669] to-[#047857] p-6 text-white shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-block rounded-lg bg-white/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white border border-white/10 mb-2">
                Section 1 · Block Information
              </span>
              <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
                {activeBlock.name}
                <span className="text-xs bg-black/25 px-2 py-0.5 rounded-md font-mono font-normal">
                  {activeBlock.id}
                </span>
              </h1>
              <p className="text-xs text-white/80 mt-1">
                Vehicle Types: <span className="font-bold">{activeBlock.vehicleTypes.join(", ")}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-bold bg-white/10`}>
                <span className={cn("size-2 rounded-full", 
                  activeBlock.status === "open" ? "bg-green-400 animate-pulse" :
                  activeBlock.status === "full" ? "bg-red-400" : "bg-amber-400 animate-pulse"
                )} />
                STATUS: {activeBlock.status.toUpperCase()}
              </span>
              <button
                onClick={() => {
                  if (activeBlock.status === "closed") {
                    handleReopenBlock(activeBlock.id)
                  } else {
                    setModalBlockId(activeBlock.id)
                    setShowCloseModal(true)
                  }
                }}
                className={cn("rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm", 
                  activeBlock.status === "closed" 
                    ? "bg-white text-green-700 hover:bg-green-50" 
                    : "bg-red-600 text-white hover:bg-red-700"
                )}
              >
                {activeBlock.status === "closed" ? "Reopen Block" : "Close Block"}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: Current Occupancy */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground border-b border-border/80 pb-1">
              Section 2 · Current Occupancy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Progress Radial bar simulation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>Slots Utilization</span>
                <span className={cn(usagePct > 90 ? "text-red-500" : usagePct > 70 ? "text-orange-500" : "text-green-600")}>
                  {usagePct}% Filled
                </span>
              </div>
              <ProgressBar
                value={activeBlock.occupied}
                max={activeBlock.totalCapacity}
                color={usagePct > 90 ? "red" : usagePct > 70 ? "orange" : "green"}
                showLabel={false}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>Occupied: <strong>{activeBlock.occupied}</strong></span>
                <span>Available: <strong>{activeBlock.available}</strong></span>
                <span>Capacity: <strong>{activeBlock.totalCapacity}</strong> (Fixed)</span>
              </div>
            </div>

            {/* Occupancy management controls */}
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Occupancy Control</span>
                <button
                  onClick={() => {
                    setOccupancyBlockId(activeBlock.id)
                    setNewOccupancy(activeBlock.occupied)
                    setShowOccupancyModal(true)
                  }}
                  className="rounded-lg bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs font-bold text-white transition active:scale-[0.98]"
                >
                  Set Count
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={activeBlock.occupied <= 0}
                  onClick={() => {
                    const newCount = activeBlock.occupied - 1
                    setBlocks(prev => prev.map(b => b.id === activeBlock.id ? { ...b, occupied: newCount, available: b.totalCapacity - newCount } : b))
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-bold hover:bg-muted/50 disabled:opacity-50 transition"
                >
                  <Icon name="Minus" className="size-3.5" /> Devotee Left (-1)
                </button>
                <button
                  disabled={activeBlock.occupied >= activeBlock.totalCapacity}
                  onClick={() => {
                    const newCount = activeBlock.occupied + 1
                    setBlocks(prev => prev.map(b => b.id === activeBlock.id ? { ...b, occupied: newCount, available: b.totalCapacity - newCount } : b))
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-bold hover:bg-muted/50 disabled:opacity-50 transition"
                >
                  <Icon name="Plus" className="size-3.5" /> Vehicle Entered (+1)
                </button>
              </div>
              <hr className="border-border/60 my-1" />
              <label className="flex items-center justify-between cursor-pointer select-none py-1">
                <span className="text-xs font-bold text-foreground">Shuttle Service Status</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold ${activeBlock.shuttleActive ? "text-green-600" : "text-muted-foreground"}`}>
                    {activeBlock.shuttleActive ? "ACTIVE" : "DISABLED"}
                  </span>
                  <input
                    type="checkbox"
                    checked={activeBlock.shuttleActive}
                    onChange={() => toggleShuttle(activeBlock.id)}
                    className="size-5 rounded accent-green-600"
                  />
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* SECTION 3: Today's Statistics */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground border-b border-border/80 pb-1">
              Section 3 · Today's Statistics
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon="ChevronRight" label="Today's Entries" value={activeBlock.todayEntries} sub="cumulative count" />
            <MetricCard icon="ChevronLeft" label="Today's Exits" value={activeBlock.todayExits} sub="left the block" />
            <MetricCard icon="IndianRupee" label="Revenue Earned" value={`₹${activeBlock.revenueToday.toLocaleString()}`} sub="cash/online flows" />
            <MetricCard icon="TrendingUp" label="Average Saturation" value={`${usagePct}%`} sub="saturation level" trendUp={usagePct < 90} />
          </div>
        </section>

        {/* SECTION 4: Recent Activity Timeline */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground border-b border-border/80 pb-1">
              Section 4 · Recent Activity Timeline
            </span>
          </div>

          {blockHistory.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">No recent logs logged for this block.</p>
          ) : (
            <div className="space-y-4">
              {blockHistory.map((log) => (
                <div key={log.id} className="flex items-start gap-4 border-l-2 border-green-500 pl-4 py-1 relative">
                  <span className="absolute -left-[6px] top-2.5 size-2.5 rounded-full bg-green-600" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">{log.action}</p>
                      <span className="text-[10px] font-semibold text-muted-foreground font-mono">{log.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.reason}</p>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1">Logged by: {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Close Modal Portal */}
        {renderCloseBlockModal()}

        {/* Occupancy Modal Portal */}
        {renderOccupancyModal()}
      </div>
    )
  }

  // Dashboard Overview (Read-Only list of assigned blocks, NO global quick actions)
  return (
    <div className="space-y-5 pb-6">
      {/* Read-Only Stats Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#059669] to-[#047857] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold">Parking Command Console</h1>
            <p className="text-xs text-white/80 mt-1">
              {isSuperAdmin ? "Super Admin View · Full System Scope" : `Block Manager View · Managed by: ${activeUser}`}
            </p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20 shrink-0">
            <Icon name="SquareParking" className="size-6" />
          </span>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Total Space Capacity", value: totalCapacity },
            { label: "Spaces Occupied", value: totalOccupied },
            { label: "Spaces Available", value: totalAvailable },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2.5 text-center border border-white/5">
              <p className="text-[10px] text-white/70 tracking-wide uppercase font-semibold">{s.label}</p>
              <p className="font-heading text-lg font-extrabold text-white mt-0.5">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metric Blocks widgets */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="IndianRupee" label="Revenue Today (Assigned Scope)" value={`₹${(totalRevenue / 1000).toFixed(0)}K`} sub="cumulative total" />
        <MetricCard icon="Car" label="Live Vehicles Parked" value={totalOccupied} sub="current occupancy count" />
      </div>

      {/* Main Managed Block Cards */}
      <section>
        <AdminSectionTitle
          title="Assigned Parking Blocks"
          icon="LayoutGrid"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
              <LiveDot color="bg-green-500" /> Live
            </span>
          }
        />
        <div className="grid grid-cols-1 gap-4">
          {visibleBlocks.map((block) => {
            const usagePct = Math.round((block.occupied / block.totalCapacity) * 100)
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 place-items-center rounded-xl shadow-sm ${
                      block.status === "open" ? "bg-green-50 text-green-600" :
                      block.status === "full" ? "bg-red-50 text-red-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      <Icon name="SquareParking" className="size-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-sm font-bold text-foreground">{block.name}</p>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-muted-foreground">{block.id}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Manager: <span className="font-semibold">{block.assignedAdmin}</span> · Types: <span className="font-semibold">{block.vehicleTypes.join(", ")}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                    statusColor(block.status) === "green" ? "bg-green-50 text-green-700 border-green-200" :
                    statusColor(block.status) === "red" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    <span className={`size-1.5 rounded-full ${
                      statusColor(block.status) === "green" ? "bg-green-500" :
                      statusColor(block.status) === "red" ? "bg-red-500" :
                      "bg-amber-500"
                    }`} />
                    {block.status}
                  </span>
                </div>

                 {/* Progress bar ratio */}
                 <div className="mt-3">
                   <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                     <span>Space Saturation</span>
                     <span>{usagePct}% Filled</span>
                   </div>
                   <ProgressBar
                     value={block.occupied}
                     max={block.totalCapacity}
                     color={usagePct > 90 ? "red" : usagePct > 70 ? "orange" : "green"}
                     showLabel={false}
                   />
                 </div>

                 {/* Operational Info Grid */}
                 <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-left text-xs">
                   <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                     <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Destination Location</p>
                     <p className="font-bold text-foreground mt-1 truncate">{block.locationInfo}</p>
                   </div>
                   <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                     <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Occupancy Count</p>
                     <p className="font-bold text-foreground mt-1">{block.occupied} / {block.totalCapacity} Lots</p>
                   </div>
                   <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                     <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Assigned Workers</p>
                     <p className="font-bold text-foreground mt-1">{block.totalWorkers} Attendants</p>
                   </div>
                   <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                     <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Vehicle Entries / Exits</p>
                     <p className="font-bold text-foreground mt-1">In: {block.todayEntries} · Out: {block.todayExits}</p>
                   </div>
                   <div className="rounded-xl bg-muted/40 p-3 border border-border/40 col-span-1 md:col-span-2">
                     <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Vehicle Type Distribution</p>
                     <div className="flex gap-2.5 mt-1 font-semibold text-foreground text-[10px]">
                       <span>🚗 Cars: {block.distribution.cars}</span>
                       <span>🏍️ Bikes: {block.distribution.bikes}</span>
                       <span>🚌 Others: {block.distribution.others}</span>
                     </div>
                   </div>
                 </div>

                 {/* Revenue & Shuttle */}
                 <div className="mt-3 flex items-center justify-between text-xs bg-green-50/50 border border-green-100 rounded-xl px-3 py-2">
                   <span className="font-medium text-green-800">Weekly Revenue History:</span>
                   <span className="font-bold text-green-700">{block.revenueHistory.join(" · ")}</span>
                 </div>

                {/* Context actions panels */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveBlockId(block.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-muted/40 transition hover:shadow-sm"
                  >
                    <Icon name="Settings" className="size-3.5 text-muted-foreground" /> Manage
                  </button>
                  <button
                    onClick={() => {
                      setOccupancyBlockId(block.id)
                      setNewOccupancy(block.occupied)
                      setShowOccupancyModal(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-muted/40 transition hover:shadow-sm"
                  >
                    <Icon name="Car" className="size-3.5 text-muted-foreground" /> Update Occupancy
                  </button>
                  <button
                    onClick={() => {
                      if (block.status === "closed") {
                        handleReopenBlock(block.id)
                      } else {
                        setModalBlockId(block.id)
                        setShowCloseModal(true)
                      }
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition active:scale-[0.98]",
                      block.status === "closed" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                    )}
                  >
                    <Icon name={block.status === "closed" ? "CheckCircle" : "XCircle"} className="size-3.5" />
                    {block.status === "closed" ? "Open Block" : "Close Block"}
                  </button>
                  <button
                    onClick={() => {
                      setActiveBlockId(block.id)
                      // Small timeout to allow transition before jumping down
                      setTimeout(() => {
                        const el = document.getElementById("timeline-section")
                        if (el) el.scrollIntoView({ behavior: "smooth" })
                      }, 100)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-muted/40 transition hover:shadow-sm"
                  >
                    <Icon name="History" className="size-3.5 text-muted-foreground" /> History
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Global general audit feed at dashboard end */}
      <section>
        <AdminSectionTitle title="General Operations Activity" icon="Activity" />
        <div className="rounded-2xl border border-border bg-card px-4 py-2 shadow-sm">
          {activityLogs.slice(0, 3).map((log) => (
            <ActivityItem
              key={log.id}
              time={log.time}
              action={`${log.action} on ${log.blockId} (${log.reason})`}
              department="parking"
              actor={log.user}
              icon="SquareParking"
            />
          ))}
        </div>
      </section>

      {/* Modals Portals */}
      {renderCloseBlockModal()}
      {renderOccupancyModal()}
    </div>
  )

  // Helper: render close block validation modal
  function renderCloseBlockModal() {
    if (!showCloseModal) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold text-foreground">Close Parking Block</h3>
            <button
              onClick={() => {
                setShowCloseModal(false)
                setModalBlockId(null)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleCloseBlockSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Closure Reason *</label>
              <select
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
                required
              >
                <option value="Maintenance">Maintenance & Gate Repairs</option>
                <option value="VIP Movement">VIP Protocol Priority</option>
                <option value="Severe Weather">Severe Rain / Flooding</option>
                <option value="Accident / Obstruction">Accident inside block</option>
                <option value="Operational Overload">System Reconfiguration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Expected Reopen Time *</label>
              <input
                type="text"
                value={expectedReopen}
                onChange={(e) => setExpectedReopen(e.target.value)}
                placeholder="e.g. 2 hours, 12:30 PM, etc."
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Notes (Optional)</label>
              <textarea
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                placeholder="Additional notes for shift supervisor logs…"
                rows={3}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-green-600 focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCloseModal(false)
                  setModalBlockId(null)
                }}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Confirm Block Closure
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  // Helper: render update occupancy modal
  function renderOccupancyModal() {
    if (!showOccupancyModal) return null
    const targetBlock = blocks.find(b => b.id === occupancyBlockId)
    if (!targetBlock) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Update Block Occupancy</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{targetBlock.name} (Max Capacity: {targetBlock.totalCapacity})</p>
            </div>
            <button
              onClick={() => {
                setShowOccupancyModal(false)
                setOccupancyBlockId(null)
                setOccupancyError("")
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleOccupancySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Current Vehicles Count</label>
              <input
                type="number"
                value={newOccupancy}
                onChange={(e) => {
                  setNewOccupancy(parseInt(e.target.value) || 0)
                  setOccupancyError("")
                }}
                min={0}
                max={targetBlock.totalCapacity}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-green-600 focus:outline-none"
                required
              />
              {occupancyError && (
                <p className="text-[10px] font-bold text-red-500 mt-1.5">{occupancyError}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowOccupancyModal(false)
                  setOccupancyBlockId(null)
                  setOccupancyError("")
                }}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Update Count
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }
}
