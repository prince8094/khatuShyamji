"use client"

import { useEffect, useState } from "react"
import { Icon, StatusDot, SectionTitle } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { devoteeApi } from "@/lib/api-client"
import TrafficMap from "@/components/shared/TrafficMap"

const routes = [
  {
    name: "Jaipur – Khatu via NH-148D",
    nameHi: "जयपुर – खाटू (NH-148D)",
    distance: "80 km",
    status: "smooth" as const,
    eta: "~1h 45m",
    note: "Clear road, usual flow",
    noteHi: "सामान्य ट्रैफिक, सड़क साफ़",
    icon: "CarFront",
  },
  {
    name: "Sikar – Khatu (30 km)",
    nameHi: "सीकर – खाटू (30 km)",
    distance: "30 km",
    status: "moderate" as const,
    eta: "~50m",
    note: "Moderate congestion near Ringas",
    noteHi: "रिंगस के पास मध्यम भीड़",
    icon: "TrafficCone",
  },
  {
    name: "Ringas Junction – Khatu",
    nameHi: "रिंगस जंक्शन – खाटू",
    distance: "17 km",
    status: "heavy" as const,
    eta: "~45m",
    note: "Heavy traffic · Use Detour B",
    noteHi: "भारी ट्रैफिक · डिटूर B का उपयोग करें",
    icon: "AlertTriangle",
  },
  {
    name: "Delhi – Khatu via NH-48",
    nameHi: "दिल्ली – खाटू (NH-48)",
    distance: "~340 km",
    status: "smooth" as const,
    eta: "~5h 30m",
    note: "Highway clear, good conditions",
    noteHi: "हाईवे साफ़, अच्छी स्थिति",
    icon: "CarFront",
  },
]

const checkpoints = [
  { name: "Ringas Chowk", nameHi: "रिंगस चौक", status: "heavy" as const, detail: "Police naka · 20 min wait" },
  { name: "Khatu Bypass", nameHi: "खाटू बाइपास", status: "moderate" as const, detail: "Use for direct temple approach" },
  { name: "Main Temple Gate", nameHi: "मुख्य मंदिर द्वार", status: "smooth" as const, detail: "Gate open · No waiting" },
  { name: "Shyam Kund Road", nameHi: "श्याम कुंड रोड", status: "moderate" as const, detail: "One-way · Follow signage" },
]

const tips = [
  { icon: "Clock", en: "Best time to travel: 4–7 AM or after 8 PM to avoid peak traffic", hi: "यात्रा का सर्वोत्तम समय: सुबह 4-7 बजे या रात 8 बजे के बाद" },
  { icon: "Navigation", en: "Follow police signage near Ringas Junction for alternate routes", hi: "रिंगस जंक्शन के पास वैकल्पिक मार्गों के लिए पुलिस संकेत का पालन करें" },
  { icon: "BusFront", en: "Shyam Buses run directly to temple gate from Jaipur & Sikar", hi: "जयपुर और सीकर से श्याम बस सीधे मंदिर द्वार तक जाती है" },
  { icon: "Phone", en: "Traffic Helpline: 01576-230199 (24/7)", hi: "ट्रैफिक हेल्पलाइन: 01576-230199 (24/7)" },
]

const statusConfig = {
  smooth: { label: { en: "Smooth", hi: "साफ़" }, dot: "success" as const, bg: "bg-green-50 border-green-200", text: "text-green-700" },
  moderate: { label: { en: "Moderate", hi: "मध्यम" }, dot: "warning" as const, bg: "bg-orange-50 border-orange-200", text: "text-orange-700" },
  heavy: { label: { en: "Heavy", hi: "भारी" }, dot: "orange" as const, bg: "bg-red-50 border-red-200", text: "text-red-700" },
}

export function TrafficScreen({ navigate }: { navigate: (s: any) => void }) {
  const { t } = useLanguage()
  const [showTempleRoute, setShowTempleRoute] = useState(true)
  const [showParkingRoute, setShowParkingRoute] = useState(true)
  const [showAlternativeRoute, setShowAlternativeRoute] = useState(true)
  const [showTrafficLayer, setShowTrafficLayer] = useState(true)
  const [routesList, setRoutesList] = useState<any[]>(routes)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    devoteeApi.getTraffic()
      .then((res) => {
        if (res.alerts) setAlerts(res.alerts)
        if (res.routes && res.routes.length > 0) {
          setRoutesList(res.routes.map((r: any) => {
            const mapped = routes.find(mr => mr.name.toLowerCase() === r.name.toLowerCase())
            return {
              name: r.name,
              nameHi: mapped?.nameHi || r.name,
              distance: mapped?.distance || "30 km",
              status: r.status === "heavy" ? "heavy" : (r.status === "moderate" ? "moderate" : "smooth"),
              eta: r.eta,
              note: mapped?.note || "Usual traffic conditions",
              noteHi: mapped?.noteHi || "सामान्य ट्रैफिक",
              icon: r.status === "heavy" ? "AlertTriangle" : (r.status === "moderate" ? "TrafficCone" : "CarFront")
            }
          }))
        }
      })
      .catch((err) => console.error("Failed to load traffic alerts", err))
  }, [])

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A120B] to-[#2d1505] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusDot tone="warning" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                {t("screens.traffic.liveTraffic")}
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold">{t("screens.traffic.trafficUpdates")}</h1>
            <p className="text-xs text-white/70 mt-1">{t("screens.traffic.liveHighwayRoadConditionsKhatuDham")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/15 border border-white/15">
            <Icon name="TrafficCone" className="size-6 text-[#D4AF37]" />
          </span>
        </div>

        {/* Overall status */}
        <div className="relative mt-4 rounded-2xl bg-white/10 p-3">
          <div className="flex items-center gap-3">
            <StatusDot tone="warning" />
            <div>
              <p className="font-heading font-bold text-white">{t("screens.traffic.moderateCongestionOnRingasRoute")}</p>
              <p className="text-[11px] text-white/70">{t("screens.traffic.updated5MinutesAgoUseAlternateRouteRecomme")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Traffic Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-foreground">Interactive Route Traffic Map</h3>
          <button
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`rounded-xl px-3 py-1 text-[10px] font-bold border transition ${
              showTrafficLayer 
                ? "bg-red-50 text-red-700 border-red-200" 
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            ⛔ Live Traffic: {showTrafficLayer ? "ON" : "OFF"}
          </button>
        </div>

        <TrafficMap
          showTempleRoute={showTempleRoute}
          showParkingRoute={showParkingRoute}
          showAlternativeRoute={showAlternativeRoute}
          showTrafficLayer={showTrafficLayer}
          alerts={alerts.map((a: any) => ({
            id: a.id,
            alert_code: a.alert_code,
            latitude: a.latitude,
            longitude: a.longitude,
            alert_type: a.alert_type,
            message: a.message,
            severity: a.severity
          }))}
        />

        {/* Toggle Route Indicators */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowTempleRoute(!showTempleRoute)}
            className={`rounded-2xl border p-2.5 text-center text-xs font-bold transition flex flex-col items-center gap-1.5 ${
              showTempleRoute 
                ? "bg-amber-50 border-amber-300 text-amber-850" 
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            <span className="size-3 rounded-full bg-[#F59E0B]" />
            Temple Route
          </button>

          <button
            onClick={() => setShowParkingRoute(!showParkingRoute)}
            className={`rounded-2xl border p-2.5 text-center text-xs font-bold transition flex flex-col items-center gap-1.5 ${
              showParkingRoute 
                ? "bg-amber-50 border-amber-300 text-amber-850" 
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            <span className="size-3 rounded-full bg-[#D97706]" />
            Parking Route
          </button>

          <button
            onClick={() => setShowAlternativeRoute(!showAlternativeRoute)}
            className={`rounded-2xl border p-2.5 text-center text-xs font-bold transition flex flex-col items-center gap-1.5 ${
              showAlternativeRoute 
                ? "bg-amber-50 border-amber-300 text-amber-850" 
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            <span className="size-3 rounded-full bg-[#10B981]" />
            Bypass Route
          </button>
        </div>
      </section>

      {/* Route Status */}
      <section>
        <SectionTitle title="Major Routes" hindi="प्रमुख मार्ग" />
        <div className="space-y-3">
          {routesList.map((route) => {
            const cfg = (statusConfig as any)[route.status] || statusConfig.smooth
            return (
              <div key={route.name} className={`rounded-2xl border p-4 shadow-sm ${cfg.bg}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <span className={`grid size-9 place-items-center rounded-xl border bg-white shrink-0`}>
                      <Icon name={route.icon} className={`size-4 ${cfg.text}`} />
                    </span>
                    <div>
                      <p className={`font-heading font-bold text-sm ${cfg.text}`}>{t(route.name, route.nameHi)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(route.note, route.noteHi)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.bg} ${cfg.text}`}>
                      <StatusDot tone={cfg.dot} />
                      {t(cfg.label.en, cfg.label.hi)}
                    </span>
                    <p className={`text-xs font-bold mt-1 ${cfg.text}`}>{route.eta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Icon name="Navigation" className="size-3" />
                  {route.distance}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Checkpoints */}
      <section>
        <SectionTitle title="Key Checkpoints" hindi="प्रमुख चेकपॉइंट" />
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          {checkpoints.map((cp, i) => {
            const cfg = statusConfig[cp.status]
            return (
              <div key={cp.name} className={`flex items-center gap-3 px-4 py-3.5 ${i < checkpoints.length - 1 ? "border-b border-border" : ""}`}>
                <StatusDot tone={cfg.dot} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{t(cp.name, cp.nameHi)}</p>
                  <p className="text-xs text-muted-foreground">{cp.detail}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.bg} ${cfg.text}`}>
                  {t(cfg.label.en, cfg.label.hi)}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Travel Tips */}
      <section className="rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#FFF8F0] to-card p-5 shadow-sm">
        <SectionTitle title="Travel Tips" hindi="यात्रा सुझाव" />
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#D97706]/10 text-[#D97706]">
                <Icon name={tip.icon} className="size-4" />
              </span>
              <p className="text-sm text-foreground leading-snug">{t(tip.en, tip.hi)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}