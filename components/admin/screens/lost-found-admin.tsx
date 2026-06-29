"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, PipelineStep, LiveDot, ActivityItem } from "@/components/admin/admin-shared"
import { lostFoundCases, lostFoundStatuses, type AdminScreenKey } from "@/lib/admin-data"

export function LostFoundAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [filter, setFilter] = useState<string>("all")

  const statusCounts = lostFoundStatuses.map((s) => ({
    ...s,
    count: lostFoundCases.filter((c) => c.status === s.key).length,
  }))

  const filtered = filter === "all" ? lostFoundCases : lostFoundCases.filter((c) => c.status === filter)
  const resolved = lostFoundCases.filter((c) => c.status === "collected").length
  const total = lostFoundCases.length
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
    registered: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    searching: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "possible-match": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    verification: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    "ready-to-collect": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    collected: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  }

  const nextStatusMap: Record<string, string> = {
    registered: "searching",
    searching: "possible-match",
    "possible-match": "verification",
    verification: "ready-to-collect",
    "ready-to-collect": "collected",
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Lost & Found</h1>
            <p className="text-sm text-white/80 mt-1">Item recovery & case management</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="PackageSearch" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Total Cases", value: total },
            { label: "Open", value: total - resolved },
            { label: "Resolved", value: resolved },
            { label: "Success", value: `${successRate}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-2 py-2 text-center">
              <p className="text-[9px] text-white/70">{s.label}</p>
              <p className="font-heading text-base font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline View */}
      <section>
        <AdminSectionTitle title="Case Pipeline" icon="GitBranch" />
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`shrink-0 rounded-xl px-3 py-2 text-center transition ${
              filter === "all" ? "bg-[#D97706]/10 border border-[#D97706]/30" : "bg-muted/30"
            }`}
          >
            <span className={`text-[9px] font-bold ${filter === "all" ? "text-[#D97706]" : "text-muted-foreground"}`}>ALL</span>
            <p className={`font-heading text-sm font-bold ${filter === "all" ? "text-[#D97706]" : "text-foreground"}`}>{total}</p>
          </button>
          {statusCounts.map((s) => (
            <PipelineStep
              key={s.key}
              label={s.label}
              icon={s.icon}
              isActive={filter === s.key}
              isCompleted={false}
              count={s.count}
            />
          ))}
        </div>
      </section>

      {/* Case Cards */}
      <section>
        <AdminSectionTitle
          title={`Cases ${filter !== "all" ? `(${filter.replace("-", " ")})` : ""}`}
          icon="Clipboard"
          action={<span className="text-[11px] text-muted-foreground">{filtered.length} items</span>}
        />
        <div className="space-y-3">
          {filtered.map((item) => {
            const sc = statusColorMap[item.status] || statusColorMap.registered
            const statusIdx = lostFoundStatuses.findIndex((s) => s.key === item.status)
            const nextStatus = nextStatusMap[item.status]

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-purple-50 text-purple-600 shadow-sm">
                      <Icon name={item.icon} className="size-5" />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground">{item.itemName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${sc.bg} ${sc.text} ${sc.border}`}>
                    {item.status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                {/* Progress dots */}
                <div className="mt-3 flex items-center gap-1">
                  {lostFoundStatuses.map((s, i) => (
                    <div key={s.key} className="flex items-center">
                      <span className={`size-2.5 rounded-full ${
                        i < statusIdx ? "bg-green-500" : i === statusIdx ? "bg-[#D97706]" : "bg-muted"
                      }`} />
                      {i < lostFoundStatuses.length - 1 && (
                        <span className={`w-4 sm:w-6 h-0.5 ${i < statusIdx ? "bg-green-300" : "bg-muted"}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon name="MapPin" className="size-3 text-purple-500" /> {item.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon name="Clock" className="size-3 text-purple-500" /> {item.reportedAt}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon name="User" className="size-3 text-purple-500" /> {item.reportedBy}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon name="Phone" className="size-3 text-purple-500" /> {item.phone}
                  </div>
                </div>

                {/* Match indicator */}
                {item.matchedFoundItem && (
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                    <Icon name="GitCompare" className="size-4 text-amber-600" />
                    <span className="text-[11px] font-semibold text-amber-700">
                      Possible match: {item.matchedFoundItem}
                    </span>
                  </div>
                )}

                {/* Actions */}
                {nextStatus && (
                  <div className="mt-3 flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]">
                      <Icon name="ArrowRight" className="size-3.5" />
                      Move to {nextStatus.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                    <button className="grid size-10 place-items-center rounded-xl border border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 transition">
                      <Icon name="Bell" className="size-4" />
                    </button>
                  </div>
                )}
                {item.status === "collected" && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2">
                    <Icon name="CheckCircle" className="size-4 text-green-600" />
                    <span className="text-[11px] font-semibold text-green-700">Case resolved</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
