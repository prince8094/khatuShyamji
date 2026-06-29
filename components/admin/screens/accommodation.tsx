"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, AdminCard, MetricCard, ProgressBar, LiveDot, QuickAction, ActivityItem } from "@/components/admin/admin-shared"
import { hotels, type AdminScreenKey } from "@/lib/admin-data"

export function AccommodationScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const totalRooms = hotels.reduce((a, h) => a + h.totalRooms, 0)
  const occupied = hotels.reduce((a, h) => a + h.occupied, 0)
  const available = hotels.reduce((a, h) => a + h.available, 0)
  const todayIns = hotels.reduce((a, h) => a + h.todayCheckIns, 0)
  const todayOuts = hotels.reduce((a, h) => a + h.todayCheckOuts, 0)
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null)

  const statusColor = (s: string) => s === "active" ? "green" : s === "maintenance" ? "amber" : "red"

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Accommodation</h1>
            <p className="text-sm text-white/80 mt-1">Hotel & room management</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="BedDouble" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Total Rooms", value: totalRooms },
            { label: "Occupied", value: occupied },
            { label: "Available", value: available },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="LogIn" label="Today's Check-ins" value={todayIns} sub="guests arriving" />
        <MetricCard icon="LogOut" label="Today's Check-outs" value={todayOuts} sub="guests departing" />
      </div>

      {/* Quick Actions */}
      <section>
        <AdminSectionTitle title="Quick Actions" icon="Zap" />
        <div className="grid grid-cols-3 gap-2">
          <QuickAction icon="Plus" label="Add Room" />
          <QuickAction icon="IndianRupee" label="Update Pricing" />
          <QuickAction icon="Bell" label="Hotel Alert" />
        </div>
      </section>

      {/* Hotel Cards */}
      <section>
        <AdminSectionTitle
          title="Managed Hotels"
          icon="Building"
          action={
            <span className="text-[11px] font-semibold text-muted-foreground">
              {hotels.length} hotels
            </span>
          }
        />
        <div className="space-y-3">
          {hotels.map((hotel) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
                      <Icon name="Building" className="size-5" />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground">{hotel.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Icon key={i} name="Star" className="size-3 text-[#D4AF37] fill-[#D4AF37]" />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1">· {hotel.rating}★</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    statusColor(hotel.status) === "green" ? "bg-green-50 text-green-700 border-green-200" :
                    statusColor(hotel.status) === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    <span className={`size-1.5 rounded-full ${
                      statusColor(hotel.status) === "green" ? "bg-green-500" :
                      statusColor(hotel.status) === "amber" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                  </span>
                </div>

                {/* Occupancy Bar */}
                <div className="mt-3">
                  <ProgressBar
                    value={hotel.occupied}
                    max={hotel.totalRooms}
                    color={hotel.occupied / hotel.totalRooms > 0.9 ? "red" : hotel.occupied / hotel.totalRooms > 0.7 ? "orange" : "green"}
                  />
                </div>

                {/* Stats Row */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="font-heading text-sm font-bold">{hotel.totalRooms}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Occupied</p>
                    <p className="font-heading text-sm font-bold text-blue-600">{hotel.occupied}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Available</p>
                    <p className="font-heading text-sm font-bold text-green-600">{hotel.available}</p>
                  </div>
                </div>

                {/* Price & Admin */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon name="IndianRupee" className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-muted-foreground">{hotel.priceRange}</span>
                  </div>
                  <button className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:text-[#B45309] transition">
                    Manage <Icon name="ArrowRight" className="size-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <AdminSectionTitle title="Recent Activity" icon="Activity" />
        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm">
          <ActivityItem time="11:45 AM" action="Shyam Palace — 15 new check-ins processed" department="accommodation" actor="Priya S." icon="LogIn" />
          <ActivityItem time="10:30 AM" action="Bhakti Niwas — Room 204 maintenance reported" department="accommodation" actor="Staff" icon="Wrench" />
          <ActivityItem time="09:15 AM" action="Khatu Dham Residency — Pricing updated for peak season" department="accommodation" actor="Priya S." icon="IndianRupee" />
        </div>
      </section>
    </div>
  )
}
