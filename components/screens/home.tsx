"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Icon, Ornament, SectionTitle, StatusDot } from "@/components/shared"
import { aartiTimings, liveStatus, services, user, type ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { AnnouncementBanner } from "@/components/features/announcement-banner"
import { devoteeApi } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

const quickActions: { key: ScreenKey; icon: string }[] = [
  { key: "bookings", icon: "Ticket" },
  { key: "qr", icon: "QrCode" },
  { key: "reach", icon: "MapPin" },
  { key: "temple", icon: "Landmark" },
]

export function HomeScreen({ navigate, currentUser }: { navigate: (s: ScreenKey) => void; currentUser?: any }) {
  const activeUser = currentUser || user
  const { lang, t } = useLanguage()

  const [telemetry, setTelemetry] = useState<any>({
    crowd_level: "Moderate",
    crowd_count: 6420,
    wait_time_minutes: 35,
    darshan_status: "Open",
    is_emergency_mode: false,
    is_darshan_closed: false,
    is_global_alarm: false,
  })
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [parkingStats, setParkingStats] = useState<{ value: string; tone: "success" | "danger" | "orange"; hint: string }>({ value: "Available", tone: "success", hint: "Shuttles active" })
  const [trafficStats, setTrafficStats] = useState<{ value: string; tone: "success" | "danger" | "orange"; hint: string }>({ value: "Smooth", tone: "success", hint: "All routes clear" })

  useEffect(() => {
    devoteeApi.getTempleInfo()
      .then((res: any) => {
        if (Array.isArray(res)) {
          const telemetryRecord = res.find((r: any) => r.section_key === "live_telemetry")
          if (telemetryRecord && telemetryRecord.content) {
            setTelemetry(telemetryRecord.content)
          }
        }
      })
      .catch((err) => console.error("Error loading telemetry", err))

    devoteeApi.getAnnouncements()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setAnnouncements(res.map((a: any) => {
            const trans = a.announcement_translations?.find((t: any) => t.language_code === "en") || a.announcement_translations?.[0]
            return {
              id: a.id,
              text: trans ? trans.description : a.body_en || a.title_en || ""
            }
          }))
        }
      })
      .catch((err) => console.error("Error loading announcements", err))

    const fetchParkingStats = () => {
      devoteeApi.getParkingBlocks()
        .then((res: any) => {
          if (Array.isArray(res) && res.length > 0) {
            const total = res.reduce((a, b) => a + Number(b.total_capacity || 0), 0)
            const occupied = res.reduce((a, b) => a + Number(b.occupied || 0), 0)
            const pct = total > 0 ? (occupied / total) : 0
            const isFull = pct >= 0.95
            setParkingStats({
              value: isFull ? "Full" : "Available",
              tone: isFull ? ("danger" as const) : ("success" as const),
              hint: `${occupied}/${total} occupied`
            })
          }
        })
        .catch((err) => console.error("Error loading home parking stats", err))
    }

    fetchParkingStats()

    devoteeApi.getTraffic()
      .then((res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          const congested = res.filter(r => r.status === "congested" || r.status === "blocked")
          const hasAlerts = congested.length > 0
          setTrafficStats({
            value: hasAlerts ? "Slow" : "Smooth",
            tone: hasAlerts ? ("orange" as const) : ("success" as const),
            hint: hasAlerts ? `${congested.length} heavy zones` : "All routes clear"
          })
        }
      })
      .catch((err) => console.error("Error loading home traffic stats", err))

    const channel = supabase
      .channel("public:home:parking_blocks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parking_blocks" },
        () => {
          console.log("Realtime home parking_blocks update detected!")
          fetchParkingStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const statusList = [
    {
      key: "crowd",
      icon: "Users",
      tone: telemetry.crowd_level?.toLowerCase() === "high" ? "orange" as const : (telemetry.crowd_level?.toLowerCase() === "critical" ? "danger" as const : "success" as const),
      value: telemetry.crowd_level || "Moderate",
      hint: `~ ${Number(telemetry.crowd_count || 6420).toLocaleString()} devotees`
    },
    {
      key: "traffic",
      icon: "TrafficCone",
      tone: trafficStats.tone,
      value: trafficStats.value,
      hint: trafficStats.hint
    },
    {
      key: "parking",
      icon: "SquareParking",
      tone: parkingStats.tone,
      value: parkingStats.value,
      hint: parkingStats.hint
    },
    {
      key: "darshan",
      icon: "DoorOpen",
      tone: telemetry.is_darshan_closed ? "danger" as const : "success" as const,
      value: telemetry.is_darshan_closed ? "CLOSED" : (telemetry.darshan_status || "Open"),
      hint: telemetry.is_darshan_closed ? "Gates Offline" : `Wait: ${telemetry.wait_time_minutes || 35} mins`
    },
  ]

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="relative h-52 w-full">
          <Image
            src="/images/khatu-shyam-hero.jpg"
            alt="Shri Khatu Shyam Ji"
            fill
            priority
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <StatusDot tone="success" />
              {t("home.hero.darshanOpen")}
            </span>
          </div>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFD54F]">
              {t("home.hero.tagline")}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold leading-tight text-balance">
              {t("home.hero.title")}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          {activeUser.photo ? (
            <img
              src={activeUser.photo}
              alt={activeUser.name}
              className="size-11 shrink-0 rounded-full object-cover border border-[#FFB74D] shadow-sm"
            />
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FFF3E0] font-heading text-lg font-bold text-[#FF8C00]">
              {activeUser.initials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground font-medium">{t("home.hero.welcomeBack")}</p>
            <p className="truncate font-heading font-semibold text-foreground">{activeUser.name} ji</p>
          </div>
          <button
            onClick={() => navigate("profile")}
            className="rounded-full border border-[#FFB74D] px-3 py-1.5 text-xs font-semibold text-[#FF8C00] transition hover:bg-[#FFF3E0]"
          >
            {t("home.hero.profileBtn")}
          </button>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 ? <AnnouncementBanner announcements={announcements} /> : <AnnouncementBanner />}

      {/* Primary CTA */}
      <button
        onClick={() => navigate("book")}
        className="relative flex w-full items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] px-5 py-5 text-left text-white shadow-lg shadow-[#FF8C00]/25 transition active:scale-[0.99]"
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "200px" }}
        />
        <span className="relative flex items-center gap-3.5">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/25 text-white shadow-inner">
            <Icon name="CalendarCheck" className="size-6" />
          </span>
          <span>
            <span className="block font-heading text-lg font-bold">{t("home.primaryCta.title")}</span>
            <span className="block font-heading text-sm text-white/80">{t("home.primaryCta.subtitle")}</span>
          </span>
        </span>
        <span className="relative grid size-9 place-items-center rounded-full bg-white/15">
          <Icon name="ChevronRight" className="size-5 text-white" />
        </span>
      </button>

      {/* Live status */}
      <section>
        <SectionTitle
          title={t("home.liveStatus.title")}
          action={
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
              <StatusDot tone="success" />
              {t("home.liveStatus.liveNow")}
            </span>
          }
        />
        <div className="grid grid-cols-2 gap-3">
          {statusList.map((s) => (
            <div key={s.key} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid size-9 place-items-center rounded-xl ${
                    s.tone === "success" ? "bg-[#e7f3ea] text-success" : s.tone === "danger" ? "bg-red-50 text-red-650" : "bg-[#FFF3E0] text-[#FF8C00]"
                  }`}
                >
                  <Icon name={s.icon} className="size-5" />
                </span>
                <p className="text-xs font-medium text-muted-foreground">{t(`home.liveStatus.${s.key}.label`)}</p>
              </div>
              <p className="mt-3 font-heading text-lg font-bold leading-none text-foreground">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <SectionTitle title={t("home.quickActions.title")} />
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((q) => (
            <button
              key={q.key}
              onClick={() => navigate(q.key)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition active:scale-95 hover:border-[#FFB74D]"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-[#FFF3E0] text-[#FF8C00]">
                <Icon name={q.icon} className="size-5" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-foreground">{t("home.quickActions." + q.key)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Aarti timings */}
      <section className="rounded-3xl border border-gold/30 bg-gradient-to-b from-[#FFF8E7] to-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Flame" className="size-5 text-[#FF8C00]" />
            <h2 className="font-heading text-base font-bold text-foreground">{t("home.aarti.title")}</h2>
          </div>
          <button onClick={() => navigate("aarti-timings")} className="text-xs font-semibold text-[#FF8C00]">
            {t("home.popular.viewAll", "View All")}
          </button>
        </div>
        <Ornament className="my-3" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {aartiTimings.map((a) => (
            <div key={a.name} className="flex items-center justify-between border-b border-dashed border-gold/30 pb-2">
              <div>
                <p className="text-[13px] font-semibold leading-tight text-foreground">
                  {lang === "en" ? a.name : a.hindi}
                </p>
              </div>
              <span className="font-heading text-sm font-bold text-[#FF8C00]">{a.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular services */}
      <section>
        <SectionTitle
          title={t("home.popular.title")}
          action={
            <button onClick={() => navigate("services")} className="text-sm font-semibold text-[#FF8C00]">
              {t("home.popular.viewAll")}
            </button>
          }
        />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {services.slice(0, 6).map((s) => (
            <button
              key={s.key}
              onClick={() => navigate("services")}
              className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition active:scale-95"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#FF8C00] to-[#FFA726] text-white shadow">
                <Icon name={s.icon} className="size-6" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-foreground">
                {lang === "en" ? s.label : s.hindi}
              </span>
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}
