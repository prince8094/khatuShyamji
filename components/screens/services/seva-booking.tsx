"use client"

import { useState } from "react"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const sevaList = [
  { id: 1, name: "Mangala Aarti Seva", nameHi: "Mangala Aarti Seva", time: "4:30 AM", price: 1100, desc: "Attend the first aarti of the day at dawn", slots: 12 },
  { id: 2, name: "Shringar Seva", nameHi: "Shringar Seva", time: "7:00 AM", price: 2100, desc: "Offer flowers and garlands to the deity", slots: 6 },
  { id: 3, name: "Bhog Seva", nameHi: "Bhog Seva", time: "12:00 PM", price: 3100, desc: "Offer a complete thali of food as bhog", slots: 8 },
  { id: 4, name: "Sandhya Aarti Seva", nameHi: "Sandhya Aarti Seva", time: "6:00 PM", price: 1500, desc: "Evening aarti with lamps and incense", slots: 15 },
  { id: 5, name: "Shayan Aarti Seva", nameHi: "Shayan Aarti Seva", time: "9:00 PM", price: 2500, desc: "Final aarti of the day before the deity rests", slots: 4 },
  { id: 6, name: "Abhishek Seva", nameHi: "Abhishek Seva", time: "5:30 AM", price: 5100, desc: "Sacred bathing of the deity with panchamrit", slots: 3 },
]

export function SevaBookingScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<number | null>(null)
  const [booked, setBooked] = useState<number[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const selectedSeva = sevaList.find((s) => s.id === selected)

  function handleBook() {
    if (selected === null) return
    setBooked((prev) => [...prev, selected])
    setSelected(null)
    setShowConfirm(true)
    setTimeout(() => setShowConfirm(false), 3000)
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Khatu Dham</p>
        <h1 className="font-heading text-2xl font-bold text-foreground mt-1">
          {t("screens.services.sevaBooking.sevaBooking")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t("screens.services.sevaBooking.bookSpecialSevaPujaAtTheTemple")}
        </p>
      </header>

      {showConfirm && (
        <div className="flex items-center gap-3 rounded-2xl bg-green-500/10 border border-green-500/30 p-4">
          <Icon name="CheckCircle" className="size-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-700">
            {t("screens.services.sevaBooking.sevaBookedSuccessfully")}
          </p>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl bg-primary/5 border border-primary/20 p-4">
        <Icon name="Info" className="size-5 shrink-0 text-primary mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          {t("screens.services.sevaBooking.selectASevaBelowAndTapBookSevaToConfirmL")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sevaList.map((seva) => {
          const isSelected = selected === seva.id
          const isBooked = booked.includes(seva.id)
          return (
            <button
              key={seva.id}
              disabled={isBooked}
              onClick={() => setSelected(isSelected ? null : seva.id)}
              className={"group rounded-2xl border p-4 text-left transition-all duration-200 " + (isBooked ? "opacity-50 cursor-not-allowed border-border bg-secondary/20" : isSelected ? "border-primary bg-primary/10 shadow-md" : "border-border bg-card hover:border-primary/40 hover:shadow-sm")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="Star" className="size-4" />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{t(seva.name, seva.nameHi)}</p>
                    <p className="text-xs text-muted-foreground">{seva.time}</p>
                  </div>
                </div>
                {isBooked ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Booked</span>
                ) : (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{seva.slots} slots</span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{seva.desc}</p>
              <p className="mt-2 font-heading text-base font-bold text-primary">Rs. {seva.price.toLocaleString()}</p>
            </button>
          )
        })}
      </div>

      {selectedSeva && (
        <div className="rounded-3xl border border-primary/20 bg-card p-5 shadow-sm space-y-4">
          <p className="font-heading text-sm font-bold text-foreground">Selected Seva</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t(selectedSeva.name, selectedSeva.nameHi)}</span>
            <span className="font-bold text-primary">Rs. {selectedSeva.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Time: {selectedSeva.time}</span>
            <span>{selectedSeva.slots} slots left</span>
          </div>
          <button
            onClick={handleBook}
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-[#D4AF37] py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
          >
            {t("screens.services.sevaBooking.bookSeva")}
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
        <Icon name="Flame" className="size-5 shrink-0 text-amber-600 mt-0.5" />
        <p className="text-xs leading-relaxed text-amber-900 font-medium">
          {t("screens.services.sevaBooking.sevaBookingsAreConfirmedByTheTempleCommitte")}
        </p>
      </div>
    </div>
  )
}