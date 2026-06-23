"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Icon, Pill, QrMock } from "@/components/shared"
import { bookings, type Booking, type ScreenKey } from "@/lib/data"

const tabs: { key: Booking["status"]; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
]

const tone = (s: Booking["status"]) =>
  s === "upcoming" ? "success" : s === "completed" ? "orange" : "muted"

export function MyBookingsScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const [tab, setTab] = useState<Booking["status"]>("upcoming")
  const list = bookings.filter((b) => b.status === tab)

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#FFF3E0] p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-semibold transition",
              tab === t.key ? "bg-gradient-to-r from-[#FF8C00] to-[#FFA726] text-white shadow" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#FFF3E0] text-muted-foreground">
            <Icon name="Ticket" className="size-7" />
          </span>
          <p className="mt-3 font-heading font-semibold text-foreground">No {tab} bookings</p>
          <p className="text-sm text-muted-foreground">कोई बुकिंग नहीं मिली</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <article key={b.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-dashed border-border bg-[#FFF8E7] px-4 py-3">
                <div className="flex items-center gap-2 text-[#FF8C00]">
                  <Icon name="CalendarCheck" className="size-5" />
                  <span className="font-heading text-sm font-bold">{b.date}</span>
                  <span className="text-xs text-muted-foreground">· {b.day}</span>
                </div>
                <Pill tone={tone(b.status)}>
                  {b.status === "upcoming" ? "Confirmed" : b.status === "completed" ? "Completed" : "Cancelled"}
                </Pill>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-white p-1">
                  <QrMock size={72} seed={b.id} />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Hash" className="size-4 text-muted-foreground" />
                    <span className="truncate font-mono text-xs font-semibold text-foreground">{b.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Users" className="size-4" />
                    {b.visitors} Visitors
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="User" className="size-4" />
                    {b.name}
                  </div>
                </div>
              </div>

              {b.status !== "cancelled" ? (
                <button
                  onClick={() => navigate("qr")}
                  className="flex w-full items-center justify-center gap-2 border-t border-border py-3 font-heading text-sm font-bold text-[#FF8C00] transition active:bg-[#FFF3E0]"
                >
                  <Icon name="Ticket" className="size-4" />
                  View Ticket
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
