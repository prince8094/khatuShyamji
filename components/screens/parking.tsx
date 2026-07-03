import { useState, useEffect } from "react"
import { Icon, StatusDot, SectionTitle } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { devoteeApi } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

const parkingLots = [
  {
    id: "A",
    name: "Parking Lot A",
    nameHi: "पार्किंग लॉट A",
    location: "Near Main Temple Gate",
    locationHi: "मुख्य मंदिर द्वार के पास",
    capacity: 800,
    available: 0,
    status: "full" as const,
    distance: "50m to gate",
    fee: "Free",
    shuttle: false,
  },
  {
    id: "B",
    name: "Parking Lot B",
    nameHi: "पार्किंग लॉट B",
    location: "Gate 3 – Near Shyam Kund",
    locationHi: "गेट 3 – श्याम कुंड के पास",
    capacity: 1200,
    available: 320,
    status: "available" as const,
    distance: "500m to gate",
    fee: "Free",
    shuttle: true,
  },
  {
    id: "C",
    name: "Parking Lot C",
    nameHi: "पार्किंग लॉट C",
    location: "Ringas Road – Outer Zone",
    locationHi: "रिंगस रोड – बाहरी क्षेत्र",
    capacity: 2000,
    available: 1450,
    status: "available" as const,
    distance: "1.2 km to gate",
    fee: "Free",
    shuttle: true,
  },
  {
    id: "D",
    name: "VIP Parking",
    nameHi: "वीआईपी पार्किंग",
    location: "Temple Trust Complex",
    locationHi: "मंदिर ट्रस्ट परिसर",
    capacity: 150,
    available: 12,
    status: "limited" as const,
    distance: "30m to gate",
    fee: "₹50/day",
    shuttle: false,
  },
]

const rules = [
  { icon: "Clock", en: "Parking open 4:00 AM – 11:00 PM daily", hi: "पार्किंग प्रतिदिन सुबह 4:00 से रात 11:00 तक खुली है" },
  { icon: "Ban", en: "No overnight parking permitted", hi: "रात भर पार्किंग की अनुमति नहीं है" },
  { icon: "BusFront", en: "Free shuttle from Lot B & C every 15 min", hi: "लॉट B और C से हर 15 मिनट में निःशुल्क शटल" },
  { icon: "AlertTriangle", en: "Keep valuables out of vehicles", hi: "वाहनों में कीमती सामान न छोड़ें" },
  { icon: "Phone", en: "Parking Helpline: 01576-230011", hi: "पार्किंग हेल्पलाइन: 01576-230011" },
]

export function ParkingScreen({ navigate }: { navigate: (s: any) => void }) {
  const { t, lang } = useLanguage()
  const [parkingLotsList, setParkingLotsList] = useState<any[]>(parkingLots)

  useEffect(() => {
    const fetchBlocks = () => {
      devoteeApi.getParkingBlocks()
        .then((res: any) => {
          if (Array.isArray(res) && res.length > 0) {
            setParkingLotsList(res.map((item: any) => {
              const cleanCode = item.block_code.replace("PKG-", "")
              const mapped = parkingLots.find(p => p.name.toLowerCase() === item.name.toLowerCase() || p.id === cleanCode)
              return {
                id: cleanCode || mapped?.id || "A",
                name: item.name,
                nameHi: mapped?.nameHi || item.name,
                location: mapped?.location || "Near Temple Gate",
                locationHi: mapped?.locationHi || "मंदिर द्वार के पास",
                capacity: item.total_capacity,
                available: item.total_capacity - item.occupied,
                status: item.status === "full" ? "full" : (item.status === "closed" ? "closed" : ((item.total_capacity - item.occupied) < 20 ? "limited" : "available")),
                distance: mapped?.distance || "500m to gate",
                fee: mapped?.fee || "Free",
                shuttle: item.shuttle_active
              }
            }))
          }
        })
        .catch((err) => console.error("Failed to load parking blocks", err))
    }

    fetchBlocks()

    const channel = supabase
      .channel("public:parking_blocks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parking_blocks" },
        () => {
          console.log("Realtime parking_blocks change detected!")
          fetchBlocks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getStatusColor = (status: "full" | "available" | "limited" | "closed") => {
    if (status === "full") return "text-red-650 bg-red-50 border-red-205"
    if (status === "closed") return "text-gray-600 bg-gray-50 border-gray-200"
    if (status === "limited") return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-green-600 bg-green-50 border-green-200"
  }

  const getStatusLabel = (status: "full" | "available" | "limited" | "closed") => {
    if (status === "full") return { en: "Full", hi: "भरा हुआ" }
    if (status === "closed") return { en: "Closed", hi: "बंद" }
    if (status === "limited") return { en: "Limited", hi: "सीमित" }
    return { en: "Available", hi: "उपलब्ध" }
  }

  const getBarColor = (available: number, capacity: number) => {
    const pct = available / capacity
    if (pct === 0) return "bg-red-500"
    if (pct < 0.2) return "bg-orange-500"
    return "bg-green-500"
  }

  const totalSpots = parkingLotsList.reduce((acc, p) => acc + p.capacity, 0)
  const totalAvailable = parkingLotsList.reduce((acc, p) => acc + p.available, 0)
  const totalOccupied = totalSpots - totalAvailable

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A120B] to-[#0A0A1A] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusDot tone="success" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                {t("screens.parking.liveTracking")}
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold">{t("screens.parking.parkingInformation")}</h1>
            <p className="text-xs text-white/70 mt-1">{t("screens.parking.realTimeLotAvailabilityKhatuDham")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/15 border border-white/15">
            <Icon name="SquareParking" className="size-6 text-[#D4AF37]" />
          </span>
        </div>

        {/* Summary bar */}
        <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 text-center">
          <div>
            <p className="font-heading text-lg font-bold text-white">{totalSpots.toLocaleString()}</p>
            <p className="text-[10px] text-white/70">{t("screens.parking.totalSpots")}</p>
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-green-400">{totalAvailable.toLocaleString()}</p>
            <p className="text-[10px] text-white/70">{t("screens.parking.available")}</p>
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-red-400">{totalOccupied.toLocaleString()}</p>
            <p className="text-[10px] text-white/70">{t("screens.parking.occupied")}</p>
          </div>
        </div>
      </section>

      {/* Parking Lots */}
      <section>
        <SectionTitle title="Parking Lots" hindi="पार्किंग लॉट" />
        <div className="space-y-3">
          {parkingLotsList.map((lot) => (
            <div key={lot.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white font-heading font-bold text-sm shrink-0">
                    {lot.id}
                  </span>
                  <div>
                    <p className="font-heading font-bold text-foreground text-sm">{lang === "hi" ? lot.nameHi : lot.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lang === "hi" ? lot.locationHi : lot.location}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${getStatusColor(lot.status)}`}>
                  {lang === "hi" ? getStatusLabel(lot.status).hi : getStatusLabel(lot.status).en}
                </span>
              </div>

              {/* Availability bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>{t("screens.parking.available")}: {lot.available}</span>
                  <span>{t("screens.parking.total")}: {lot.capacity}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(lot.available, lot.capacity)}`}
                    style={{ width: `${(lot.available / lot.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Navigation" className="size-3" />
                  {lot.distance}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="IndianRupee" className="size-3" />
                  {lot.fee}
                </span>
                {lot.shuttle && (
                  <span className="flex items-center gap-1 text-[#D97706] font-semibold">
                    <Icon name="BusFront" className="size-3" />
                    {t("screens.parking.shuttle")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section className="rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#FFF8F0] to-card p-5 shadow-sm">
        <SectionTitle title="Parking Guidelines" hindi="पार्किंग दिशानिर्देश" />
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#D97706]/10 text-[#D97706]">
                <Icon name={rule.icon} className="size-4" />
              </span>
              <p className="text-sm text-foreground leading-snug">{lang === "hi" ? rule.hi : rule.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shuttle Timing */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="BusFront" className="size-5 text-[#D97706]" />
          <h2 className="font-heading font-bold text-foreground">{t("screens.parking.freeShuttleService")}</h2>
        </div>
        <div className="space-y-2">
          {["Lot B to Gate: 4:00 AM – 10:30 PM, every 15 min", "Lot C to Gate: 5:00 AM – 10:30 PM, every 20 min"].map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2.5">
              <Icon name="Clock" className="size-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-medium text-foreground">{s}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}