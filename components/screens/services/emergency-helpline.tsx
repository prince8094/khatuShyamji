"use client"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const helplines = [
  { name: "Medical Emergency", number: "108", icon: "HeartPulse", color: "text-red-500", bg: "bg-red-50 border-red-100" },
  { name: "Police Helpline", number: "100", icon: "Shield", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  { name: "Fire Station", number: "101", icon: "Flame", color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
  { name: "Temple Security", number: "9887654321", icon: "ShieldCheck", color: "text-green-600", bg: "bg-green-50 border-green-100" },
  { name: "Lost & Found Desk", number: "01572-280555", icon: "PackageSearch", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  { name: "District Ambulance", number: "112", icon: "Truck", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
]

export function EmergencyHelplineScreen({ navigate }: { navigate?: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Khatu Dham</p>
        <h1 className="font-heading text-2xl font-bold text-foreground mt-1">{t("screens.services.emergencyHelpline.emergencyHelpline")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t("screens.services.emergencyHelpline.247MedicalPoliceAssistance")}</p>
      </header>
      <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
        <Icon name="AlertTriangle" className="size-5 shrink-0 text-red-600 mt-0.5" />
        <p className="text-xs text-red-800 font-semibold leading-relaxed">
          {t("screens.services.emergencyHelpline.inALifeThreateningEmergencyCall112Immediate")}
        </p>
      </div>
      <div className="space-y-3">
        {helplines.map((h) => (
          <a key={h.number} href={"tel:" + h.number} className={"flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-md active:scale-[0.98] " + h.bg}>
            <span className={"grid size-11 shrink-0 place-items-center rounded-xl bg-white/80 shadow-inner " + h.color}>
              <Icon name={h.icon} className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-heading text-sm font-bold text-foreground">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.number}</p>
            </div>
            <Icon name="Phone" className={"size-5 shrink-0 " + h.color} />
          </a>
        ))}
      </div>
    </div>
  )
}