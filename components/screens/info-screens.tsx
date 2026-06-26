"use client"

import Image from "next/image"
import { Icon, Pill, SectionTitle, StatusDot } from "@/components/shared"
import { notifications, offlineCenters, type ScreenKey } from "@/lib/data"
import { KhatuPathScreen } from "@/components/screens/khatu-path"
import { LostFoundScreen } from "@/components/screens/lost-found"
import { ParkingScreen } from "@/components/screens/parking"
import { TrafficScreen as TrafficFullScreen } from "@/components/screens/traffic"
import { useLanguage } from "@/lib/contexts/LanguageContext"

export function InfoScreens({
  screen,
  navigate,
}: {
  screen: ScreenKey
  navigate: (s: ScreenKey) => void
}) {
  if (screen === "khatu-path") return <KhatuPathScreen navigate={navigate} />
  if (screen === "lost-found") return <LostFoundScreen navigate={navigate} />
  if (screen === "parking") return <ParkingScreen navigate={navigate} />
  if (screen === "traffic") return <TrafficFullScreen navigate={navigate} />
  if (screen === "crowd") return <CrowdScreen />
  if (screen === "offline") return <OfflineScreen />
  if (screen === "temple") return <TempleScreen />
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

function CrowdScreen() {
  const { t } = useLanguage()
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#FFE0B2] bg-[#FFF8E7] p-5 text-center shadow-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#FF8C00] text-white shadow">
          <Icon name="Users" className="size-8" />
        </span>
        <p className="mt-3 font-heading text-2xl font-bold text-[#8a4b12]">{t("info.crowd.rushLevel")}</p>
        <p className="text-sm text-[#8a5a22]">{t("info.crowd.devoteesCount")}</p>
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
  const { t, tObject } = useLanguage()
  const offlineCentersList: any[] = tObject("info.offline.offlineCentersList") || []
  return (
    <div className="space-y-5">
      <section className="flex items-center gap-3 rounded-2xl border border-[#FFE0B2] bg-[#FFF8E7] p-4">
        <Icon name="Info" className="size-6 shrink-0 text-[#FF8C00]" />
        <p className="text-sm leading-relaxed text-[#8a5a22]">
          {t("info.offline.infoText")}
        </p>
      </section>

      <SectionTitle title={t("info.offline.title")} />
      <div className="space-y-3">
        {offlineCentersList.map((c) => (
          <article key={c.name} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#FFF3E0] text-[#FF8C00]">
                <Icon name="Building2" className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-heading text-sm font-bold text-foreground">{c.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="MapPin" className="size-3.5" />
                  {c.area}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Clock" className="size-3.5" />
                  {c.hours}
                </p>
              </div>
            </div>
            <a
              href={`tel:${c.phone}`}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] py-2.5 text-sm font-bold text-white active:scale-[0.99]"
            >
              <Icon name="Phone" className="size-4" />
              {c.phone}
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}

function TempleScreen() {
  const { t, tObject } = useLanguage()
  const darshanTimings: any[] = tObject("info.temple.darshanTimingsList") || []
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
  const { t, tObject } = useLanguage()
  const notifications: any[] = tObject("screens.notifications.notificationsList") || []
  return (
    <div className="space-y-3">
      {notifications.map((n, i) => (
        <article
          key={i}
          className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
              n.tone === "success" ? "bg-[#e7f3ea] text-success" : "bg-[#FFF3E0] text-[#FF8C00]"
            }`}
          >
            <Icon name={n.icon} className="size-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-sm font-bold text-foreground">{n.title}</p>
              <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
            </div>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
