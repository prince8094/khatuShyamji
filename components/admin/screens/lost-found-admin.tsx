"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, PipelineStep, LiveDot, ActivityItem } from "@/components/admin/admin-shared"
import { lostFoundCases, lostFoundStatuses, type AdminScreenKey } from "@/lib/admin-data"
import { supabase } from "@/lib/supabase"

export function LostFoundAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [tab, setTab] = useState<"lost-reports" | "found-registration">("lost-reports")
  const [filter, setFilter] = useState<string>("all")
  const [cases, setCases] = useState<any[]>(lostFoundCases)
  const [loading, setLoading] = useState(false)
  const [foundForm, setFoundForm] = useState({
    itemName: "",
    description: "",
    location: "",
    date: "",
    color: "Brown",
  })

  const handleRegisterFound = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("found_items")
        .insert({
          item_name: foundForm.itemName,
          description: foundForm.description,
          location_found: foundForm.location,
          date_found: foundForm.date || new Date().toISOString().split("T")[0],
          item_color: foundForm.color,
          status: "registered",
          category_icon: "PackageSearch"
        })
        .select()
        .single()

      if (error) throw error

      alert("Found item registered successfully!")
      setFoundForm({
        itemName: "",
        description: "",
        location: "",
        date: "",
        color: "Brown",
      })
      setTab("lost-reports")
    } catch (err: any) {
      console.error(err)
      alert("Failed to register found item: " + (err.message || err))
    }
  }

  // Fetch live cases on mount
  useEffect(() => {
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
            matchedFoundItem: c.matched_found_item_id ? `Found Item ID: ${c.matched_found_item_id}` : undefined
          })))
        }
      } catch (err) {
        console.error("Failed to load lost cases from Supabase", err)
      } finally {
        setLoading(false)
      }
    }

    loadCases()
  }, [])

  const handleMoveStatus = async (caseId: string, dbId: string, nextStatus: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: nextStatus } : c))

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && dbId) {
        await supabase
          .from("lost_items")
          .update({ 
            status: nextStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", dbId)
      }
    } catch (err) {
      console.error("Failed to update status in Supabase", err)
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
      </div>

      {tab === "lost-reports" ? (
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

                  {/* Actions */}
                  {nextStatus && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleMoveStatus(item.id, item.dbId, nextStatus)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
                      >
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
        )}
      </section>
        </>
      ) : (
        <form onSubmit={handleRegisterFound} className="space-y-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <AdminSectionTitle title="Register New Found Item" icon="Plus" />
          
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
            <label className="block text-xs font-bold text-foreground mb-1.5">Description / Colors *</label>
            <textarea
              required
              rows={3}
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
              <label className="block text-xs font-bold text-foreground mb-1.5">Date Found</label>
              <input
                type="date"
                value={foundForm.date}
                onChange={(e) => setFoundForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Primary Color Code</label>
              <input
                type="text"
                placeholder="e.g. Black, Gold, Silver"
                value={foundForm.color}
                onChange={(e) => setFoundForm(prev => ({ ...prev, color: e.target.value }))}
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
    </div>
  )
}
