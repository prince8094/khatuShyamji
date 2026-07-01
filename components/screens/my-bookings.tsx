"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Icon, Pill, QrMock } from "@/components/shared"
import { bookings, type Booking, type ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useNavigation } from "@/lib/contexts/NavigationContext"

const tabs: { key: Booking["status"]; label: string; labelHi: string }[] = [
  { key: "upcoming", label: "Upcoming", labelHi: "आगामी" },
  { key: "completed", label: "Completed", labelHi: "पूर्ण" },
  { key: "cancelled", label: "Cancelled", labelHi: "रद्द" },
]

const tone = (s: Booking["status"]) =>
  s === "upcoming" ? "success" : s === "completed" ? "orange" : "muted"

export function MyBookingsScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { goBack } = useNavigation()
  const { t } = useLanguage()
  const [tab, setTab] = useState<Booking["status"]>("upcoming")
  const [cancelId, setCancelId] = useState<string | null>(null)
  const list = bookings.filter((b) => b.status === tab)

  return (
    <div className="space-y-5 pb-8">
      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-sm font-bold text-[#6b5440] hover:text-[#D97706]"
      >
        <Icon name="ArrowLeft" className="size-4" />
        {t("back")}
      </button>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary/60 p-1.5 gap-1">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200",
              tab === tabItem.key
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tabItem.label, tabItem.labelHi)}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Icon name="Ticket" className="size-8" />
          </span>
          <p className="mt-4 font-heading text-base font-bold text-foreground">
            {t(`No ${tab} bookings`, `${tab === 'upcoming' ? 'कोई आगामी' : tab === 'completed' ? 'कोई पूर्ण' : 'कोई रद्द'} बुकिंग नहीं`)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t("screens.myBookings.yourBookingsWillAppearHere")}</p>
          {tab === "upcoming" && (
            <button
              onClick={() => navigate("book")}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-white shadow-lg"
            >
              <Icon name="CalendarCheck" className="size-4" />
              {t("screens.myBookings.bookDarshanNow")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <article key={b.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-dashed border-border bg-secondary/30 px-5 py-3">
                <div className="flex items-center gap-2 text-primary">
                  <Icon name="CalendarCheck" className="size-5" />
                  <span className="font-heading text-sm font-bold">{b.date}</span>
                  <span className="text-xs text-muted-foreground">· {b.day}</span>
                </div>
                <Pill tone={tone(b.status)}>
                  {b.status === "upcoming"
                    ? t("screens.myBookings.confirmed")
                    : b.status === "completed"
                    ? t("screens.myBookings.completed")
                    : t("screens.myBookings.cancelled")}
                </Pill>
              </div>

              <div className="flex items-center gap-4 p-5">
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-primary/20 bg-white p-1 shadow-inner">
                  <QrMock size={72} seed={b.id} />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Hash" className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate font-mono text-xs font-bold text-foreground">{b.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Users" className="size-4 shrink-0" />
                    <span>{b.visitors} {t("screens.myBookings.visitors")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="User" className="size-4 shrink-0" />
                    <span className="truncate">{b.name}</span>
                  </div>
                </div>
              </div>

              {b.status !== "cancelled" && (
                <div className="flex border-t border-border">
                  <button
                    onClick={() => navigate("qr")}
                    className="flex flex-1 items-center justify-center gap-2 py-3.5 font-heading text-sm font-bold text-primary transition hover:bg-secondary/40 border-r border-border"
                  >
                    <Icon name="Ticket" className="size-4" />
                    {t("screens.myBookings.viewTicket")}
                  </button>
                  {b.status === "upcoming" && (
                    <>
                      {cancelId === b.id ? (
                        <div className="flex flex-1">
                          <button
                            onClick={() => setCancelId(null)}
                            className="flex-1 flex items-center justify-center py-3.5 text-xs font-bold text-muted-foreground hover:bg-secondary/40"
                          >
                            {t("screens.myBookings.keep")}
                          </button>
                          <button
                            onClick={() => setCancelId(null)}
                            className="flex-1 flex items-center justify-center py-3.5 text-xs font-bold text-red-600 hover:bg-red-50 border-l border-border"
                          >
                            {t("screens.myBookings.yesCancel")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCancelId(b.id)}
                          className="flex flex-1 items-center justify-center gap-2 py-3.5 font-heading text-sm font-bold text-red-500 transition hover:bg-red-50"
                        >
                          <Icon name="X" className="size-4" />
                          {t("screens.myBookings.cancel")}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* New Booking CTA */}
      {tab !== "cancelled" && (
        <button
          onClick={() => navigate("book")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-4 font-heading text-base font-bold text-white shadow-lg shadow-primary/20 transition hover:shadow-xl active:scale-[0.99]"
        >
          <Icon name="CalendarCheck" className="size-5" />
          {t("screens.myBookings.bookNewDarshan")}
        </button>
      )}
    </div>
  )
}
