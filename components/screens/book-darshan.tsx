"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Icon, Pill } from "@/components/shared"
import type { ScreenKey } from "@/lib/data"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// demo: a few fully-booked dates in the shown month
const BOOKED = [7, 14, 22]

export function BookDarshanScreen({
  navigate,
  navigateWithDate,
}: {
  navigate: (s: ScreenKey) => void
  navigateWithDate: (s: ScreenKey, date: string) => void
}) {
  const [month, setMonth] = useState(5) // June (0-indexed)
  const year = 2026
  const [selected, setSelected] = useState<number | null>(28)

  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay()
    const total = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = Array.from({ length: first }, () => null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
  }, [month])

  const today = 23

  const handleContinue = () => {
    if (selected) {
      const dateStr = `${selected} ${MONTHS[month]} ${year}`
      navigateWithDate("passenger-details", dateStr)
    }
  }

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="text-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Select Darshan Date</h2>
        <p className="text-sm text-muted-foreground">दर्शन की तारीख चुनें</p>
      </div>

      {/* Calendar card */}
      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setMonth((m) => Math.max(5, m - 1))}
            className="grid size-9 place-items-center rounded-xl bg-[#FFF3E0] text-[#FF8C00] disabled:opacity-40 transition hover:bg-[#FFE0B2]"
            disabled={month <= 5}
            aria-label="Previous month"
          >
            <Icon name="ChevronLeft" className="size-5" />
          </button>
          <p className="font-heading text-base font-bold text-foreground">
            {MONTHS[month]} {year}
          </p>
          <button
            onClick={() => setMonth((m) => Math.min(7, m + 1))}
            className="grid size-9 place-items-center rounded-xl bg-[#FFF3E0] text-[#FF8C00] disabled:opacity-40 transition hover:bg-[#FFE0B2]"
            disabled={month >= 7}
            aria-label="Next month"
          >
            <Icon name="ChevronRight" className="size-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="text-xs font-semibold text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => {
            if (d === null) return <span key={i} />
            const isPast = d < today
            const isBooked = BOOKED.includes(d)
            const disabled = isPast || isBooked
            const isSel = selected === d
            return (
              <button
                key={i}
                disabled={disabled}
                onClick={() => setSelected(d)}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-xl text-sm font-semibold transition",
                  isSel && "bg-gradient-to-r from-[#FF8C00] to-[#FFA726] text-white shadow-md",
                  !isSel && !disabled && "bg-[#FFF3E0] text-[#a85a14] hover:bg-[#FFE0B2]",
                  isBooked && "bg-secondary text-muted-foreground line-through",
                  isPast && !isBooked && "text-muted-foreground/40",
                )}
              >
                {d}
                {d === today && !isSel ? (
                  <span className="absolute bottom-1 size-1 rounded-full bg-[#FF8C00]" />
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-3 rounded bg-[#FFF3E0]" /> Available
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-3 rounded bg-[#FF8C00]" /> Selected
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-3 rounded bg-secondary" /> Fully booked
          </span>
        </div>
      </section>

      {/* Status for selected date */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Darshan", value: "Open", icon: "DoorOpen", tone: "success" as const },
          { label: "Crowd", value: "Moderate", icon: "Users", tone: "warning" as const },
          { label: "Wait", value: "~35 min", icon: "Clock", tone: "warning" as const },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
            <span
              className={cn(
                "mx-auto grid size-9 place-items-center rounded-xl",
                s.tone === "success" ? "bg-[#e7f3ea] text-success" : "bg-[#FFF3E0] text-[#FF8C00]",
              )}
            >
              <Icon name={s.icon} className="size-5" />
            </span>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{s.label}</p>
            <p className="font-heading text-sm font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Temple notice */}
      <section className="flex items-start gap-3 rounded-2xl border border-[#FFE0B2] bg-[#FFF8E7] p-4">
        <Icon name="Info" className="mt-0.5 size-5 shrink-0 text-[#FF8C00]" />
        <p className="text-sm leading-relaxed text-[#8a5a22]">
          Carry a valid ID proof for all visitors. Mobile phones and large bags are not allowed inside
          the sanctum. <span className="font-semibold">Darshan is free of charge.</span>
        </p>
      </section>

      {/* Sticky continue */}
      <div className="fixed inset-x-0 bottom-[68px] z-20 mx-auto w-full md:max-w-[480px] border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selected ? (
              <>
                Selected: <span className="font-semibold text-foreground">{selected} {MONTHS[month]}</span>
              </>
            ) : (
              "Please select a date"
            )}
          </span>
        </div>
        <button
          disabled={!selected}
          onClick={handleContinue}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] py-3.5 font-heading text-base font-bold text-white shadow-lg shadow-[#FF8C00]/20 transition active:scale-[0.99] disabled:opacity-50 hover:shadow-xl"
        >
          Continue
          <Icon name="ArrowRight" className="size-5" />
        </button>
      </div>
    </div>
  )
}
