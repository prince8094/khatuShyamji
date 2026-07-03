"use client"

import { useState, useEffect } from "react"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { devoteeApi } from "@/lib/api-client"

export function OfferingsScreen({ navigate }: { navigate?: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  const [cart, setCart] = useState<number[]>([])
  const [ordered, setOrdered] = useState(false)
  const [itemsList, setItemsList] = useState<any[]>([])

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const data = await devoteeApi.getOfferingItems()

        if (data && data.length > 0) {
          setItemsList(data.map((item: any) => ({
            id: Number(item.id),
            dbId: item.id,
            name: item.name,
            desc: item.description || "Puja bhog items",
            price: item.price,
            icon: item.icon || "LayoutGrid"
          })))
        }
      } catch (err) {
        console.error("Failed to load offering items", err)
      }
    }

    fetchOfferings()
  }, [])

  const total = cart.reduce((sum, id) => sum + (itemsList.find((i) => i.id === id)?.price ?? 0), 0)

  function toggle(id: number) {
    setCart((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const placeOrder = async () => {
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

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        const orderItems = cart.map(itemId => ({
          offering_id: itemId,
          quantity: 1
        }))

        if (orderItems.length > 0) {
          await devoteeApi.orderOfferings({
            total_amount: total,
            items: orderItems
          })
        }
      }

      setCart([])
      setOrdered(true)
      setTimeout(() => setOrdered(false), 3000)
    } catch (err) {
      console.error("Failed to place offerings order", err)
      alert("Failed to place order. Please try again.")
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Khatu Dham</p>
        <h1 className="font-heading text-2xl font-bold text-foreground mt-1">{t("screens.services.offerings.offerings")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t("screens.services.offerings.selectItemsToOfferAtTheTempleCounter")}</p>
      </header>
      {ordered && (
        <div className="flex items-center gap-3 rounded-2xl bg-green-500/10 border border-green-500/30 p-4">
          <Icon name="CheckCircle" className="size-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-700">{t("screens.services.offerings.orderPlacedCollectFromCounter2")}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {itemsList.map((item) => {
          const inCart = cart.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={"rounded-2xl border p-4 text-left transition-all duration-200 " + (inCart ? "border-primary bg-primary/10 shadow-md" : "border-border bg-card hover:border-primary/40 hover:shadow-sm")}
            >
              <div className="flex items-center gap-3">
                <span className={"grid size-10 shrink-0 place-items-center rounded-xl " + (inCart ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                  <Icon name={item.icon} className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-heading text-sm font-bold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <p className="font-bold text-primary text-sm">Rs.{item.price}</p>
              </div>
            </button>
          )
        })}
      </div>
      {cart.length > 0 && (
        <div className="rounded-3xl border border-primary/20 bg-card p-5 shadow-sm space-y-3">
          <div className="flex justify-between text-sm font-bold text-foreground">
            <span>{cart.length} item{cart.length > 1 ? "s" : ""} selected</span>
            <span className="text-primary">Total: Rs.{total}</span>
          </div>
          <button
            onClick={placeOrder}
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-[#D4AF37] py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
          >
            {t("screens.services.offerings.placeOrder")}
          </button>
        </div>
      )}
    </div>
  )
}