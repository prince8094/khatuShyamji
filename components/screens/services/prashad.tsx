"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import type { ScreenKey } from "@/lib/data"
import { useHistoryState } from "@/lib/hooks/useHistoryState"

 

const prashadItems = [
  {
    id: 1,
    name: "Desi Ghee Churma Prashad",
    nameHi: "देसी घी चूरमा प्रसाद",
    price: 320,
    weight: "500g Box",
    weightHi: "500 ग्राम डिब्बा",
    desc: "Traditional, home-cooked sweet prasad prepared in pure desi ghee.",
    descHi: "शुद्ध देसी घी में तैयार किया गया पारंपरिक और स्वादिष्ट मीठा प्रसाद।",
    img: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Makhan Mishri & dry fruits",
    nameHi: "माखन मिश्री और सूखे मेवे",
    price: 180,
    weight: "250g Box",
    weightHi: "250 ग्राम डिब्बा",
    desc: "Shri Krishna's favorite makhan mishri combined with premium almonds & cashews.",
    descHi: "श्री कृष्ण की पसंदीदा माखन मिश्री के साथ प्रीमियम बादाम और काजू।",
    img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Baba Shyam Khazana (Silver coins + dry fruits)",
    nameHi: "बाबा श्याम खजाना (चांदी का सिक्का + सूखे मेवे)",
    price: 650,
    weight: "Premium Gift Box",
    weightHi: "प्रीमियम उपहार डिब्बा",
    desc: "Blessed silver coin with Baba's relief work, dry fruits, and incense sticks.",
    descHi: "बाबा के रिलीफ वर्क के साथ अभिमंत्रित चांदी का सिक्का, सूखे मेवे और धूपबत्ती।",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&auto=format&fit=crop&q=60",
  },
]

export function PrashadScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
 
  const { t } = useLanguage()
  const { goBack } = useNavigation()
  const [quantities, setQuantities] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 })
  const [deliveryType, setDeliveryType] = useState<"pickup" | "home">("pickup")
  const [checkout, setCheckout] = useHistoryState<boolean>("checkout", false)
  const [shippingForm, setShippingForm] = useState({
    name: "",
    phone: "",
    address: "",
    postalCode: "",
  })
  const [ordered, setOrdered] = useState(false)

  const handleQtyChange = (id: number, type: "inc" | "dec") => {
    setQuantities(prev => {
      const current = prev[id] || 0
      const next = type === "inc" ? current + 1 : Math.max(0, current - 1)
      return { ...prev, [id]: next }
    })
  }

  const totalPrice = prashadItems.reduce((acc, item) => acc + item.price * (quantities[item.id] || 0), 0)
  const totalItemsCount = Object.values(quantities).reduce((acc, q) => acc + q, 0)

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setOrdered(true)
    setTimeout(() => {
      setOrdered(false)
      goBack()
      setQuantities({ 1: 0, 2: 0, 3: 0 })
      setShippingForm({ name: "", phone: "", address: "", postalCode: "" })
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
              <Icon name="ArrowLeft" className="size-4" /> {t("screens.services.prashad.backToServices")}
            </button>
            <h1 className="font-heading text-xl font-bold">{t("screens.services.prashad.sacredPrashad")}</h1>
            <p className="text-xs text-white/80 mt-1">{t("screens.services.prashad.orderPureBhogPrashadForCounterPickupOrHome")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/25 border border-white/20">
            <Icon name="ShoppingBag" className="size-6 text-white" />
          </span>
        </div>
      </section>

      {!checkout ? (
        <div className="space-y-5">
          {/* Prashad items */}
          <div className="space-y-4">
            {prashadItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm dark:bg-card dark:border-border/30">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-secondary/30 text-primary dark:bg-muted shrink-0 overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">{t(item.name, item.nameHi)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(item.desc, item.descHi)}</p>
                    <p className="text-xs font-bold text-primary mt-2">
                      ₹{item.price} · {t(item.weight, item.weightHi)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleQtyChange(item.id, "dec")}
                    className="grid size-8 place-items-center rounded-lg bg-secondary/30 text-primary hover:bg-secondary/50 dark:bg-muted dark:border dark:border-border/30"
                  >
                    <Icon name="Minus" className="size-4" />
                  </button>
                  <span className="font-heading font-bold text-sm w-4 text-center">{quantities[item.id] || 0}</span>
                  <button
                    onClick={() => handleQtyChange(item.id, "inc")}
                    className="grid size-8 place-items-center rounded-lg bg-primary text-white hover:bg-primary/90"
                  >
                    <Icon name="Plus" className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Footer */}
          {totalItemsCount > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky bottom-20 lg:bottom-4 rounded-3xl bg-gradient-to-r from-primary to-secondary p-4 text-white shadow-lg flex items-center justify-between gap-4 z-40"
            >
              <div>
                <p className="text-xs text-white/80">{t("screens.services.prashad.totalAmount")}</p>
                <p className="font-heading font-bold text-lg">₹{totalPrice}</p>
              </div>
              <button
                onClick={() => setCheckout(true)}
                className="rounded-2xl bg-white text-primary px-6 py-3 text-xs font-bold shadow-md hover:bg-white/95 active:scale-[0.98] transition"
              >
                {t("screens.services.prashad.proceedToOrder")}
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        /* Order Checkout Form */
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30 space-y-5">
          <div className="flex justify-between items-center border-b border-border/50 pb-4 dark:border-border/20">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">{t("screens.services.prashad.bhogOrderCheckout")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t("screens.services.prashad.totalItemsLabel", { totalPrice, totalItemsCount })}</p>
            </div>
            <button onClick={goBack} className="text-xs font-bold text-primary hover:underline">
              {t("screens.services.prashad.editCart")}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {ordered ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-6 text-center"
              >
                <span className="grid size-16 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/30">
                  <Icon name="CheckCircle" className="size-8" />
                </span>
                <h3 className="font-heading text-lg font-bold text-green-600 dark:text-green-400">
                  {t("screens.services.prashad.orderPlacedSuccessfully")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  {deliveryType === "pickup"
                    ? t("screens.services.prashad.collectYourPrashadBoxFromCounter4NearPrasa")
                    : t("screens.services.prashad.yourPrashadPacketHasBeenPreparedAndWillRea")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-4">
                {/* Delivery Options */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/20 dark:bg-muted/50 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      deliveryType === "pickup" ? "bg-primary text-white shadow" : "text-muted-foreground"
                    }`}
                  >
                    <Icon name="Package" className="size-3.5" />
                    {t("screens.services.prashad.counterPickup")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("home")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      deliveryType === "home" ? "bg-primary text-white shadow" : "text-muted-foreground"
                    }`}
                  >
                    <Icon name="Home" className="size-3.5" />
                    {t("screens.services.prashad.homeDelivery")}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.prashad.devoteeName")}</label>
                    <input
                      type="text"
                      required
                      placeholder="Mohan Sharma"
                      value={shippingForm.name}
                      onChange={e => setShippingForm({ ...shippingForm, name: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.prashad.contactNumber")}</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={shippingForm.phone}
                      onChange={e => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      className="dark:bg-muted dark:border-border/30"
                    />
                  </div>
                </div>

                {deliveryType === "home" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.prashad.deliveryAddress")}</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="House No, Street, Landmark..."
                        value={shippingForm.address}
                        onChange={e => setShippingForm({ ...shippingForm, address: e.target.value })}
                        className="dark:bg-muted dark:border-border/30 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.prashad.postalPinCode")}</label>
                      <input
                        type="text"
                        required
                        placeholder="302015"
                        value={shippingForm.postalCode}
                        onChange={e => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                        className="dark:bg-muted dark:border-border/30"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center rounded-2xl bg-secondary/20 p-4 border border-primary/10 dark:bg-muted/50 dark:border-border/20">
                  <span className="text-xs font-bold text-foreground">{t("screens.services.prashad.totalToPay")}</span>
                  <span className="font-heading font-bold text-lg text-primary">
                    ₹{totalPrice + (deliveryType === "home" ? 50 : 0)} {deliveryType === "home" && <span className="text-[10px] text-muted-foreground font-semibold">(+ ₹50 shipping)</span>}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Heart" className="size-4" />
                  {t("screens.services.prashad.orderPay")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
 