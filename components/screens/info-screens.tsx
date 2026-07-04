"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Icon, Pill, SectionTitle, StatusDot } from "@/components/shared"
import { notifications, offlineCenters, type ScreenKey } from "@/lib/data"
import { KhatuPathScreen } from "@/components/screens/khatu-path"
import { LostFoundScreen } from "@/components/screens/lost-found"
import { ParkingScreen } from "@/components/screens/parking"
import { TrafficScreen as TrafficFullScreen } from "@/components/screens/traffic"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { devoteeApi } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

export function InfoScreens({
  screen,
  navigate,
}: {
  screen: ScreenKey
  navigate: (s: ScreenKey) => void
}) {
  const [templeInfo, setTempleInfo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    devoteeApi.getTempleInfo()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setTempleInfo(res)
        }
      })
      .catch((err) => console.error("Error loading temple info", err))
      .finally(() => setLoading(false))
  }, [])

  const telemetryRecord = templeInfo.find((r) => r.section_key === "live_telemetry")
  const telemetry = telemetryRecord ? telemetryRecord.content : null

  const timingsRecord = templeInfo.find((r) => r.section_key === "darshan_timings")
  const timings = timingsRecord ? timingsRecord.content : null

  if (screen === "khatu-path") return <KhatuPathScreen navigate={navigate} />
  if (screen === "lost-found") return <LostFoundScreen navigate={navigate} />
  if (screen === "parking") return <ParkingScreen navigate={navigate} />
  if (screen === "traffic") return <TrafficFullScreen navigate={navigate} />
  if (screen === "crowd") return <CrowdScreen telemetry={telemetry} />
  if (screen === "offline") return <OfflineScreen />
  if (screen === "temple") return <TempleScreen timings={timings} />
  if (screen === "emergency") return <EmergencyScreen />
  if (screen === "notifications") return <NotificationsScreen />
  if (screen === "announcements") return <NotificationsScreen />
  return null
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "success" | "warning" | "orange" }) {
  const color = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-[#FF8C00]"
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function CrowdScreen({ telemetry }: { telemetry?: any }) {
  const { t } = useLanguage()
  const rushLabel = telemetry?.crowd_level || t("info.crowd.rushLevel")
  const countLabel = telemetry ? `~ ${Number(telemetry.crowd_count).toLocaleString()} devotees` : t("info.crowd.devoteesCount")

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#FFE0B2] bg-[#FFF8E7] p-5 text-center shadow-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#FF8C00] text-white shadow">
          <Icon name="Users" className="size-8" />
        </span>
        <p className="mt-3 font-heading text-2xl font-bold text-[#8a4b12]">{rushLabel}</p>
        <p className="text-sm text-[#8a5a22]">{countLabel}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <StatusDot tone="success" /> {t("info.crowd.liveTracking")}
        </span>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <SectionTitle title={t("info.crowd.byZone")} />
        <div className="space-y-4">
          <Bar label={t("info.crowd.zones.sanctum")} value={78} tone="warning" />
          <Bar label={t("info.crowd.zones.queue")} value={64} tone="warning" />
          <Bar label={t("info.crowd.zones.prasad")} value={42} tone="success" />
          <Bar label={t("info.crowd.zones.parking")} value={55} tone="success" />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <SectionTitle title={t("info.crowd.bestTime")} />
        <div className="grid grid-cols-3 gap-3">
          {[
            { tKey: "morning", lKey: "low", tone: "success" as const },
            { tKey: "noon", lKey: "high", tone: "orange" as const },
            { tKey: "evening", lKey: "low", tone: "success" as const },
          ].map((s) => (
            <div key={s.tKey} className="rounded-2xl bg-[#FFF3E0] p-3 text-center">
              <p className="font-heading text-sm font-bold text-foreground">{t("info.crowd.times." + s.tKey)}</p>
              <Pill tone={s.tone}>{t("info.crowd.levels." + s.lKey)}</Pill>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function TrafficScreen() {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#cfe6d6] bg-[#e7f3ea] p-5 text-center shadow-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success text-white shadow">
          <Icon name="TrafficCone" className="size-8" />
        </span>
        <p className="mt-3 font-heading text-2xl font-bold text-[#216a37]">Traffic is Smooth</p>
        <p className="text-sm text-[#2f7a47]">All routes to Khatu Dham are clear</p>
      </section>

      <section>
        <SectionTitle title="Route Status" hindi="मार्ग स्थिति" />
        <div className="space-y-3">
          {[
            { r: "Jaipur → Khatu (NH-148D)", t: "Clear · ~1h 45m", tone: "success" as const, icon: "CarFront" },
            { r: "Sikar → Khatu", t: "Light traffic · ~50m", tone: "success" as const, icon: "CarFront" },
            { r: "Reengus → Khatu", t: "Slow near gate · ~35m", tone: "warning" as const, icon: "TrainFront" },
          ].map((x) => (
            <div key={x.r} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span
                className={`grid size-10 place-items-center rounded-2xl ${
                  x.tone === "success" ? "bg-[#e7f3ea] text-success" : "bg-[#FFF3E0] text-[#FF8C00]"
                }`}
              >
                <Icon name={x.icon} className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-heading text-sm font-bold text-foreground">{x.r}</p>
                <p className="text-xs text-muted-foreground">{x.t}</p>
              </div>
              <StatusDot tone={x.tone} />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {[
          { l: "Parking Lot A", v: "Full", tone: "orange" as const },
          { l: "Parking Lot B", v: "320 left", tone: "success" as const },
        ].map((p) => (
          <div key={p.l} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="SquareParking" className="size-5" />
              <span className="text-xs">{p.l}</span>
            </div>
            <p className="mt-1 font-heading text-lg font-bold text-foreground">{p.v}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

function OfflineScreen() {
  const { t } = useLanguage()
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null)

  const fetchCenters = () => {
    devoteeApi.getBookingCenters()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setCenters(res)
        }
      })
      .catch((err) => {
        console.error("Failed to load booking centers", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCenters()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error)
        }
      )
    }

    const channel = supabase
      .channel("public:offline_booking_centers_devotee")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offline_booking_centers" },
        () => {
          console.log("Realtime offline centers update detected!")
          fetchCenters()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <section className="flex items-center gap-3 rounded-2xl border border-[#FFE0B2] bg-[#FFF8E7] p-4">
        <Icon name="Info" className="size-6 shrink-0 text-[#FF8C00]" />
        <p className="text-sm leading-relaxed text-[#8a5a22]">
          {t("info.offline.infoText", "Offline Darshan passes and registration services can be obtained from the physical booking centers listed below. Carry valid ID proofs.")}
        </p>
      </section>

      <SectionTitle title={t("info.offline.title", "Offline Registration Centers")} />

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-[#FF8C00] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {centers.map((c) => {
            let distanceText = ""
            if (userCoords) {
              const d = getDistance(userCoords.latitude, userCoords.longitude, Number(c.latitude), Number(c.longitude))
              distanceText = `${d.toFixed(1)} km away`
            }

            return (
              <article key={c.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#FFF3E0] text-[#FF8C00]">
                    <Icon name="Building2" className="size-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading text-sm font-bold text-foreground truncate">{c.name}</p>
                      {distanceText && (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF8C00] shrink-0">
                          {distanceText}
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Icon name="MapPin" className="size-3.5 shrink-0" />
                      <span className="truncate">{c.address}, {c.district}, {c.state}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon name="Clock" className="size-3.5 shrink-0" />
                      <span>{c.working_hours}</span>
                    </p>
                    {c.description && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed italic">
                        {c.description}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={c.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] py-2.5 text-sm font-bold text-white shadow-sm active:scale-[0.99] hover:opacity-95 transition"
                >
                  <Icon name="Navigation" className="size-4" />
                  Navigate
                </a>
              </article>
            )
          })}
          {centers.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">No booking centers configured.</p>
          )}
        </div>
      )}
    </div>
  )
}

function TempleScreen({ timings }: { timings?: any[] }) {
  const { t, tObject } = useLanguage()
  const darshanTimings: any[] = timings && timings.length > 0 ? timings : (tObject("info.temple.darshanTimingsList") || [])
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="relative h-44 w-full">
          <Image src="/images/khatu-shyam-temple.png" alt="Khatu Shyam Ji temple" fill className="object-cover" />
        </div>
        <div className="p-4">
          <p className="font-heading text-lg font-bold text-foreground">{t("app.header.title")}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t("info.temple.description")}
          </p>
        </div>
      </section>

      <section>
        <SectionTitle title={t("info.temple.timingTitle")} />
        <div className="space-y-3">
          {darshanTimings.map((x) => (
            <div key={x.name} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF3E0] text-[#FF8C00]">
                  <Icon name="Flame" className="size-5" />
                </span>
                <span className="font-heading text-sm font-bold text-foreground">{x.name}</span>
              </span>
              <span className="text-sm text-muted-foreground">{x.time}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#FFE0B2] bg-[#FFF8E7] p-4">
        <p className="flex items-center gap-2 font-heading font-bold text-[#8a4b12]">
          <Icon name="Calendar" className="size-5 text-[#FF8C00]" />
          {t("info.temple.festivalsTitle")}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#8a5a22]">
          {t("info.temple.festivalsText")}
        </p>
      </section>
    </div>
  )
}

function EmergencyScreen() {
  const { t, tObject } = useLanguage()
  const contacts: any[] = tObject("info.emergency.contactsList") || []
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#FFE0B2] bg-[#FFF8E7] p-5 text-center shadow-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FFA726] text-white shadow">
          <Icon name="Siren" className="size-8" />
        </span>
        <p className="mt-3 font-heading text-xl font-bold text-[#FF8C00]">{t("info.emergency.helpline")}</p>
        <p className="text-sm text-[#8a5a22]">{t("info.emergency.tapToCall")}</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {contacts.map((c) => (
          <a
            key={c.label}
            href={`tel:${c.phone}`}
            className="rounded-3xl border border-border bg-card p-4 shadow-sm transition active:scale-[0.98]"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] text-white">
              <Icon name={c.icon} className="size-5" />
            </span>
            <p className="mt-2.5 text-xs text-muted-foreground">{c.label}</p>
            <p className="font-heading text-base font-bold text-foreground">{c.phone}</p>
          </a>
        ))}
      </div>

      <section className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Icon name="MapPin" className="mt-0.5 size-5 shrink-0 text-[#FF8C00]" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("info.emergency.firstAidInfo")}
        </p>
      </section>
    </div>
  )
}

function NotificationsScreen() {
  const { t, tObject, lang } = useLanguage()
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = () => {
      devoteeApi.getNotifications()
        .then((res) => {
          if (Array.isArray(res)) {
            setList(res)
          }
        })
        .catch((err) => console.error("Error loading notifications", err))
        .finally(() => setLoading(false))
    }

    fetchNotifications()

    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          console.log("Realtime notifications change detected!")
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleMarkAsRead = async (id: string) => {
    setList(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    try {
      await devoteeApi.markNotificationRead({ notification_id: id })
    } catch (err) {
      console.error("Failed to mark notification read", err)
    }
  }

  const displayList = list

  return (
    <div className="space-y-3">
      {loading && (
        <div className="text-center py-8 text-xs font-bold text-muted-foreground flex flex-col items-center gap-2">
          <Icon name="Loader" className="size-5 animate-spin text-[#D4AF37]" />
          Loading notifications...
        </div>
      )}

      {!loading && displayList.length === 0 && (
        <div className="text-center py-8 text-xs font-bold text-muted-foreground">
          No notifications available.
        </div>
      )}

      {displayList.map((n: any, i: number) => {
        const title = lang === "hi" ? (n.title_hi || n.title) : (n.title_en || n.title)
        const body = lang === "hi" ? (n.body_hi || n.body) : (n.body_en || n.body)
        const tone = n.tone || "success"
        const icon = n.icon || "Bell"
        const time = n.created_at 
          ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : (n.time || "Just now")

        const toneColors: Record<string, string> = {
          success: "bg-green-50 text-green-700 border-green-200",
          info: "bg-blue-50 text-blue-700 border-blue-200",
          warning: "bg-amber-50 text-amber-700 border-amber-200",
          danger: "bg-red-50 text-red-700 border-red-200"
        }

        return (
          <article
            key={n.id || i}
            onClick={() => n.id && !n.is_read && handleMarkAsRead(n.id)}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-200 cursor-pointer ${
              n.is_read === false ? "bg-amber-50/20 border-amber-200/50" : "bg-card border-border"
            }`}
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-2xl border ${
                toneColors[tone] || toneColors.success
              }`}
            >
              <Icon name={icon} className="size-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                  {title}
                  {n.is_read === false && (
                    <span className="size-1.5 rounded-full bg-blue-500 shrink-0" title="Unread" />
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{time}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
