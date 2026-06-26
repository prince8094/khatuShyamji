"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const eateries = [
  {
    id: 1,
    name: "Shyam Rasoi (Trust Bhandara)",
    nameHi: "श्याम रसोई (ट्रस्ट भंडारा)",
    type: "bhandara",
    price: "Free (Donation-based)",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300&auto=format&fit=crop&q=60",
    speciality: "Desi Ghee Churma, Dal Bati, Kadhi",
    specialityHi: "देसी घी का चूरमा, दाल बाटी, कढ़ी",
    hours: "11:00 AM – 4:00 PM, 7:00 PM – 10:00 PM",
  },
  {
    id: 2,
    name: "Radhey Haveli Restaurant",
    nameHi: "राधे हवेली रेस्तरां",
    type: "premium",
    price: "₹350/person approx",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=60",
    speciality: "Royal Rajasthani Thali (Unlimited)",
    specialityHi: "शाही राजस्थानी थाली (असीमित)",
    hours: "8:00 AM – 11:00 PM",
  },
  {
    id: 3,
    name: "Baba Shyam Bhojanalaya",
    nameHi: "बाबा श्याम भोजनालय",
    type: "dhaba",
    price: "₹120/person approx",
    rating: 4.5,
    img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=60",
    speciality: "Tandoori Roti, Shahi Paneer, Dal Fry",
    specialityHi: "तंदूरी रोटी, शाही पनीर, दाल फ्राई",
    hours: "9:00 AM – 11:30 PM",
  },
  {
    id: 4,
    name: "Krishna Dairy & Sweets",
    nameHi: "कृष्णा डेयरी एंड स्वीट्स",
    type: "cafe",
    price: "₹80/person approx",
    rating: 4.6,
    img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300&auto=format&fit=crop&q=60",
    speciality: "Kesar Peda, Rabdi, Lassi, Samosa",
    specialityHi: "केसर पेड़ा, रबड़ी, लस्सी, समोसा",
    hours: "6:00 AM – 10:30 PM",
  },
]

export function RestaurantScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  const [selectedRest, setSelectedRest] = useState<typeof eateries[0] | null>(null)
  const [reserveForm, setReserveForm] = useState({
    name: "",
    phone: "",
    people: "4",
    date: "",
    time: "",
  })
  const [confirmed, setConfirmed] = useState(false)

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      setSelectedRest(null)
      setReserveForm({ name: "", phone: "", people: "4", date: "", time: "" })
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
              <Icon name="ArrowLeft" className="size-4" /> {t("screens.services.restaurant.backToServices")}
            </button>
            <h1 className="font-heading text-xl font-bold">{t("screens.services.restaurant.pureVegDining")}</h1>
            <p className="text-xs text-white/80 mt-1">{t("screens.services.restaurant.exploreBestFamilyRestaurantsThalisSweetShop")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/25 border border-white/20">
            <Icon name="UtensilsCrossed" className="size-6 text-white" />
          </span>
        </div>
      </section>

      {!selectedRest ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-[#FFF8E7] dark:bg-[#1a1107] dark:border-border/30 p-4">
            <h3 className="font-heading text-xs font-bold text-[#8a4b12] dark:text-[#f3d9b2] uppercase tracking-wider flex items-center gap-1">
              <Icon name="Heart" className="size-3.5 text-primary" /> {t("screens.services.restaurant.strictPureVegGuideline")}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              {t("screens.services.restaurant.toMaintainTheSanctityOfKhatuDhamAllRegiste")}
            </p>
          </div>

          <div className="space-y-4">
            {eateries.map(r => (
              <div key={r.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm dark:bg-card dark:border-border/30 flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-40 h-36 bg-muted shrink-0">
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                    <Icon name="Star" className="size-3 text-yellow-400 fill-yellow-400" />
                    {r.rating}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-bold text-base text-foreground">{t(r.name, r.nameHi)}</h3>
                      <span className="font-heading font-bold text-xs text-primary shrink-0">{t(r.price, r.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      <span className="font-bold text-foreground">{t("screens.services.restaurant.speciality")}</span> {t(r.speciality, r.specialityHi)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Icon name="Clock" className="size-3 text-primary" />
                      {r.hours}
                    </p>
                  </div>
                  {r.type !== "bhandara" ? (
                    <button
                      onClick={() => setSelectedRest(r)}
                      className="mt-4 w-full sm:w-auto self-end rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-bold text-white shadow transition hover:shadow-md active:scale-[0.98]"
                    >
                      {t("screens.services.restaurant.reserveTable")}
                    </button>
                  ) : (
                    <span className="mt-4 text-xs font-bold text-green-600 dark:text-green-400 self-end">
                      {t("screens.services.restaurant.noReservationRequired")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30 space-y-5">
          <div className="flex justify-between items-center border-b border-border/50 pb-4 dark:border-border/20">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">{t("screens.services.restaurant.tableReservation")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t(selectedRest.name, selectedRest.nameHi)}</p>
            </div>
            <button onClick={() => setSelectedRest(null)} className="text-xs font-bold text-primary hover:underline">
              {t("screens.services.restaurant.cancel")}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-6 text-center"
              >
                <span className="grid size-16 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/30">
                  <Icon name="CheckCircle" className="size-8" />
                </span>
                <h3 className="font-heading text-lg font-bold text-green-600 dark:text-green-400">
                  {t("screens.services.restaurant.tableReservedSuccessfully")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  {t("screens.services.restaurant.yourReservationDetailsHaveBeenSentShowSmsA")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleReservation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.restaurant.yourName")}</label>
                    <input
                      type="text"
                      required
                      placeholder="Mohan Sharma"
                      value={reserveForm.name}
                      onChange={e => setReserveForm({ ...reserveForm, name: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.restaurant.contactNumber")}</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={reserveForm.phone}
                      onChange={e => setReserveForm({ ...reserveForm, phone: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.restaurant.date")}</label>
                    <input
                      type="date"
                      required
                      value={reserveForm.date}
                      onChange={e => setReserveForm({ ...reserveForm, date: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.restaurant.people")}</label>
                    <select
                      value={reserveForm.people}
                      onChange={e => setReserveForm({ ...reserveForm, people: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    >
                      {["1", "2", "3", "4", "5", "6", "8+", "10+"].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.restaurant.preferredTime")}</label>
                  <input
                    type="time"
                    required
                    value={reserveForm.time}
                    onChange={e => setReserveForm({ ...reserveForm, time: e.target.value })}
                    className="dark:bg-muted dark:border-border/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Check" className="size-4" />
                  {t("screens.services.restaurant.confirmTableReservation")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
