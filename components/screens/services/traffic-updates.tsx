"use client"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const routes = [
  { road: "NH-148 (Jaipur - Fatehpur)", status: "Smooth", detail: "No congestion reported", icon: "Navigation", color: "text-green-600", bg: "bg-green-50 border-green-100" },
  { road: "NH-52 (Bikaner Road)", status: "Heavy Traffic", detail: "2-3 km jam near Sikar bypass", icon: "AlertTriangle", color: "text-red-600", bg: "bg-red-50 border-red-100" },
  { road: "SH-2 (Ringas to Khatu)", status: "Moderate", detail: "Slow moving near Rewa gate", icon: "Minus", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  { road: "Temple Inner Road", status: "Controlled", detail: "One-way flow enforced by police", icon: "ShieldCheck", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  { road: "Bus Stand Road", status: "Smooth", detail: "Parking available at Lot B", icon: "Navigation", color: "text-green-600", bg: "bg-green-50 border-green-100" },
]

export function TrafficUpdatesScreen({ navigate }: { navigate?: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Khatu Dham</p>
        <h1 className="font-heading text-2xl font-bold text-foreground mt-1">{t("screens.services.trafficUpdates.trafficUpdates")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t("screens.services.trafficUpdates.liveHighwayRoadStatusNearTheTemple")}</p>
      </header>
      <div className="flex items-center gap-2 rounded-2xl bg-secondary/50 border border-border px-4 py-2.5 text-xs text-muted-foreground">
        <Icon name="RefreshCw" className="size-3.5" />
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
      <div className="space-y-3">
        {routes.map((r) => (
          <div key={r.road} className={"flex items-start gap-4 rounded-2xl border p-4 " + r.bg}>
            <span className={"grid size-10 shrink-0 place-items-center rounded-xl bg-white/80 shadow-inner " + r.color}>
              <Icon name={r.icon} className="size-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-heading text-sm font-bold text-foreground">{r.road}</p>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold border bg-white/70 " + r.color}>{r.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}