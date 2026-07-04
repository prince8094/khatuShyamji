"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { useHistoryState } from "@/lib/hooks/useHistoryState"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { devoteeApi } from "@/lib/api-client"

export function ShyamBusScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { goBack } = useNavigation();
  const { t } = useLanguage()
  const [selectedRoute, setSelectedRoute] = useHistoryState<any>("route", null)
  const getTodayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    timing: "",
    seatCount: "1",
    date: getTodayStr(),
  })
  const [booked, setBooked] = useState(false)

  const [routesList, setRoutesList] = useState<any[]>([])

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await devoteeApi.getBusRoutes()

        if (data && data.length > 0) {
          setRoutesList(data.map((r: any) => ({
            id: r.id,
            dbId: String(r.id),
            from: r.from_city,
            fromHi: r.from_city,
            to: r.to_city,
            toHi: r.to_city,
            timings: [r.departure_time],
            fare: `₹${r.fare}`,
            duration: r.from_city.includes("Ringas") ? "30m" : "2h 00m"
          })))
        }
      } catch (err) {
        console.error("Failed to load routes", err)
      }
    }

    fetchRoutes()
  }, [])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    const activeUserStr = localStorage.getItem("current_user")
    let profileId = null
    if (activeUserStr) {
      try {
        profileId = JSON.parse(activeUserStr).id
      } catch (err) {}
    }

    if (!profileId) {
      profileId = "00000000-0000-0000-0000-000000000000"
    }

    const travelDateVal = bookingForm.date || new Date().toISOString().split("T")[0]
    let busRouteId = 1
    if (selectedRoute.dbId) {
      busRouteId = parseInt(selectedRoute.dbId) || 1
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        await devoteeApi.bookBus({
          bus_route_id: busRouteId,
          devotee_name: bookingForm.name,
          contact_phone: bookingForm.phone,
          travel_date: travelDateVal,
          seat_count: parseInt(bookingForm.seatCount) || 1
        })
      }

      setBooked(true)
      setTimeout(() => {
        setBooked(false)
        goBack()
         setBookingForm({ name: "", phone: "", timing: "", seatCount: "1", date: getTodayStr() })
        setSelectedRoute(null)
      }, 4000)
    } catch (err) {
      console.error("Failed to book bus ticket", err)
      alert("Failed to confirm booking. Please try again.")
    }
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <button onClick={goBack} className="mb-2 flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white">
              <Icon name="ArrowLeft" className="size-4" /> {t("screens.services.shyamBus.backToServices")}
            </button>
            <h1 className="font-heading text-xl font-bold">{t("screens.services.shyamBus.shyamBusService")}</h1>
            <p className="text-xs text-white/80 mt-1">{t("screens.services.shyamBus.officialPilgrimBusSchedulesSeatReservations")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/25 border border-white/20">
            <Icon name="BusFront" className="size-6 text-white" />
          </span>
        </div>
      </section>

      {!selectedRoute ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-[#FFF8E7] dark:bg-[#1a1107] dark:border-border/30 p-4">
            <h3 className="font-heading text-xs font-bold text-[#8a4b12] dark:text-[#f3d9b2] uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="Bus" className="size-4 text-primary" /> {t("screens.services.shyamBus.trustShuttleNotice")}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              {t("screens.services.shyamBus.busesFromRingasJunctionRunContinuouslyAndDo")}
            </p>
          </div>

          <div className="space-y-4">
            {routesList.map(r => (
              <div key={r.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{t(r.from, r.fromHi)}</span>
                      <Icon name="ArrowRight" className="size-3.5 text-muted-foreground" />
                      <span className="text-sm font-bold text-foreground">{t(r.to, r.toHi)}</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1"><Icon name="Clock" className="size-3 text-primary" /> {r.duration}</span>
                      <span className="flex items-center gap-1"><Icon name="IndianRupee" className="size-3 text-primary" /> {r.fare} / {t("screens.services.shyamBus.seat")}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-border/50 dark:border-border/20 pt-3">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">{t("screens.services.shyamBus.availableDepartures")}</p>
                  <div className="flex flex-wrap gap-2">
                    {r.timings.map((time: string, idx: number) => (
                      <span key={idx} className="text-xs font-semibold text-foreground bg-secondary/25 border border-primary/10 rounded-lg px-2.5 py-1 dark:bg-muted dark:border-border/20">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRoute(r)
                    setBookingForm({ ...bookingForm, timing: r.timings[0] })
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-xs font-bold text-white shadow transition hover:shadow-md active:scale-[0.98]"
                >
                  <Icon name="Ticket" className="size-4" />
                  {t("screens.services.shyamBus.reserveTicket")}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30 space-y-5">
          <div className="flex justify-between items-center border-b border-border/50 pb-4 dark:border-border/20">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">{t("screens.services.shyamBus.bookBusTicket")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(selectedRoute.from, selectedRoute.fromHi)} → {t(selectedRoute.to, selectedRoute.toHi)}
              </p>
            </div>
            <button onClick={() => setSelectedRoute(null)} className="text-xs font-bold text-primary hover:underline">
              {t("screens.services.shyamBus.cancel")}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {booked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-6 text-center"
              >
                <span className="grid size-16 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/30">
                  <Icon name="CheckCircle" className="size-8" />
                </span>
                <h3 className="font-heading text-lg font-bold text-green-600 dark:text-green-400">
                  {t("screens.services.shyamBus.busTicketReserved")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  {t("screens.services.shyamBus.yourTicketDetailsHaveBeenSentViaSmsShowTh")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.shyamBus.devoteeName")}</label>
                    <input
                      type="text"
                      required
                      placeholder="Nand Kumar"
                      value={bookingForm.name}
                      onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.shyamBus.contactNumber")}</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={bookingForm.phone}
                      onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.shyamBus.travelDate")}</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.shyamBus.seats")}</label>
                    <select
                      value={bookingForm.seatCount}
                      onChange={e => setBookingForm({ ...bookingForm, seatCount: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full"
                    >
                      {["1", "2", "3", "4", "5", "6+"].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.shyamBus.selectDepartureTime")}</label>
                  <select
                    value={bookingForm.timing}
                    onChange={e => setBookingForm({ ...bookingForm, timing: e.target.value })}
                    className="dark:bg-muted dark:border-border/30 w-full"
                  >
                    {selectedRoute.timings.map((time: string, idx: number) => (
                      <option key={idx} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center rounded-2xl bg-secondary/20 p-4 border border-primary/10 dark:bg-muted/50 dark:border-border/20">
                  <span className="text-xs font-bold text-foreground">{t("screens.services.shyamBus.totalPrice")}</span>
                  <span className="font-heading font-bold text-lg text-primary">
                    ₹{parseInt(selectedRoute.fare.replace(/\D/g, "") || "30") * parseInt(bookingForm.seatCount || "1")}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Check" className="size-4" />
                  {t("screens.services.shyamBus.bookBusTicket")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
