"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, ApprovalBadge, LiveDot } from "@/components/admin/admin-shared"
import { approvalQueue as initialQueue, deptColors, type AdminScreenKey } from "@/lib/admin-data"
import { adminApi } from "@/lib/api-client"

type ExtendedApprovalItem = typeof initialQueue[0] & {
  versionNumber: number
  draftPayload: {
    oldValues: Record<string, string>
    newValues: Record<string, string>
  }
  reviewNotes?: string
  actionedBy?: string
  actionedAt?: string
}

const initialItems: ExtendedApprovalItem[] = [
  {
    id: "APR-001",
    type: "hotel-update",
    title: "Shyam Palace — New room photos",
    submittedBy: "Priya Sharma",
    submittedAt: "Today, 10:30 AM",
    status: "pending",
    department: "accommodation",
    description: "Updated room photo URLs and deluxe descriptions to match peak tourism guidelines.",
    versionNumber: 3,
    draftPayload: {
      oldValues: {
        deluxe_photo: "/images/deluxe-room-old.jpg",
        wifi_available: "false",
        deluxe_price: "₹4,500",
      },
      newValues: {
        deluxe_photo: "/images/deluxe-room-2026-v2.jpg",
        wifi_available: "true",
        deluxe_price: "₹4,800",
      },
    },
  },
  {
    id: "APR-002",
    type: "temple-info",
    title: "Monsoon darshan timings",
    submittedBy: "Rajesh Kumar",
    submittedAt: "Today, 09:00 AM",
    status: "pending",
    department: "temple-info",
    description: "Updated morning aarti to 5:00 AM due to sunrise change for the coming wet season.",
    versionNumber: 2,
    draftPayload: {
      oldValues: {
        mangla_aarti: "4:30 AM",
        shringar_aarti: "7:00 AM",
        closing_time: "9:00 PM",
      },
      newValues: {
        mangla_aarti: "5:00 AM",
        shringar_aarti: "7:30 AM",
        closing_time: "9:30 PM",
      },
    },
  },
  {
    id: "APR-003",
    type: "announcement",
    title: "Ekadashi special arrangements",
    submittedBy: "Rajesh Kumar",
    submittedAt: "Yesterday, 04:00 PM",
    status: "approved",
    department: "super-admin",
    description: "Extra counters and extended darshan hours for Ekadashi",
    versionNumber: 1,
    draftPayload: { oldValues: { hours: "Standard" }, newValues: { hours: "Extended 24h" } },
    reviewNotes: "All safety check barriers are mapped, approved for broadcast.",
    actionedBy: "Nand Kumar",
    actionedAt: "Yesterday, 05:00 PM",
  },
  {
    id: "APR-004",
    type: "service-listing",
    title: "New transport operator added",
    submittedBy: "Vikram Singh",
    submittedAt: "Yesterday, 02:00 PM",
    status: "rejected",
    department: "parking",
    description: "Shyam Travels — new bus service from Delhi",
    versionNumber: 1,
    draftPayload: { oldValues: { operator: "None" }, newValues: { operator: "Shyam Travels" } },
    reviewNotes: "Duplicate license registration. Verify commercial permit again.",
    actionedBy: "Nand Kumar",
    actionedAt: "Yesterday, 03:00 PM",
  },
]

export function ApprovalQueueScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [queue, setQueue] = useState<any[]>(initialItems)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [reviewNotesInput, setReviewNotesInput] = useState("")

  // Load from Supabase on mount
  useEffect(() => {
    const loadQueue = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) return

      try {
        const data = await adminApi.getApprovals()

        if (data && data.length > 0) {
          setQueue(data.map((item: any) => {
            return {
              id: `APR-0${item.id.slice(0, 2).toUpperCase()}`,
              dbId: item.id,
              type: item.type,
              title: item.title,
              submittedBy: "Rajesh Kumar",
              submittedAt: new Date(item.submitted_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
              status: item.status as "pending" | "approved" | "rejected",
              department: item.department || "super-admin",
              description: item.description || "Proposal config updates",
              versionNumber: item.version_number || 1,
              draftPayload: item.draft_payload || { oldValues: {}, newValues: {} },
              reviewNotes: item.review_notes || item.rejection_reason || undefined,
              actionedBy: item.approved_by_admin_id ? "Nand Kumar" : undefined,
              actionedAt: item.approved_at ? new Date(item.approved_at).toLocaleString() : undefined
            }
          }))
        }
      } catch (err) {
        console.error("Failed to load approval queue", err)
      }
    }

    loadQueue()
  }, [])

  const pending = queue.filter((a) => a.status === "pending").length
  const approved = queue.filter((a) => a.status === "approved").length
  const rejected = queue.filter((a) => a.status === "rejected").length

  const typeIcons: Record<string, string> = {
    "hotel-update": "BedDouble",
    "temple-info": "Landmark",
    announcement: "Megaphone",
    "service-listing": "LayoutGrid",
    "parking-info": "SquareParking",
  }

  const handleApprove = async (id: string) => {
    const nowStr = new Date().toISOString()
    const currentAdminStr = localStorage.getItem("current_admin")
    let adminId = "00000000-0000-0000-0000-000000000000"
    if (currentAdminStr) {
      try {
        adminId = JSON.parse(currentAdminStr).id
      } catch (err) {}
    }

    setQueue(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: "approved" as const, reviewNotes: reviewNotesInput, actionedBy: "Nand Kumar", actionedAt: "Today" }
          : item
      )
    )

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        const selected = queue.find(item => item.id === id)
        if (selected) {
          await adminApi.actionApproval({
            proposal_id: selected.dbId,
            status: "approved",
            review_notes: reviewNotesInput
          })
        }
      }
    } catch (err) {
      console.error("Failed to approve proposal in DB", err)
    }

    setReviewId(null)
    setReviewNotesInput("")
  }

  const handleReject = async (id: string) => {
    if (!reviewNotesInput.trim()) {
      alert("A brief rejection remark is required to guide resubmissions.")
      return
    }
    const nowStr = new Date().toISOString()
    const currentAdminStr = localStorage.getItem("current_admin")
    let adminId = "00000000-0000-0000-0000-000000000000"
    if (currentAdminStr) {
      try {
        adminId = JSON.parse(currentAdminStr).id
      } catch (err) {}
    }

    setQueue(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: "rejected" as const, reviewNotes: reviewNotesInput, actionedBy: "Nand Kumar", actionedAt: "Today" }
          : item
      )
    )

    try {
      const selected = queue.find(item => item.id === id)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        if (selected) {
          await adminApi.actionApproval({
            proposal_id: selected.dbId,
            status: "rejected",
            rejection_reason: reviewNotesInput,
            review_notes: reviewNotesInput
          })
        }
      }
    } catch (err) {
      console.error("Failed to reject proposal in DB", err)
    }

    setReviewId(null)
    setReviewNotesInput("")
  }

  const selectedItem = queue.find(item => item.id === reviewId)

  const renderReviewModal = () => {
    if (!selectedItem) return null
    const dc = (deptColors as any)[selectedItem.department]
    const diff = selectedItem.draftPayload

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4 shrink-0">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Review Proposal changes</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Submitter: <strong>{selectedItem.submittedBy}</strong> · Submission Time: <strong>{selectedItem.submittedAt}</strong> · Version: V{selectedItem.versionNumber}
              </p>
            </div>
            <button onClick={() => setReviewId(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Meta Info */}
            <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
              <p className="font-extrabold text-foreground mb-1">Proposal summary description:</p>
              {selectedItem.description}
            </div>

            {/* Side-by-side JSON payload diffs */}
            <div>
              <p className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="FileJson" className="size-4 text-orange-600" />
                Change Payload Difference Audits
              </p>
              
              <div className="grid grid-cols-2 gap-3.5">
                {/* Old Values */}
                <div className="rounded-xl border border-red-200 bg-red-50/20 p-3">
                  <p className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest border-b border-red-100 pb-1.5 mb-2.5 flex items-center gap-1">
                    <Icon name="Minus" className="size-3" /> Live Production values
                  </p>
                  <pre className="font-mono text-[10px] text-red-600 bg-red-50/10 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(diff.oldValues, null, 2)}
                  </pre>
                </div>
                {/* New Values */}
                <div className="rounded-xl border border-green-200 bg-green-50/20 p-3">
                  <p className="text-[10px] font-extrabold text-green-700 uppercase tracking-widest border-b border-green-100 pb-1.5 mb-2.5 flex items-center gap-1">
                    <Icon name="Plus" className="size-3" /> Proposed Draft values
                  </p>
                  <pre className="font-mono text-[10px] text-green-600 bg-green-50/10 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(diff.newValues, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="border-t border-border pt-4">
              <label className="block text-xs font-bold text-foreground mb-1.5">Reviewer Notes & Remarks *</label>
              <textarea
                required
                rows={3}
                placeholder="Enter approval details or specify validation corrections for rejections..."
                value={reviewNotesInput}
                onChange={e => setReviewNotesInput(e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-semibold focus:outline-none focus:border-orange-600 resize-none"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex gap-2 justify-end pt-3 mt-4 border-t border-border shrink-0">
            <button
              onClick={() => setReviewId(null)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleReject(selectedItem.id)}
              className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              Reject Proposal
            </button>
            <button
              onClick={() => handleApprove(selectedItem.id)}
              className="rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              Approve & Publish Live
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Proposal Approvals Queue</h1>
            <p className="text-xs text-white/80 mt-1">Review, diff audit & authorize operational database updates</p>
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
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2.5 text-center border border-white/5">
              <p className="text-[10px] text-white/70 uppercase tracking-wide font-semibold">{s.label}</p>
              <p className="font-heading text-lg font-extrabold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 shadow-sm">
        <Icon name="Info" className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-semibold leading-relaxed">
          Standard operational configurations require audit validation before database synchronization. Critical emergency overrides bypass this queue.
        </p>
      </div>

      {/* Pending Reviews list */}
      <section>
        <AdminSectionTitle
          title="Review Pending Proposals"
          icon="Clock"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
              <LiveDot color="bg-green-500" /> Pending Action
            </span>
          }
        />
        <div className="space-y-3.5">
          {queue
            .filter(item => item.status === "pending")
            .map((item) => {
              const dc = (deptColors as any)[item.department]
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-11 place-items-center rounded-xl ${dc.bg} ${dc.text} shadow-sm`}>
                        <Icon name={typeIcons[item.type] || "FileText"} className="size-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-sm font-bold text-foreground">{item.title}</p>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-muted-foreground">{item.id}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{item.type.replace(/-/g, " ")} Proposal</p>
                      </div>
                    </div>
                    <ApprovalBadge status={item.status} />
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed rounded-xl bg-white/60 p-2.5 border border-amber-100/60">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <span>Submitted by: <strong>{item.submittedBy}</strong></span>
                      <span className="size-1 rounded-full bg-muted-foreground/30" />
                      <span>{item.submittedAt}</span>
                    </div>
                    
                    <button
                      onClick={() => setReviewId(item.id)}
                      className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 shadow-sm transition active:scale-[0.98]"
                    >
                      Audit & Action
                    </button>
                  </div>
                </motion.div>
              )
            })}
        </div>
      </section>

      {/* Recent Decisions History */}
      <section>
        <AdminSectionTitle title="Authorization History Decisions Log" icon="History" />
        <div className="space-y-3">
          {queue
            .filter(item => item.status !== "pending")
            .map((item) => {
              const dc = (deptColors as any)[item.department]
              return (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-10 place-items-center rounded-xl ${dc.bg} ${dc.text} shadow-sm shrink-0`}>
                        <Icon name={typeIcons[item.type] || "FileText"} className="size-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-medium">
                          <span>Submitter: {item.submittedBy}</span>
                          <span className="size-1 rounded-full bg-muted-foreground/30" />
                          <span>Auditor: {item.actionedBy}</span>
                        </div>
                      </div>
                    </div>
                    <ApprovalBadge status={item.status} />
                  </div>

                  {item.reviewNotes && (
                    <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed bg-muted/40 p-2.5 rounded-xl border border-border/40">
                      <strong>Auditor Remarks:</strong> {item.reviewNotes}
                    </div>
                  )}

                  <div className="mt-2.5 text-[9px] text-muted-foreground text-right font-medium">
                    Authorized: {item.actionedAt}
                  </div>
                </div>
              )
            })}
        </div>
      </section>

      {/* Review Modal Drawer */}
      {renderReviewModal()}
    </div>
  )
}
