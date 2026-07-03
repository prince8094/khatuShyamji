"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { useHistoryState } from "@/lib/hooks/useHistoryState"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { devoteeApi } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

export function HotelBookingScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { goBack } = useNavigation();
  const { t } = useLanguage()
  const [category, setCategory] = useState<string>("all")
  const [selectedHotel, setSelectedHotel] = useHistoryState<any>("hotel", null)
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    checkIn: "",
    guests: "2",
    rooms: "1",
  })
  const [booked, setBooked] = useState(false)

  const [hotelsList, setHotelsList] = useState<any[]>([])

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await devoteeApi.getHotels()

        if (data && data.length > 0) {
          setHotelsList(data.map((item: any, index: number) => {
            const cat = item.type || (item.hotel_code?.includes("DHM") ? "dharamshala" : "budget")
            return {
              id: index + 1,
              dbId: item.id,
              name: item.name,
              nameHi: item.name,
              category: cat,
              price: item.price_range || "₹800/night",
              distance: "300m to Temple Gate",
              rating: Number(item.rating) || 4.5,
              img: item.photo_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&auto=format&fit=crop&q=60",
              features: ["Pure Veg Kitchen", "AC Rooms", "Room Service", "Parking"],
              featuresHi: ["शुद्ध शाकाहारी रसोई", "एसी कमरे", "रूम सर्विस", "पार्किंग"],
              contactPhone: item.phone || "+91 98290 11002",
              address: item.address || "Main Walkway, Khatu Dham",
            }
          }))
        }
      } catch (err) {
        console.error("Failed to load hotels from Supabase", err)
      }
    }

    fetchHotels()

    // Realtime subscription to hotels update/insert
    const channel = supabase
      .channel("public:hotels")
      .on("postgres_changes", { event: "*", schema: "public", table: "hotels" }, () => {
        fetchHotels()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredHotels = category === "all" ? hotelsList : hotelsList.filter(h => h.category === category)

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

    const checkInDateVal = bookingForm.checkIn || new Date().toISOString().split("T")[0]
    const nights = 2
    const checkOutDateVal = new Date(new Date(checkInDateVal).getTime() + nights * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && selectedHotel.dbId) {
        await devoteeApi.bookHotel({
          hotel_id: selectedHotel.dbId,
          guest_name: bookingForm.name,
          guest_phone: bookingForm.phone,
          check_in_date: checkInDateVal,
          check_out_date: checkOutDateVal,
          nights_count: nights,
          guests_count: parseInt(bookingForm.guests) || 2,
          rooms_count: parseInt(bookingForm.rooms) || 1
        })
      }
      
      setBooked(true)
      setTimeout(() => {
        setBooked(false)
        goBack()
        setBookingForm({ name: "", phone: "", checkIn: "", guests: "2", rooms: "1" })
        setSelectedHotel(null)
      }, 4000)
    } catch (err) {
      console.error("Failed to save hotel booking", err)
      alert("Failed to confirm stay booking. Please try again.")
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
              <Icon name="ArrowLeft" className="size-4" /> {t("screens.services.hotelBooking.backToServices")}
            </button>
            <h1 className="font-heading text-xl font-bold">{t("screens.services.hotelBooking.hotelDharamshala")}</h1>
            <p className="text-xs text-white/80 mt-1">{t("screens.services.hotelBooking.bookCleanTrustedStaysNearTheTemple")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/25 border border-white/20">
            <Icon name="BedDouble" className="size-6 text-white" />
          </span>
        </div>
      </section>

      {!selectedHotel ? (
        <>
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", en: "All Stays", hi: "सभी ठहरने के स्थान" },
              { id: "dharamshala", en: "Dharamshala", hi: "धर्मशाला" },
              { id: "budget", en: "Budget Hotel", hi: "बजट होटल" },
              { id: "luxury", en: "Heritage/Luxury", hi: "लक्जरी स्टे" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
                  category === tab.id
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground dark:bg-muted dark:border-border/30"
                }`}
              >
                {t(tab.en, tab.hi)}
              </button>
            ))}
          </div>

          {/* Hotel Listings */}
          <div className="space-y-4">
            {filteredHotels.map(h => (
              <div key={h.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm dark:bg-card dark:border-border/30 flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-40 h-36 bg-muted shrink-0">
                  <img src={h.img} alt={h.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                    <Icon name="Star" className="size-3 text-yellow-400 fill-yellow-400" />
                    {h.rating}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-bold text-base text-foreground">{t(h.name, h.nameHi)}</h3>
                      <span className="font-heading font-bold text-sm text-primary shrink-0">{h.price}</span>
                    </div>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 font-medium">
                      <Icon name="MapPin" className="size-3.5 text-primary shrink-0" />
                      {t(h.distance, h.distance)} · {h.address}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 font-semibold">
                      <Icon name="Phone" className="size-3.5 text-primary shrink-0" />
                      {h.contactPhone}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {h.features.map((f: string, i: number) => (
                        <span key={i} className="text-[10px] font-semibold text-muted-foreground bg-secondary/35 border border-primary/10 rounded px-2 py-0.5 dark:bg-muted/50 dark:border-border/30">
                          {t(f, h.featuresHi[i])}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHotel(h)}
                    className="mt-4 w-full sm:w-auto self-end rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-bold text-white shadow transition hover:shadow-md active:scale-[0.98]"
                  >
                    {t("screens.services.hotelBooking.bookStay")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Booking Details & Form */
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30 space-y-5">
          <div className="flex justify-between items-center border-b border-border/50 pb-4 dark:border-border/20">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">{t("screens.services.hotelBooking.confirmStayDetails")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t(selectedHotel.name, selectedHotel.nameHi)}</p>
              <div className="mt-2.5 rounded-2xl bg-muted/40 p-3 border border-border/40 text-[11px] text-muted-foreground space-y-1">
                <p className="flex items-center gap-1"><Icon name="Phone" className="size-3.5 text-primary" /> <strong>Contact:</strong> {selectedHotel.contactPhone}</p>
                <p className="flex items-center gap-1 mt-0.5"><Icon name="MapPin" className="size-3.5 text-primary" /> <strong>Address:</strong> {selectedHotel.address}</p>
              </div>
            </div>
            <button onClick={() => setSelectedHotel(null)} className="text-xs font-bold text-primary hover:underline">
              {t("screens.services.hotelBooking.changeHotel")}
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
                  {t("screens.services.hotelBooking.stayBookedSuccessfully")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  {t("screens.services.hotelBooking.aConfirmationSmsHasBeenSentPayDirectlyAtT")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.hotelBooking.devoteeName")}</label>
                    <input
                      type="text"
                      required
                      placeholder="Mohan Sharma"
                      value={bookingForm.name}
                      onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.hotelBooking.contactNumber")}</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={bookingForm.phone}
                      onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.hotelBooking.checkInDate")}</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkIn}
                      onChange={e => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.hotelBooking.rooms")}</label>
                    <select
                      value={bookingForm.rooms}
                      onChange={e => setBookingForm({ ...bookingForm, rooms: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    >
                      {["1", "2", "3", "4", "5+"].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.hotelBooking.numberOfGuests")}</label>
                  <select
                    value={bookingForm.guests}
                    onChange={e => setBookingForm({ ...bookingForm, guests: e.target.value })}
                    className="dark:bg-muted dark:border-border/30"
                  >
                    {["1", "2", "3", "4", "5", "6+"].map(n => (
                      <option key={n} value={n}>{n} {t("screens.services.hotelBooking.devotees")}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Check" className="size-4" />
                  {t("screens.services.hotelBooking.confirmStay")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
