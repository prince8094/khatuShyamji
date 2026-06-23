"use client"

import { Icon, SectionTitle } from "@/components/shared"
import { travelModes } from "@/lib/data"

export function HowToReachScreen() {
  return (
    <div className="space-y-5">
      {/* Map */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div
          className="relative h-48 w-full"
          style={{
            backgroundColor: "#e9efe6",
            backgroundImage:
              "linear-gradient(0deg, rgba(255,140,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,0,0.04) 1px, transparent 1px), linear-gradient(140deg, #e7efe2 0%, #eef1e5 100%)",
            backgroundSize: "28px 28px, 28px 28px, 100% 100%",
          }}
        >
          {/* fake roads */}
          <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rotate-[-8deg] bg-[#d9cdb6]" />
          <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rotate-[6deg] bg-[#d9cdb6]" />
          {/* marker */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-center">
            <span className="mx-auto grid size-11 animate-bounce place-items-center rounded-full bg-[#FF8C00] text-white shadow-lg ring-4 ring-white">
              <Icon name="MapPin" className="size-6" />
            </span>
            <span className="mt-1 inline-block rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#FF8C00] shadow">
              Khatu Dham
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <Icon name="MapPinned" className="size-5 text-[#FF8C00]" />
            <div>
              <p className="font-heading text-sm font-bold text-foreground">Shri Shyam Mandir</p>
              <p className="text-xs text-muted-foreground">Khatu, Sikar, Rajasthan 332602</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] px-3 py-2 text-xs font-bold text-white active:scale-95">
            <Icon name="Navigation" className="size-4" />
            Directions
          </button>
        </div>
      </section>

      {/* Travel modes */}
      <section>
        <SectionTitle title="Travel Options" hindi="यात्रा के साधन" />
        <div className="space-y-3">
          {travelModes.map((t) => (
            <div key={t.mode} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF8C00] to-[#FFA726] text-white shadow">
                <Icon name={t.icon} className="size-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">{t.mode}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency */}
      <section className="rounded-3xl border border-[#FFE0B2] bg-[#FFF8E7] p-4">
        <p className="flex items-center gap-2 font-heading font-bold text-[#FF8C00]">
          <Icon name="Siren" className="size-5" />
          Emergency Contacts
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: "Temple Helpline", num: "1800-180-6127", icon: "Phone" },
            { label: "Police", num: "100", icon: "ShieldCheck" },
            { label: "Ambulance", num: "108", icon: "Ambulance" },
            { label: "Lost & Found", num: "01576-230011", icon: "Search" },
          ].map((c) => (
            <a
              key={c.label}
              href={`tel:${c.num}`}
              className="flex items-center gap-2.5 rounded-2xl bg-card p-3 shadow-sm active:scale-[0.98]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] text-white">
                <Icon name={c.icon} className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{c.label}</span>
                <span className="block font-heading text-sm font-bold text-foreground">{c.num}</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
