"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { useHistoryState } from "@/lib/hooks/useHistoryState"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { devoteeApi } from "@/lib/api-client"

export function TransportScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { goBack } = useNavigation();
  const { t } = useLanguage()
  const [selectedVehicle, setSelectedVehicle] = useHistoryState<any>("vehicle", null)
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    pickup: "jaipur-airport",
    customPickup: "",
    date: "",
    time: "",
  })
  const [booked, setBooked] = useState(false)

  const [vehiclesList, setVehiclesList] = useState<any[]>([])

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await devoteeApi.getTransportVehicles()

        if (data && data.length > 0) {
          setVehiclesList(data.map((v: any) => ({
            id: String(v.id),
            dbId: String(v.id),
            name: v.name,
            nameHi: v.name,
            desc: v.description || "Divine shuttle vehicle",
            descHi: v.description || "दिव्य शटल वाहन",
            fare: v.estimated_fare,
            time: "~1h 45m from Jaipur",
            icon: v.icon || "Car",
            capacity: `${v.capacity} Devotees`
          })))
        }
      } catch (err) {
        console.error("Failed to load vehicles", err)
      }
    }

    fetchVehicles()
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

    const pickupDateVal = bookingForm.date || new Date().toISOString().split("T")[0]
    const pickupTimeVal = bookingForm.time || "10:00:00"
    let vehicleId = 1
    if (selectedVehicle.dbId) {
      vehicleId = parseInt(selectedVehicle.dbId) || 1
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        await devoteeApi.bookTransport({
          vehicle_id: vehicleId,
          devotee_name: bookingForm.name,
          contact_phone: bookingForm.phone,
          pickup_point: bookingForm.pickup,
          custom_pickup_address: bookingForm.customPickup || null,
          pickup_date: pickupDateVal,
          pickup_time: pickupTimeVal
        })
      }

      setBooked(true)
      setTimeout(() => {
        setBooked(false)
        goBack()
        setBookingForm({ name: "", phone: "", pickup: "jaipur-airport", customPickup: "", date: "", time: "" })
        setSelectedVehicle(null)
      }, 4000)
    } catch (err) {
      console.error("Failed to book cab", err)
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
              <Icon name="ArrowLeft" className="size-4" /> {t("screens.services.transport.backToServices")}
            </button>
            <h1 className="font-heading text-xl font-bold">{t("screens.services.transport.transportServices")}</h1>
            <p className="text-xs text-white/80 mt-1">{t("screens.services.transport.bookCleanTrustedRidesFromStationsAirports")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/25 border border-white/20">
            <Icon name="Bus" className="size-6 text-white" />
          </span>
        </div>
      </section>

      {!selectedVehicle ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card dark:border-border/30">
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("screens.services.transport.officialRatesFareGuideline")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("screens.services.transport.templeTrustVerifiedDriversOnlyTollAndState")}
            </p>
          </div>

          <div className="space-y-4">
            {vehiclesList.map(v => (
              <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-secondary/35 text-primary dark:bg-muted dark:text-secondary shrink-0">
                    <Icon name={v.icon} className="size-8" />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base text-foreground">{t(v.name, v.nameHi)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(v.desc, v.descHi)}</p>
                    <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1"><Icon name="Users" className="size-3 text-primary" /> {v.capacity}</span>
                      <span className="flex items-center gap-1"><Icon name="Clock" className="size-3 text-primary" /> {v.time}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-auto text-left sm:text-right shrink-0 flex sm:flex-col justify-between items-center sm:items-end gap-2 border-t sm:border-t-0 border-border/55 pt-3 sm:pt-0">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("screens.services.transport.estimatedFare")}</p>
                    <p className="font-heading font-bold text-base text-primary mt-0.5">{v.fare}</p>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(v)}
                    className="rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2 text-xs font-bold text-white shadow transition hover:shadow-md active:scale-[0.98]"
                  >
                    {t("screens.services.transport.bookCab")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Ride Booking Form */
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30 space-y-5">
          <div className="flex justify-between items-center border-b border-border/50 pb-4 dark:border-border/20">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">{t("screens.services.transport.confirmRideDetails")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t(selectedVehicle.name, selectedVehicle.nameHi)}</p>
            </div>
            <button onClick={() => setSelectedVehicle(null)} className="text-xs font-bold text-primary hover:underline">
              {t("screens.services.transport.changeRide")}
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
                  {t("screens.services.transport.rideBookedSuccessfully")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  {t("screens.services.transport.aConfirmationSmsHasBeenSentWithDriverDetailsCo")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.transport.devoteeName")}</label>
                    <input
                      type="text"
                      required
                      placeholder="Devotee name"
                      value={bookingForm.name}
                      onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.transport.contactNumber")}</label>
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

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.transport.pickupPoint")}</label>
                  <select
                    value={bookingForm.pickup}
                    onChange={e => setBookingForm({ ...bookingForm, pickup: e.target.value })}
                    className="dark:bg-muted dark:border-border/30 w-full"
                  >
                    <option value="jaipur-airport">{t("screens.services.transport.jaipurAirportJap")}</option>
                    <option value="jaipur-junction">{t("screens.services.transport.jaipurJunctionJp")}</option>
                    <option value="ringas-junction">{t("screens.services.transport.ringasJunctionRgs")}</option>
                    <option value="delhi-ncr">{t("screens.services.transport.delhiNcr")}</option>
                    <option value="custom">{t("screens.services.transport.otherCustomAddress")}</option>
                  </select>
                </div>

                {bookingForm.pickup === "custom" && (
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.transport.customPickupAddress")}</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter exact address..."
                      value={bookingForm.customPickup}
                      onChange={e => setBookingForm({ ...bookingForm, customPickup: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full resize-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.transport.dateOfJourney")}</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.transport.pickupTime")}</label>
                    <input
                      type="time"
                      required
                      value={bookingForm.time}
                      onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                      className="dark:bg-muted dark:border-border/30 w-full"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Check" className="size-4" />
                  {t("screens.services.transport.confirmBooking")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
