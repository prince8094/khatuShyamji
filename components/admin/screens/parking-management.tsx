"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, ProgressBar, LiveDot, QuickAction, ActivityItem } from "@/components/admin/admin-shared"
import { parkingBlocks, type AdminScreenKey } from "@/lib/admin-data"

export function ParkingManagementScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const totalCapacity = parkingBlocks.reduce((a, b) => a + b.totalCapacity, 0)
  const totalOccupied = parkingBlocks.reduce((a, b) => a + b.occupied, 0)
  const totalAvailable = parkingBlocks.reduce((a, b) => a + b.available, 0)
  const totalRevenue = parkingBlocks.reduce((a, b) => a + b.revenueToday, 0)

  const statusColor = (s: string) => s === "open" ? "green" as const : s === "full" ? "red" as const : "amber" as const

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#059669] to-[#047857] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Parking Management</h1>
            <p className="text-sm text-white/80 mt-1">Block operations & vehicle tracking</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="SquareParking" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Total Capacity", value: totalCapacity.toLocaleString() },
            { label: "Occupied", value: totalOccupied.toLocaleString() },
            { label: "Available", value: totalAvailable.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="IndianRupee" label="Revenue Today" value={`₹${(totalRevenue / 1000).toFixed(0)}K`} sub="from all blocks" trend="+18%" trendUp />
        <MetricCard icon="Car" label="Vehicles Today" value={totalOccupied} sub="currently parked" />
      </div>

      {/* Quick Actions */}
      <section>
        <AdminSectionTitle title="Quick Actions" icon="Zap" />
        <div className="grid grid-cols-3 gap-2">
          <QuickAction icon="XCircle" label="Close Block" variant="danger" />
          <QuickAction icon="PlusCircle" label="Open Overflow" variant="success" />
          <QuickAction icon="IndianRupee" label="Update Rates" />
        </div>
      </section>

      {/* Parking Block Cards */}
      <section>
        <AdminSectionTitle
          title="Parking Blocks"
          icon="LayoutGrid"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
              <LiveDot color="bg-green-500" /> Live
            </span>
          }
        />
        <div className="space-y-3">
          {parkingBlocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
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
                    <p className="font-heading text-sm font-bold text-foreground">{block.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{block.vehicleTypes.join(", ")}</span>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                  statusColor(block.status) === "green" ? "bg-green-50 text-green-700 border-green-200" :
                  statusColor(block.status) === "red" ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <span className={`size-1.5 rounded-full ${
                    statusColor(block.status) === "green" ? "bg-green-500" :
                    statusColor(block.status) === "red" ? "bg-red-500" :
                    "bg-amber-500"
                  }`} />
                  {block.status.toUpperCase()}
                </span>
              </div>

              {/* Capacity Bar */}
              <div className="mt-3">
                <ProgressBar
                  value={block.occupied}
                  max={block.totalCapacity}
                  color={block.occupied / block.totalCapacity > 0.9 ? "red" : block.occupied / block.totalCapacity > 0.7 ? "orange" : "green"}
                />
              </div>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Capacity</p>
                  <p className="font-heading text-sm font-bold">{block.totalCapacity}</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                  <p className="font-heading text-sm font-bold text-green-600">₹{(block.revenueToday / 1000).toFixed(0)}K</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Shuttle</p>
                  <p className={`font-heading text-sm font-bold ${block.shuttleActive ? "text-green-600" : "text-muted-foreground"}`}>
                    {block.shuttleActive ? "Active" : "Off"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 py-2 text-[11px] font-bold text-foreground transition hover:bg-muted/50">
                  <Icon name="Settings" className="size-3.5" /> Manage
                </button>
                <button className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold text-white transition ${
                  block.status === "open" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`}>
                  <Icon name={block.status === "open" ? "XCircle" : "CheckCircle"} className="size-3.5" />
                  {block.status === "open" ? "Close" : "Reopen"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <AdminSectionTitle title="Recent Activity" icon="Activity" />
        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm">
          <ActivityItem time="11:15 AM" action="Parking Block C marked FULL — redirecting to Lot D" department="parking" actor="Vikram S." icon="SquareParking" />
          <ActivityItem time="10:00 AM" action="Shuttle service started for Lot D → Temple Gate 1" department="parking" actor="System" icon="Bus" />
          <ActivityItem time="08:30 AM" action="Morning rate activated — ₹50/hour for cars" department="parking" actor="Vikram S." icon="IndianRupee" />
        </div>
      </section>
    </div>
  )
}
