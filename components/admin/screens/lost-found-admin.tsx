"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, PipelineStep, LiveDot, ActivityItem } from "@/components/admin/admin-shared"
import { lostFoundCases, lostFoundStatuses, type AdminScreenKey } from "@/lib/admin-data"
import { supabase } from "@/lib/supabase"
import { adminApi } from "@/lib/api-client"

export function LostFoundAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [tab, setTab] = useState<"lost-reports" | "found-registration" | "claim-requests">("lost-reports")
  const [filter, setFilter] = useState<string>("all")
  const [cases, setCases] = useState<any[]>(lostFoundCases)
  const [loading, setLoading] = useState(false)
  const getTodayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  const [foundForm, setFoundForm] = useState({
    itemName: "",
    category: "General",
    description: "",
    imageUrl: "",
    date: getTodayStr(),
    time: "12:00 PM",
    location: "",
    storageLocation: "Security Desk",
    foundBy: "Security Guard",
    status: "Found",
    remarks: "",
    associatedLostId: ""
  })

  const [openReports, setOpenReports] = useState<any[]>([])
  const [claimsList, setClaimsList] = useState<any[]>([])
  const [loadingClaims, setLoadingClaims] = useState(false)

  const loadCases = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("lost_items")
        .select(`
          *,
          profiles (
            name,
            phone
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setCases(data.map(c => ({
          id: c.case_number,
          dbId: c.id,
          itemName: c.item_name,
          description: c.color_description,
          location: c.location_lost,
          reportedAt: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reportedBy: c.profiles?.name || "Anonymous",
          phone: c.contact_phone || c.profiles?.phone || "No phone",
          status: c.status as any,
          icon: "PackageSearch",
          matchedFoundItem: c.matched_found_item_id ? `Found Item ID: ${c.matched_found_item_id}` : undefined,
          additionalDetails: c.additional_details
        })))
      } else {
        setCases([])
      }
    } catch (err) {
      console.error("Failed to load lost cases from Supabase", err)
    } finally {
      setLoading(false)
    }
  }

  const loadClaims = async () => {
    setLoadingClaims(true)
    try {
      const data = await adminApi.getFoundClaims()
      if (data) {
        setClaimsList(data)
      }
    } catch (err) {
      console.error("Failed to load claims list", err)
    } finally {
      setLoadingClaims(false)
    }
  }

  const loadOpenReports = async () => {
    try {
      const { data, error } = await supabase
        .from("lost_items")
        .select(`
          id,
          case_number,
          item_name,
          profiles (name)
        `)
        .is("matched_found_item_id", null)
        .not("status", "eq", "collected")

      if (error) throw error
      if (data) {
        setOpenReports(data)
      }
    } catch (err) {
      console.error("Failed to load open lost reports", err)
    }
  }

  const handleRegisterFound = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminApi.registerManualFound({
        item_name: foundForm.itemName,
        category: foundForm.category,
        description: foundForm.description,
        image_url: foundForm.imageUrl || null,
        date_found: foundForm.date,
        time_found: foundForm.time,
        location_found: foundForm.location,
        storage_location: foundForm.storageLocation,
        found_by: foundForm.foundBy,
        remarks: foundForm.remarks,
        lost_item_id: foundForm.associatedLostId || null
      })

      alert("Found item registered successfully!")
      setFoundForm({
        itemName: "",
        category: "General",
        description: "",
        imageUrl: "",
        date: getTodayStr(),
        time: "12:00 PM",
        location: "",
        storageLocation: "Security Desk",
        foundBy: "Security Guard",
        status: "Found",
        remarks: "",
        associatedLostId: ""
      })
      
      loadCases()
      loadOpenReports()
      setTab("lost-reports")
    } catch (err: any) {
      console.error(err)
      alert("Failed to register found item: " + (err.message || err))
    }
  }

  const handleActionClaim = async (claimId: string, action: "approve" | "reject", rejectionReason?: string) => {
    try {
      await adminApi.actionFoundClaim({
        claim_id: claimId,
        action,
        rejection_reason: rejectionReason
      })
      alert(`Claim request ${action}d successfully!`)
      loadClaims()
      loadCases()
    } catch (err: any) {
      console.error(err)
      alert("Failed to perform action on claim: " + (err.message || err))
    }
  }

  // Fetch live cases on mount
  useEffect(() => {
    loadCases()
    loadClaims()
    loadOpenReports()
  }, [])

  const mapStatusToHistoryLabel = (status: string) => {
    switch (status) {
      case "registered": return "Reported"
      case "searching":
      case "possible-match":
      case "verification":
        return "Under Review"
      case "ready-to-collect": return "Found"
      case "collected": return "Claimed"
      case "closed": return "Closed"
      default: return "Reported"
    }
  }

  const handleMoveStatus = async (caseId: string, dbId: string, nextStatus: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: nextStatus } : c))

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && dbId) {
        // 1. Fetch current details
        const { data: item, error: fetchErr } = await supabase
          .from("lost_items")
          .select("profile_id, item_name, additional_details, status")
          .eq("id", dbId)
          .single()
        
        if (fetchErr) throw fetchErr

        // 2. Parse existing additional_details
        let parsed: any = { user_notes: "", history: [] }
        try {
          if (item.additional_details && item.additional_details.startsWith("{") && item.additional_details.endsWith("}")) {
            parsed = JSON.parse(item.additional_details)
          } else {
            parsed.user_notes = item.additional_details || ""
          }
        } catch (e) {
          parsed.user_notes = item.additional_details || ""
        }

        if (!Array.isArray(parsed.history)) {
          parsed.history = []
        }

        // 3. Add transition entry
        const historyLabel = mapStatusToHistoryLabel(nextStatus)
        const timestamp = new Date().toISOString()
        parsed.history.push({
          status: historyLabel,
          timestamp,
          notes: `Status changed to ${nextStatus.replace(/-/g, " ")} by Admin`
        })

        // 4. Update status and history
        const { error: updateErr } = await supabase
          .from("lost_items")
          .update({ 
            status: nextStatus,
            additional_details: JSON.stringify(parsed),
            updated_at: timestamp
          })
          .eq("id", dbId)
        
        if (updateErr) throw updateErr

        // 5. Notify user if status is "ready-to-collect" (Found)
        if (nextStatus === "ready-to-collect") {
          await supabase
            .from("notifications")
            .insert({
              profile_id: item.profile_id,
              title_en: "Lost Item Found",
              title_hi: "खोई हुई वस्तु मिल गई है",
              body_en: `Your reported item "${item.item_name}" has been marked as found! Please visit the Lost & Found desk at Gate 2 to collect it.`,
              body_hi: `आपकी रिपोर्ट की गई वस्तु "${item.item_name}" मिल गई है! कृपया इसे प्राप्त करने के लिए गेट 2 पर खोया-पाया डेस्क पर जाएं।`,
              type: "lost-found",
              icon: "PackageSearch",
              tone: "success"
            })
        }

        // 6. Write Audit Log
        await supabase
          .from("audit_logs")
          .insert({
            action: `Lost & Found status updated to ${nextStatus} for item "${item.item_name}" (Case: ${caseId})`,
            department: "Security / Lost & Found",
            actor_name: "Admin",
            old_values: { status: item.status },
            new_values: { status: nextStatus }
          })
      }
    } catch (err) {
      console.error("Failed to update status in Supabase", err)
    }
  }

  const handleCloseCase = async (caseId: string, dbId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: "collected" } : c))

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && dbId) {
        // 1. Fetch current details
        const { data: item, error: fetchErr } = await supabase
          .from("lost_items")
          .select("profile_id, item_name, additional_details, status")
          .eq("id", dbId)
          .single()
        
        if (fetchErr) throw fetchErr

        // 2. Parse existing additional_details
        let parsed: any = { user_notes: "", history: [] }
        try {
          if (item.additional_details && item.additional_details.startsWith("{") && item.additional_details.endsWith("}")) {
            parsed = JSON.parse(item.additional_details)
          } else {
            parsed.user_notes = item.additional_details || ""
          }
        } catch (e) {
          parsed.user_notes = item.additional_details || ""
        }

        if (!Array.isArray(parsed.history)) {
          parsed.history = []
        }

        // 3. Add Closed transition entry
        const timestamp = new Date().toISOString()
        parsed.history.push({
          status: "Closed",
          timestamp,
          notes: "Case closed by Admin"
        })

        // 4. Update lost_items
        const { error: updateErr } = await supabase
          .from("lost_items")
          .update({ 
            status: "collected",
            additional_details: JSON.stringify(parsed),
            updated_at: timestamp
          })
          .eq("id", dbId)
        
        if (updateErr) throw updateErr

        // 5. Notify user
        await supabase
          .from("notifications")
          .insert({
            profile_id: item.profile_id,
            title_en: "Lost Item Case Closed",
            title_hi: "खोई हुई वस्तु का केस बंद किया गया",
            body_en: `Your reported lost item case for "${item.item_name}" has been closed.`,
            body_hi: `"${item.item_name}" के लिए आपका खोया हुआ वस्तु केस बंद कर दिया गया है।`,
            type: "lost-found",
            icon: "XCircle",
            tone: "info"
          })

        // 6. Write Audit Log
        await supabase
          .from("audit_logs")
          .insert({
            action: `Lost & Found case ${caseId} was CLOSED by Admin`,
            department: "Security / Lost & Found",
            actor_name: "Admin",
            old_values: { status: item.status },
            new_values: { status: "collected" }
          })
      }
    } catch (err) {
      console.error("Failed to close case in Supabase", err)
    }
  }

  const statusCounts = lostFoundStatuses.map((s) => ({
    ...s,
    count: cases.filter((c: any) => c.status === s.key).length,
  }))

  const filtered = filter === "all" ? cases : cases.filter((c: any) => c.status === filter)
  const resolved = cases.filter((c: any) => c.status === "collected").length
  const total = cases.length
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

      {/* Tab Switcher */}
      <div className="flex border-b border-border mb-4">
        <button
          onClick={() => setTab("lost-reports")}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            tab === "lost-reports" ? "border-purple-650 text-purple-650" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Lost Items Queue
        </button>
        <button
          onClick={() => setTab("found-registration")}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            tab === "found-registration" ? "border-purple-650 text-purple-650" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Register Found Item
        </button>
        <button
          onClick={() => setTab("claim-requests")}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            tab === "claim-requests" ? "border-purple-650 text-purple-650" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Claim Requests ({claimsList.filter(c => c.status === "pending").length})
        </button>
      </div>

      {tab === "lost-reports" && (
        <>
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
        
        {loading ? (
          <p className="text-center text-xs text-muted-foreground py-8">Loading lost reports queue...</p>
        ) : (
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
                      {item.status.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
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
                        {item.matchedFoundItem}
                      </span>
                    </div>
                  )}

                  {/* Status History Timeline */}
                  {(() => {
                    let parsed: any = { user_notes: "", history: [] }
                    try {
                      if (item.additionalDetails && item.additionalDetails.startsWith("{") && item.additionalDetails.endsWith("}")) {
                        parsed = JSON.parse(item.additionalDetails)
                      }
                    } catch (e) {}

                    if (parsed.history && parsed.history.length > 0) {
                      return (
                        <div className="mt-3 border-t border-border/50 pt-2.5 space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Icon name="History" className="size-3" /> Status History Timeline
                          </p>
                          <div className="space-y-1.5 pl-2 border-l border-border/80">
                            {parsed.history.map((h: any, idx: number) => (
                              <div key={idx} className="text-[10px] flex justify-between items-center text-muted-foreground">
                                <span className="font-semibold text-foreground">· {h.status}</span>
                                <span>{new Date(h.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

                  {/* Actions */}
                  {item.status !== "collected" && (
                    <div className="mt-3 flex items-center gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => handleMoveStatus(item.id, item.dbId, nextStatus)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
                        >
                          <Icon name="ArrowRight" className="size-3.5" />
                          Move to {nextStatus.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                      )}
                      <button
                        onClick={() => handleCloseCase(item.id, item.dbId)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 py-2.5 text-[11px] font-bold shadow-sm transition hover:bg-red-100 active:scale-[0.98]"
                      >
                        <Icon name="XCircle" className="size-3.5" />
                        Close Case
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
        )}
      </section>
        </>
      )}

      {tab === "found-registration" && (
        <form onSubmit={handleRegisterFound} className="space-y-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <AdminSectionTitle title="Register New Found Item" icon="Plus" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Item Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Leather Wallet, Gold Chain"
                value={foundForm.itemName}
                onChange={(e) => setFoundForm(prev => ({ ...prev, itemName: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Category *</label>
              <select
                value={foundForm.category}
                onChange={(e) => setFoundForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Valuables">Valuables</option>
                <option value="Documents">Documents</option>
                <option value="Clothing">Clothing</option>
                <option value="Keys">Keys</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Description *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Black leather wallet containing ID card for Nand Kumar"
              value={foundForm.description}
              onChange={(e) => setFoundForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Location Found *</label>
              <input
                type="text"
                required
                placeholder="e.g. Toran Dwar, Main Hall"
                value={foundForm.location}
                onChange={(e) => setFoundForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Date Found *</label>
              <input
                type="date"
                required
                value={foundForm.date}
                onChange={(e) => setFoundForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Time Found</label>
              <input
                type="text"
                placeholder="e.g. 10:30 AM"
                value={foundForm.time}
                onChange={(e) => setFoundForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Storage Location</label>
              <input
                type="text"
                placeholder="e.g. Safe Cabinet A"
                value={foundForm.storageLocation}
                onChange={(e) => setFoundForm(prev => ({ ...prev, storageLocation: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Found By</label>
              <input
                type="text"
                placeholder="e.g. Volunteer Ramesh"
                value={foundForm.foundBy}
                onChange={(e) => setFoundForm(prev => ({ ...prev, foundBy: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Image URL (Optional)</label>
              <input
                type="text"
                placeholder="e.g. /images/found-watch.jpg"
                value={foundForm.imageUrl}
                onChange={(e) => setFoundForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Associate with Open Lost Report (Optional)</label>
              <select
                value={foundForm.associatedLostId}
                onChange={(e) => setFoundForm(prev => ({ ...prev, associatedLostId: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              >
                <option value="">-- Auto Match or Keep Independent --</option>
                {openReports.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.case_number} - {r.item_name} ({r.profiles?.name || "Devotee"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Remarks / Internal Notes</label>
              <input
                type="text"
                placeholder="e.g. Back scratch, pending verification"
                value={foundForm.remarks}
                onChange={(e) => setFoundForm(prev => ({ ...prev, remarks: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setTab("lost-reports")}
              className="rounded-xl border border-border bg-muted/30 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/50 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-650 hover:bg-purple-750 text-white text-xs px-5 py-2.5 font-bold shadow-sm transition active:scale-95"
            >
              Submit & Register Item
            </button>
          </div>
        </form>
      )}

      {tab === "claim-requests" && (
        <section className="space-y-4">
          <AdminSectionTitle title="Devotee Claim Requests" icon="FileCheck" />
          
          {loadingClaims ? (
            <p className="text-center text-xs text-muted-foreground py-6">Loading claims...</p>
          ) : claimsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claimsList.map((claim) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        {claim.found_items?.item_name || "Found Item"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Category: {claim.found_items?.category || "General"} | Found on: {claim.found_items?.date_found}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase rounded-lg px-2.5 py-1 ${
                      claim.status === "approved" 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : claim.status === "rejected" 
                          ? "bg-red-50 text-red-700 border border-red-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {claim.status}
                    </span>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5">
                    <p className="text-foreground font-semibold border-b border-border pb-1 mb-1 flex items-center gap-1.5">
                      <Icon name="User" className="size-3.5" /> Claimant Information
                    </p>
                    <p><strong>Name:</strong> {claim.claimant_name}</p>
                    <p><strong>Phone:</strong> {claim.profiles?.phone || "N/A"}</p>
                    <p><strong>Identity Proof:</strong> {claim.identity_proof_type} ({claim.identity_proof_number})</p>
                    <p className="pt-1 text-foreground leading-relaxed">
                      <strong>Claim Description:</strong> {claim.claim_description}
                    </p>
                  </div>

                  {claim.status === "pending" && (
                    <div className="flex gap-2 pt-1.5">
                      <button
                        onClick={() => handleActionClaim(claim.id, "approve")}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white py-2 text-xs font-bold shadow-sm transition active:scale-95"
                      >
                        <Icon name="Check" className="size-3.5" />
                        Approve Claim
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Enter rejection reason:")
                          if (reason !== null) {
                            handleActionClaim(claim.id, "reject", reason)
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-2 text-xs font-bold transition active:scale-95"
                      >
                        <Icon name="X" className="size-3.5" />
                        Reject Claim
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-8 italic border border-dashed rounded-2xl">
              No claim requests found in queue.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
