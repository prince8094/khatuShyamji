"use client"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const lots = [
  { name: "Lot A - Main Gate", total: 80, available: 12, dist: "50m", icon: "CarFront" },
  { name: "Lot B - North Side", total: 120, available: 45, dist: "200m", icon: "CarFront" },
  { name: "Lot C - Bus Stand", total: 60, available: 8, dist: "400m", icon: "Bus" },
  { name: "Lot D - VIP", total: 30, available: 4, dist: "0m", icon: "Star" },
]

export function ParkingInfoScreen({ navigate }: { navigate?: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Khatu Dham</p>
        <h1 className="font-heading text-2xl font-bold text-foreground mt-1">{t("screens.services.parkingInfo.parkingInfo")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t("screens.services.parkingInfo.liveSlotAvailabilityNearTheTemple")}</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lots.map((lot) => {
          const pct = Math.round((lot.available / lot.total) * 100)
          const status = pct > 40 ? "Available" : pct > 15 ? "Filling Fast" : "Almost Full"
          const statusColor = pct > 40 ? "text-green-600" : pct > 15 ? "text-amber-600" : "text-red-600"
          const barColor = pct > 40 ? "bg-green-500" : pct > 15 ? "bg-amber-500" : "bg-red-500"
          return (
            <div key={lot.name} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={lot.icon} className="size-5" />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">{lot.name}</p>
                  <p className="text-xs text-muted-foreground">{lot.dist} from temple gate</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className={statusColor}>{status}</span>
                  <span className="text-muted-foreground">{lot.available}/{lot.total} free</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className={"h-2 rounded-full transition-all " + barColor} style={{ width: pct + "%" }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-primary/5 border border-primary/20 p-4">
        <Icon name="Info" className="size-5 shrink-0 text-primary mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          {t("screens.services.parkingInfo.slotDataRefreshesEvery5MinutesFollowTemple")}
        </p>
      </div>
    </div>
  )
}