"use client"

import { Icon } from "@/components/shared"

import { services } from "@/lib/data"

const tints = [
  { bg: "bg-[#FFF3E0]", fg: "text-[#FF8C00]" },
  { bg: "bg-[#FFE0B2]", fg: "text-[#E65100]" },
  { bg: "bg-[#f7eecb]", fg: "text-[#9a7b16]" },
  { bg: "bg-[#e7f3ea]", fg: "text-success" },
]

export function ServicesScreen() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF8C00]">Khatu Dham</p>
          <h1 className="font-heading text-2xl font-bold leading-tight text-foreground">Pilgrim Services</h1>
          <p className="text-sm text-muted-foreground">तीर्थयात्री सेवाएं · सब एक जगह</p>
        </div>
        <span className="grid size-12 place-items-center rounded-2xl border border-[#FFB74D]/40 bg-[#FFF3E0] text-[#FF8C00]">
          <Icon name="LayoutGrid" className="size-6" />
        </span>
      </header>

      {/* Service list */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {services.map((s, i) => {
          const t = tints[i % tints.length]
          return (
            <button
              key={s.key}
              className="group flex w-full items-center gap-4 border-b border-border/70 px-4 py-3.5 text-left transition last:border-0 hover:bg-[#FFF8E7] active:bg-[#FFF3E0]"
            >
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${t.bg} ${t.fg}`}>
                <Icon name={s.icon} className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-heading text-[15px] font-bold text-foreground">{s.label}</span>
                  <span className="rounded-full bg-[#FFF3E0] px-2 py-0.5 text-[10px] font-semibold text-[#FF8C00]">
                    {s.meta}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{s.desc}</span>
              </span>
              <Icon
                name="ChevronRight"
                className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[#FF8C00]"
              />
            </button>
          )
        })}
      </section>

      {/* Trust note */}
      <section className="flex items-center gap-3 rounded-2xl border border-[#FFE0B2] bg-[#FFF8E7] p-4">
        <Icon name="ShieldCheck" className="size-6 shrink-0 text-success" />
        <p className="text-sm leading-relaxed text-[#8a5a22]">
          All services are verified by the Shri Shyam Mandir Committee for a safe and trusted
          experience.
        </p>
      </section>
    </div>
  )
}
