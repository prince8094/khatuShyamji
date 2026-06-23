"use client"

import Image from "next/image"
import { Icon, Om, QrMock } from "@/components/shared"
import { user } from "@/lib/data"

const details = [
  { label: "Booking ID", value: "KSJ-2026-08841", icon: "Hash", mono: true },
  { label: "Name", value: user.name, icon: "User" },
  { label: "Darshan Date", value: "28 Jun 2026 · Sunday", icon: "CalendarCheck" },
  { label: "Visitors", value: "4 Persons", icon: "Users" },
]

const instructions = [
  "Show this QR code at the entry gate for scanning.",
  "Carry a valid government ID for all visitors.",
  "Reach the temple at least 30 minutes before darshan.",
  "Mobile phones are not allowed inside the sanctum.",
]

export function QrPassScreen() {
  return (
    <div className="space-y-5">
      {/* Ticket */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
        {/* Top band */}
        <div
          className="relative overflow-hidden px-5 py-4 text-white"
          style={{ backgroundImage: "linear-gradient(135deg,#FF8C00,#FFA726 60%,#FFB74D)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "200px" }}
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-white shadow-md overflow-hidden">
                <Image
                  src="/images/khatu-shyam-logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="size-[32px] object-contain"
                />
              </span>
              <div>
                <p className="font-heading text-sm font-bold leading-tight">Darshan E-Pass</p>
                <p className="text-xs text-white/80">श्री श्याम मंदिर, खाटू</p>
              </div>
            </div>
            <span className="rounded-full bg-success/90 px-2.5 py-1 text-xs font-semibold">
              Confirmed
            </span>
          </div>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center px-5 pb-2 pt-6">
          <div className="rounded-3xl border-2 border-dashed border-[#FF8C00]/30 bg-white p-4 shadow-inner">
            <QrMock size={200} seed="KSJ-2026-08841" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Scan at the entry gate</p>
        </div>

        {/* perforation */}
        <div className="relative my-3">
          <div className="border-t-2 border-dashed border-border" />
          <span className="absolute -left-3 -top-3 size-6 rounded-full bg-background" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full bg-background" />
        </div>

        {/* details */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 pb-6">
          {details.map((d) => (
            <div key={d.label} className="flex items-start gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FFF3E0] text-[#FF8C00]">
                <Icon name={d.icon} className="size-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{d.label}</dt>
                <dd className={`font-heading text-sm font-bold text-foreground ${d.mono ? "font-mono text-xs" : ""}`}>
                  {d.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] py-3.5 font-heading text-sm font-bold text-white shadow-lg shadow-[#FF8C00]/20 active:scale-[0.99]">
          <Icon name="Download" className="size-5" />
          Download
        </button>
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-[#FFB74D] bg-card py-3.5 font-heading text-sm font-bold text-[#FF8C00] active:scale-[0.99] hover:bg-[#FFF8E7]">
          <Icon name="Share2" className="size-5" />
          Share
        </button>
      </div>

      {/* Instructions */}
      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 font-heading font-bold text-foreground">
          <Icon name="Info" className="size-5 text-[#FF8C00]" />
          Temple Instructions
        </p>
        <ul className="space-y-2.5">
          {instructions.map((t, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#FFF3E0] text-[11px] font-bold text-[#FF8C00]">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
