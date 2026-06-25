"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const hotels = [
  {
    id: 1,
    name: "Shree Shyam Dharamshala",
    nameHi: "श्री श्याम धर्मशाला",
    category: "dharamshala",
    price: "₹500/night",
    distance: "100m to Temple Gate",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&auto=format&fit=crop&q=60",
    features: ["AC & Non-AC", "Geyser", "Pure Veg Kitchen", "Lift"],
    featuresHi: ["एसी और नॉन-एसी", "गीजर", "शुद्ध शाकाहारी रसोई", "लिफ्ट"],
  },
  {
    id: 2,
    name: "Radhey Ki Haveli",
    nameHi: "राधे की हवेली",
    category: "luxury",
    price: "₹4,500/night",
    distance: "300m to Temple Gate",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=60",
    features: ["Heritage Ambience", "Fine Dining", "Lawn", "WiFi"],
    featuresHi: ["हेरिटेज माहौल", "शानदार भोजन", "लॉन", "वाईफाई"],
  },
  {
    id: 3,
    name: "Hotel Lakhdatar",
    nameHi: "होटल लखदातार",
    category: "budget",
    price: "₹1,500/night",
    distance: "450m to Temple Gate",
    rating: 4.5,
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&auto=format&fit=crop&q=60",
    features: ["AC Rooms", "Room Service", "Parking", "Restaurant"],
    featuresHi: ["एसी कमरे", "रूम सर्विस", "पार्किंग", "रेस्तरां"],
  },
  {
    id: 4,
    name: "Shyam Ashram Trust",
    nameHi: "श्याम आश्रम ट्रस्ट",
    category: "dharamshala",
    price: "₹350/night",
    distance: "600m to Temple Gate",
    rating: 4.6,
    img: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=300&auto=format&fit=crop&q=60",
    features: ["Free Food (Bhandara)", "Clean Rooms", "Water Cooler"],
    featuresHi: ["मुफ्त भोजन (भंडारा)", "साफ कमरे", "वाटर कूलर"],
  },
]

export function HotelBookingScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  const [category, setCategory] = useState<string>("all")
  const [selectedHotel, setSelectedHotel] = useState<typeof hotels[0] | null>(null)
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    checkIn: "",
    guests: "2",
    rooms: "1",
  })
  const [booked, setBooked] = useState(false)

  const filteredHotels = category === "all" ? hotels : hotels.filter(h => h.category === category)

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setBooked(true)
    setTimeout(() => {
      setBooked(false)
      setSelectedHotel(null)
      setBookingForm({ name: "", phone: "", checkIn: "", guests: "2", rooms: "1" })
    }, 4000)
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <button onClick={() => navigate("services")} className="mb-2 flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white">
              <Icon name="ArrowLeft" className="size-4" /> {t("Back to Services", "सेवाओं पर वापस")}
            </button>
            <h1 className="font-heading text-xl font-bold">{t("Hotel & Dharamshala", "होटल और धर्मशाला")}</h1>
            <p className="text-xs text-white/80 mt-1">{t("Book clean & trusted stays near the temple", "मंदिर के पास साफ और विश्वसनीय ठहरने की जगह बुक करें")}</p>
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
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Icon name="MapPin" className="size-3.5 text-primary" />
                      {t(h.distance, h.distance)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {h.features.map((f, i) => (
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
                    {t("Book Stay", "बुक करें")}
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
              <h2 className="font-heading text-lg font-bold text-foreground">{t("Confirm Stay Details", "बुकिंग विवरण की पुष्टि")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t(selectedHotel.name, selectedHotel.nameHi)}</p>
            </div>
            <button onClick={() => setSelectedHotel(null)} className="text-xs font-bold text-primary hover:underline">
              {t("Change Hotel", "होटल बदलें")}
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
                  {t("Stay Booked Successfully!", "कमरा सफलतापूर्वक बुक हुआ!")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  {t("A confirmation SMS has been sent. Pay directly at the hotel counter on arrival. Ref: HT-2026-092", "पुष्टि एसएमएस भेजा गया है। आगमन पर सीधे होटल काउंटर पर भुगतान करें। संदर्भ: HT-2026-092")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("Devotee Name *", "भक्त का नाम *")}</label>
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
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("Contact Number *", "संपर्क नंबर *")}</label>
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
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("Check-In Date *", "आगमन तिथि *")}</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkIn}
                      onChange={e => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("Rooms *", "कमरे *")}</label>
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
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("Number of Guests *", "भक्तों की संख्या *")}</label>
                  <select
                    value={bookingForm.guests}
                    onChange={e => setBookingForm({ ...bookingForm, guests: e.target.value })}
                    className="dark:bg-muted dark:border-border/30"
                  >
                    {["1", "2", "3", "4", "5", "6+"].map(n => (
                      <option key={n} value={n}>{n} {t("Devotees", "भक्त")}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Check" className="size-4" />
                  {t("Confirm Stay", "बुकिंग पक्की करें")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
