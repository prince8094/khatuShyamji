"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, LiveDot } from "@/components/admin/admin-shared"
import { sevaBookings as initialBookings, type AdminScreenKey } from "@/lib/admin-data"

type SevaBooking = typeof initialBookings[0]

export function SevaManagementScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [bookings, setBookings] = useState<SevaBooking[]>(initialBookings)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const [toastMsg, setToastMsg] = useState("")

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3500)
  }

  // Update status lifecycle handler
  const transitionStatus = (bookingId: string, nextStatus: SevaBooking["status"]) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: nextStatus } : b))
    )
    const target = bookings.find(b => b.id === bookingId)
    if (target) {
      triggerToast(`Booking status for ${target.devoteeName} updated to "${nextStatus}"`)
    }
  }

  // Get Payment status based on Booking Lifecycle status
  const getPaymentStatus = (status: SevaBooking["status"]) => {
    switch (status) {
      case "Booking Created":
        return { label: "Pending Payment", color: "text-amber-600 bg-amber-50 border-amber-100" }
      case "Payment Completed":
      case "Active":
      case "Completed":
        return { label: "Paid", color: "text-green-600 bg-green-50 border-green-100" }
      case "Cancelled":
        return { label: "Cancelled", color: "text-gray-500 bg-gray-50 border-gray-100" }
      case "Refunded":
        return { label: "Refunded", color: "text-red-600 bg-red-50 border-red-100" }
      default:
        return { label: "Unknown", color: "text-muted-foreground bg-muted" }
    }
  }

  // Filter & Search Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filter === "all" || b.status === filter
    const matchesSearch = b.devoteeName.toLowerCase().includes(search.toLowerCase()) || b.sevaName.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#DB2777] to-[#BE185D] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Seva Bookings Ledger</h1>
            <p className="text-xs text-white/80 mt-1">Devotee ritual registration & lifecycle coordination</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Heart" className="size-6 text-white" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Active Passes", value: bookings.filter(b => b.status === "Active").length },
            { label: "Pending Payments", value: bookings.filter(b => b.status === "Booking Created").length },
            { label: "Completed today", value: bookings.filter(b => b.status === "Completed").length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center border border-white/5">
              <p className="text-[10px] text-white/70 uppercase tracking-wide font-semibold">{s.label}</p>
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

      {/* Filters ledger bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-card border border-border rounded-2xl p-3 shadow-sm">
        <div className="flex gap-1 bg-secondary/80 p-1 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
          {["all", "Booking Created", "Payment Completed", "Active", "Completed", "Cancelled", "Refunded"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                filter === f ? "bg-[#DB2777] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All Bookings" : f}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Icon name="Search" className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by devotee name or seva…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 pl-9 pr-4 py-2 text-xs font-bold focus:border-[#DB2777] focus:outline-none"
          />
        </div>
      </div>

      {/* Bookings lists queue */}
      <section>
        <AdminSectionTitle
          title="Devotee Bookings List"
          icon="ClipboardList"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-pink-600">
              <LiveDot color="bg-pink-500" /> Active Roster
            </span>
          }
        />
        
        <div className="grid grid-cols-1 gap-3.5">
          {filteredBookings.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">No matching seva bookings found.</p>
          ) : (
            filteredBookings.map((b) => {
              const pay = getPaymentStatus(b.status)
              return (
                <motion.div
                  key={b.id}
                  layoutId={b.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div>
                      <p className="font-heading text-sm font-extrabold text-foreground">{b.devoteeName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Seva: <span className="font-bold text-foreground">{b.sevaName}</span></p>
                      <p className="text-[10px] text-muted-foreground mt-1">Date: <span className="font-semibold">{b.date}</span></p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center border px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${pay.color}`}>
                        {pay.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        b.status === "Completed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        b.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                        b.status === "Booking Created" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        b.status === "Payment Completed" ? "bg-pink-50 text-pink-700 border-pink-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          b.status === "Completed" ? "bg-blue-500" :
                          b.status === "Active" ? "bg-green-500" :
                          b.status === "Booking Created" ? "bg-amber-500 animate-pulse" :
                          b.status === "Payment Completed" ? "bg-pink-500" : "bg-red-500"
                        }`} />
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions Transition Bar */}
                  <div className="mt-3.5 border-t border-border/40 pt-3 flex flex-wrap gap-2">
                    {b.status === "Booking Created" && (
                      <>
                        <button
                          onClick={() => transitionStatus(b.id, "Payment Completed")}
                          className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] py-1.5 font-bold shadow-sm"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => transitionStatus(b.id, "Cancelled")}
                          className="rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[10px] px-3.5 py-1.5 font-bold"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {b.status === "Payment Completed" && (
                      <>
                        <button
                          onClick={() => transitionStatus(b.id, "Active")}
                          className="flex-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[10px] py-1.5 font-bold shadow-sm"
                        >
                          Activate Pass
                        </button>
                        <button
                          onClick={() => transitionStatus(b.id, "Refunded")}
                          className="rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[10px] px-3.5 py-1.5 font-bold"
                        >
                          Refund Payment
                        </button>
                      </>
                    )}

                    {b.status === "Active" && (
                      <>
                        <button
                          onClick={() => transitionStatus(b.id, "Completed")}
                          className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1.5 font-bold shadow-sm"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => transitionStatus(b.id, "Cancelled")}
                          className="rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[10px] px-3.5 py-1.5 font-bold"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {(b.status === "Completed" || b.status === "Cancelled" || b.status === "Refunded") && (
                      <span className="text-[10px] text-muted-foreground font-semibold italic py-1">
                        Terminal lifecycle state reached.
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
