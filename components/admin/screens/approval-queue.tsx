"use client"

import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, ApprovalBadge } from "@/components/admin/admin-shared"
import { approvalQueue, deptColors, type AdminScreenKey } from "@/lib/admin-data"

export function ApprovalQueueScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const pending = approvalQueue.filter((a) => a.status === "pending").length
  const approved = approvalQueue.filter((a) => a.status === "approved").length
  const rejected = approvalQueue.filter((a) => a.status === "rejected").length

  const typeIcons: Record<string, string> = {
    "hotel-update": "BedDouble",
    "temple-info": "Landmark",
    announcement: "Megaphone",
    "service-listing": "LayoutGrid",
    "parking-info": "SquareParking",
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Approval Queue</h1>
            <p className="text-sm text-white/80 mt-1">Review & approve content changes</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="ClipboardCheck" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Pending", value: pending },
            { label: "Approved", value: approved },
            { label: "Rejected", value: rejected },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Notice */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
        <Icon name="Info" className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-medium leading-relaxed">
          All non-emergency content must pass through approval before becoming visible to devotees. Emergency alerts bypass this queue.
        </p>
      </div>

      {/* Approval Items */}
      <section>
        <AdminSectionTitle title="Pending Review" icon="Clock" action={<span className="text-[11px] text-muted-foreground">{pending} pending</span>} />
        <div className="space-y-3">
          {approvalQueue
            .filter((a) => a.status === "pending")
            .map((item) => {
              const dc = deptColors[item.department]
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-11 place-items-center rounded-xl ${dc.bg} ${dc.text} shadow-sm`}>
                        <Icon name={typeIcons[item.type] || "FileText"} className="size-5" />
                      </span>
                      <div>
                        <p className="font-heading text-sm font-bold text-foreground">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{item.type.replace(/-/g, " ")}</p>
                      </div>
                    </div>
                    <ApprovalBadge status={item.status} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed rounded-xl bg-white/60 px-3 py-2 border border-amber-100">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Icon name="User" className="size-3" /> {item.submittedBy}
                    <span className="size-1 rounded-full bg-muted-foreground/30" />
                    <Icon name="Clock" className="size-3" /> {item.submittedAt}
                  </div>
                  {/* Actions */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-1.5 rounded-xl bg-green-500 py-2.5 text-[11px] font-bold text-white transition hover:bg-green-600 active:scale-[0.98]">
                      <Icon name="CheckCircle" className="size-3.5" />
                      Approve
                    </button>
                    <button className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-[11px] font-bold text-white transition hover:bg-red-600 active:scale-[0.98]">
                      <Icon name="XCircle" className="size-3.5" />
                      Reject
                    </button>
                  </div>
                </motion.div>
              )
            })}
        </div>
      </section>

      {/* History */}
      <section>
        <AdminSectionTitle title="Recent Decisions" icon="History" />
        <div className="space-y-2">
          {approvalQueue
            .filter((a) => a.status !== "pending")
            .map((item) => {
              const dc = deptColors[item.department]
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <span className={`grid size-10 place-items-center rounded-xl ${dc.bg} ${dc.text} shadow-sm shrink-0`}>
                    <Icon name={typeIcons[item.type] || "FileText"} className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{item.submittedBy}</span>
                      <span className="size-1 rounded-full bg-muted-foreground/30" />
                      <span>{item.submittedAt}</span>
                    </div>
                  </div>
                  <ApprovalBadge status={item.status} />
                </div>
              )
            })}
        </div>
      </section>
    </div>
  )
}
