"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard } from "@/components/admin/admin-shared"
import { adminApi } from "@/lib/api-client"
import { type AdminScreenKey, type AdminUser } from "@/lib/admin-data"

interface AartiTiming {
  id: string
  name: string
  name_hi?: string
  start_time: string
  end_time?: string
  description?: string
  description_hi?: string
  status: "active" | "inactive"
  display_order: number
}

interface DevoteeGuideline {
  id: string
  title: string
  title_hi?: string
  content: string
  content_hi?: string
  status: "published" | "unpublished"
  display_order: number
}

interface CmsHistoryRecord {
  id: string
  module_type: "aarti" | "guideline"
  record_id: string
  action_type: "create" | "update" | "delete"
  updated_by: string
  updated_time: string
  previous_value: any
  current_value: any
}

export function TempleInfoAdminScreen({
  navigate,
  currentAdmin
}: {
  navigate: (s: AdminScreenKey) => void
  currentAdmin?: AdminUser
}) {
  const activeUser = currentAdmin?.name || "Rajesh Kumar"

  const [tab, setTab] = useState<"aarti" | "guidelines" | "history">("aarti")
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Aarti state
  const [aartis, setAartis] = useState<AartiTiming[]>([])
  const [editingAarti, setEditingAarti] = useState<AartiTiming | null>(null)

  // Guidelines state
  const [guidelines, setGuidelines] = useState<DevoteeGuideline[]>([])
  const [editingGuideline, setEditingGuideline] = useState<DevoteeGuideline | null>(null)

  // History state
  const [history, setHistory] = useState<CmsHistoryRecord[]>([])

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(""), 4000)
    } else {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(""), 4000)
    }
  }

  const loadData = () => {
    setLoading(true)
    Promise.all([
      adminApi.getAartiTimings(),
      adminApi.getDevoteeGuidelines(),
      adminApi.getCmsHistory()
    ])
      .then(([aartiRes, guideRes, histRes]) => {
        setAartis(aartiRes || [])
        setGuidelines(guideRes || [])
        setHistory(histRes || [])
      })
      .catch((err) => {
        triggerToast("Failed to load CMS data: " + err.message, true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  // Aarti CRUD
  const handleSaveAarti = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAarti) return

    adminApi.actionAartiTiming({
      action: "upsert",
      ...editingAarti
    })
      .then(() => {
        triggerToast("Aarti timing saved successfully!")
        setEditingAarti(null)
        loadData()
      })
      .catch((err) => {
        triggerToast("Failed to save Aarti timing: " + err.message, true)
      })
  }

  const handleDeleteAarti = (id: string) => {
    if (!confirm("Are you sure you want to delete this Aarti timing?")) return
    adminApi.actionAartiTiming({ action: "delete", id })
      .then(() => {
        triggerToast("Aarti timing deleted successfully!")
        loadData()
      })
      .catch((err) => {
        triggerToast("Failed to delete Aarti: " + err.message, true)
      })
  }

  const handleToggleAartiStatus = (aarti: AartiTiming) => {
    const nextStatus = aarti.status === "active" ? "inactive" : "active"
    adminApi.actionAartiTiming({
      action: "upsert",
      ...aarti,
      status: nextStatus
    })
      .then(() => {
        triggerToast(`Aarti status toggled to ${nextStatus}!`)
        loadData()
      })
      .catch((err) => {
        triggerToast("Failed to toggle status: " + err.message, true)
      })
  }

  const handleReorderAarti = (aarti: AartiTiming, direction: "up" | "down") => {
    const currentIndex = aartis.findIndex(a => a.id === aarti.id)
    if (currentIndex === -1) return
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= aartis.length) return

    const targetAarti = aartis[targetIndex]
    const currentOrder = aarti.display_order
    const targetOrder = targetAarti.display_order

    // Swap orders
    Promise.all([
      adminApi.actionAartiTiming({ action: "upsert", ...aarti, display_order: targetOrder }),
      adminApi.actionAartiTiming({ action: "upsert", ...targetAarti, display_order: currentOrder })
    ])
      .then(() => {
        triggerToast("Aarti order updated successfully!")
        loadData()
      })
      .catch((err) => {
        triggerToast("Failed to reorder: " + err.message, true)
      })
  }

  // Guidelines CRUD
  const handleSaveGuideline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGuideline) return

    adminApi.actionDevoteeGuideline({
      action: "upsert",
      ...editingGuideline
    })
      .then(() => {
        triggerToast("Devotee guideline saved successfully!")
        setEditingGuideline(null)
        loadData()
      })
      .catch((err) => {
        triggerToast("Failed to save guideline: " + err.message, true)
      })
  }

  const handleDeleteGuideline = (id: string) => {
    if (!confirm("Are you sure you want to delete this devotee guideline?")) return
    adminApi.actionDevoteeGuideline({ action: "delete", id })
      .then(() => {
        triggerToast("Devotee guideline deleted successfully!")
        loadData()
      })
      .catch((err) => {
        triggerToast("Failed to delete guideline: " + err.message, true)
      })
  }

  const handleToggleGuidelineStatus = (guide: DevoteeGuideline) => {
    const nextStatus = guide.status === "published" ? "unpublished" : "published"
    adminApi.actionDevoteeGuideline({
      action: "upsert",
      ...guide,
      status: nextStatus
    })
      .then(() => {
        triggerToast(`Guideline status toggled to ${nextStatus}!`)
        loadData()
      })
      .catch((err) => {
        triggerToast("Failed to toggle status: " + err.message, true)
      })
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Icon name="BookOpen" className="size-6 text-[#FF8C00]" /> Temple Information CMS
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure Aarti timings schedules, Devotee guidelines, and track change audit logs.
          </p>
        </div>
        <button
          onClick={() => navigate("command-center")}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold transition hover:bg-secondary self-start md:self-auto active:scale-95"
        >
          <Icon name="ArrowLeft" className="size-4" /> Back to CommandCenter
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Active Aartis" value={aartis.filter(a => a.status === "active").length.toString()} icon="Flame" trend="live" />
        <MetricCard label="Published Guidelines" value={guidelines.filter(g => g.status === "published").length.toString()} icon="FileText" trend="live" />
        <MetricCard label="CMS Audit Log Logs" value={history.length.toString()} icon="History" />
        <MetricCard label="Last Edited By" value={history[0]?.updated_by || activeUser} icon="User" />
      </div>

      {/* Toast Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 border border-green-200 p-4 text-xs font-semibold text-green-700">
          <Icon name="CheckCircle" className="size-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
          <Icon name="AlertCircle" className="size-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Tabs selectors */}
      <div className="flex border-b border-border -mx-1 overflow-x-auto no-scrollbar">
        {[
          { id: "aarti", title: "Aarti Timings CMS", icon: "Flame" },
          { id: "guidelines", title: "Devotee Guidelines", icon: "BookOpen" },
          { id: "history", title: "Change History Log", icon: "History" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id as any)
              setEditingAarti(null)
              setEditingGuideline(null)
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 -mb-px shrink-0 ${
              tab === t.id ? "border-[#FF8C00] text-[#FF8C00]" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={t.icon} className="size-4" /> {t.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-[#FF8C00] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* TAB 1: AARTI TIMINGS */}
          {tab === "aarti" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm font-bold">Aarti Timing Records ({aartis.length})</h3>
                <button
                  onClick={() => setEditingAarti({ id: "", name: "", name_hi: "", start_time: "", end_time: "", description: "", description_hi: "", status: "active", display_order: aartis.length + 1 })}
                  className="flex items-center gap-1 text-xs font-bold bg-[#FF8C00]/10 text-[#FF8C00] hover:bg-[#FF8C00]/25 px-3 py-1.5 rounded-xl transition"
                >
                  <Icon name="Plus" className="size-3.5" /> Add Aarti
                </button>
              </div>

              {editingAarti && (
                <form onSubmit={handleSaveAarti} className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4">
                  <AdminSectionTitle title={editingAarti.id ? "Edit Aarti Schedule" : "New Aarti Schedule"} icon="Edit" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Aarti Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={editingAarti.name}
                        onChange={(e) => setEditingAarti({ ...editingAarti, name: e.target.value })}
                        placeholder="e.g. Mangla Aarti"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Aarti Name (Hindi)</label>
                      <input
                        type="text"
                        value={editingAarti.name_hi || ""}
                        onChange={(e) => setEditingAarti({ ...editingAarti, name_hi: e.target.value })}
                        placeholder="मंगला आरती"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Start Time *</label>
                      <input
                        type="text"
                        required
                        value={editingAarti.start_time}
                        onChange={(e) => setEditingAarti({ ...editingAarti, start_time: e.target.value })}
                        placeholder="e.g. 4:30 AM"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">End Time (Optional)</label>
                      <input
                        type="text"
                        value={editingAarti.end_time || ""}
                        onChange={(e) => setEditingAarti({ ...editingAarti, end_time: e.target.value })}
                        placeholder="e.g. 5:15 AM"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Display Order *</label>
                      <input
                        type="number"
                        required
                        value={editingAarti.display_order}
                        onChange={(e) => setEditingAarti({ ...editingAarti, display_order: parseInt(e.target.value) || 1 })}
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Description (English)</label>
                      <textarea
                        rows={2}
                        value={editingAarti.description || ""}
                        onChange={(e) => setEditingAarti({ ...editingAarti, description: e.target.value })}
                        placeholder="Aarti detail summary..."
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Description (Hindi)</label>
                      <textarea
                        rows={2}
                        value={editingAarti.description_hi || ""}
                        onChange={(e) => setEditingAarti({ ...editingAarti, description_hi: e.target.value })}
                        placeholder="आरती का विवरण..."
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingAarti(null)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF8C00] text-white shadow hover:opacity-95"
                    >
                      Save Aarti Schedule
                    </button>
                  </div>
                </form>
              )}

              {/* Aarti List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aartis.map((a, idx) => (
                  <div key={a.id} className={`bg-card border rounded-3xl p-5 shadow-sm flex items-start justify-between gap-3 ${a.status === "inactive" ? "opacity-60 border-dashed" : "border-border"}`}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-xl bg-orange-50 text-[#FF8C00]">
                          <Icon name="Flame" className="size-4" />
                        </span>
                        <div>
                          <p className="font-heading text-sm font-bold text-foreground">{a.name}</p>
                          {a.name_hi && (
                            <p className="text-[10px] text-muted-foreground font-hindi">{a.name_hi}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#FF8C00] bg-[#FF8C00]/10 px-2.5 py-0.5 rounded-full">
                          {a.start_time}{a.end_time ? ` - ${a.end_time}` : ""}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                          Order: {a.display_order}
                        </span>
                      </div>
                      {(a.description || a.description_hi) && (
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {a.description || a.description_hi}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {/* Active switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleAartiStatus(a)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition active:scale-95 ${
                          a.status === "active" ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-300 text-slate-500"
                        }`}
                      >
                        {a.status === "active" ? "ENABLED" : "DISABLED"}
                      </button>

                      {/* Reorder controls */}
                      <div className="flex gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleReorderAarti(a, "up")}
                          className="p-1 rounded-lg border border-border hover:bg-secondary text-muted-foreground disabled:opacity-30"
                        >
                          <Icon name="ChevronUp" className="size-3" />
                        </button>
                        <button
                          disabled={idx === aartis.length - 1}
                          onClick={() => handleReorderAarti(a, "down")}
                          className="p-1 rounded-lg border border-border hover:bg-secondary text-muted-foreground disabled:opacity-30"
                        >
                          <Icon name="ChevronDown" className="size-3" />
                        </button>
                      </div>

                      {/* Edit Delete actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingAarti(a)}
                          className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground"
                        >
                          <Icon name="Edit" className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAarti(a.id)}
                          className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-muted-foreground hover:text-red-600"
                        >
                          <Icon name="Trash2" className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {aartis.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-8 md:col-span-2">No Aarti timings configured in database.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DEVOTEE GUIDELINES */}
          {tab === "guidelines" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm font-bold">Pilgrim Devotee Guidelines ({guidelines.length})</h3>
                <button
                  onClick={() => setEditingGuideline({ id: "", title: "", title_hi: "", content: "", content_hi: "", status: "published", display_order: guidelines.length + 1 })}
                  className="flex items-center gap-1 text-xs font-bold bg-[#FF8C00]/10 text-[#FF8C00] hover:bg-[#FF8C00]/25 px-3 py-1.5 rounded-xl transition"
                >
                  <Icon name="Plus" className="size-3.5" /> Add Guideline
                </button>
              </div>

              {editingGuideline && (
                <form onSubmit={handleSaveGuideline} className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4">
                  <AdminSectionTitle title={editingGuideline.id ? "Edit Guideline" : "New Guideline"} icon="Edit" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Guideline Title (English) *</label>
                      <input
                        type="text"
                        required
                        value={editingGuideline.title}
                        onChange={(e) => setEditingGuideline({ ...editingGuideline, title: e.target.value })}
                        placeholder="e.g. No Photography Policy"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Guideline Title (Hindi)</label>
                      <input
                        type="text"
                        value={editingGuideline.title_hi || ""}
                        onChange={(e) => setEditingGuideline({ ...editingGuideline, title_hi: e.target.value })}
                        placeholder="फोटोग्राफी निषेध"
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Content (English) *</label>
                      <textarea
                        required
                        rows={3}
                        value={editingGuideline.content}
                        onChange={(e) => setEditingGuideline({ ...editingGuideline, content: e.target.value })}
                        placeholder="Detailed guideline instructions..."
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Content (Hindi)</label>
                      <textarea
                        rows={3}
                        value={editingGuideline.content_hi || ""}
                        onChange={(e) => setEditingGuideline({ ...editingGuideline, content_hi: e.target.value })}
                        placeholder="विस्तृत दिशानिर्देश..."
                        className="w-full text-xs p-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Display Order *</label>
                      <input
                        type="number"
                        required
                        value={editingGuideline.display_order}
                        onChange={(e) => setEditingGuideline({ ...editingGuideline, display_order: parseInt(e.target.value) || 1 })}
                        className="text-xs p-2.5 rounded-xl border border-border bg-background w-32"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingGuideline.status === "published"}
                          onChange={(e) => setEditingGuideline({ ...editingGuideline, status: e.target.checked ? "published" : "unpublished" })}
                        />
                        Publish instantly to devotee app
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingGuideline(null)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF8C00] text-white shadow hover:opacity-95"
                    >
                      Save Guideline
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {guidelines.map((g) => (
                  <div key={g.id} className={`bg-card border rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 ${g.status === "unpublished" ? "opacity-60 border-dashed" : "border-border"}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-sm font-bold text-foreground">{g.title}</p>
                        {g.title_hi && (
                          <span className="text-[10px] font-hindi text-muted-foreground">({g.title_hi})</span>
                        )}
                        <span className="text-[9px] font-semibold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                          Order {g.display_order}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{g.content}</p>
                      {g.content_hi && (
                        <p className="text-xs text-muted-foreground/80 leading-relaxed font-hindi border-t border-border/40 pt-1 mt-1.5">{g.content_hi}</p>
                      )}
                    </div>

                    <div className="flex gap-2 items-center shrink-0">
                      <button
                        onClick={() => handleToggleGuidelineStatus(g)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition active:scale-95 ${
                          g.status === "published" ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-300 text-slate-500"
                        }`}
                      >
                        {g.status === "published" ? "PUBLISHED" : "UNPUBLISHED"}
                      </button>
                      <button
                        onClick={() => setEditingGuideline(g)}
                        className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground"
                      >
                        <Icon name="Edit" className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGuideline(g.id)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-muted-foreground hover:text-red-600"
                      >
                        <Icon name="Trash2" className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {guidelines.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-8">No guidelines configured in database.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHANGE HISTORY LOG */}
          {tab === "history" && (
            <div className="space-y-4">
              <h3 className="font-heading text-sm font-bold">CMS Audit & Change History Logs</h3>
              <div className="relative border-l border-border pl-5 space-y-5 ml-2.5 pt-2">
                {history.map((log) => {
                  const date = new Date(log.updated_time).toLocaleString("en-IN")
                  let summary = ""
                  if (log.action_type === "create") {
                    summary = `Created new ${log.module_type === "aarti" ? "Aarti timing" : "devotee guideline"}: "${log.current_value?.name || log.current_value?.title || "N/A"}"`
                  } else if (log.action_type === "update") {
                    summary = `Updated ${log.module_type === "aarti" ? "Aarti timing" : "devotee guideline"}: "${log.current_value?.name || log.current_value?.title || "N/A"}"`
                  } else {
                    summary = `Deleted ${log.module_type === "aarti" ? "Aarti timing" : "devotee guideline"}`
                  }

                  return (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[26px] top-1.5 grid size-3 place-items-center rounded-full bg-[#FF8C00] ring-4 ring-orange-50 border border-white" />
                      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground gap-2">
                          <span className="flex items-center gap-1 text-foreground">
                            <Icon name="User" className="size-3.5" /> {log.updated_by}
                          </span>
                          <span>{date}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">{summary}</p>
                        
                        {/* Diff Viewer (Simplified) */}
                        {log.action_type === "update" && log.previous_value && log.current_value && (
                          <div className="text-[10px] font-mono bg-muted/40 p-2.5 rounded-xl border border-border/50 divide-y divide-border/30">
                            {Object.keys(log.current_value).map((key) => {
                              if (["updated_at", "created_at"].includes(key)) return null
                              const prev = log.previous_value[key]
                              const curr = log.current_value[key]
                              if (prev !== curr) {
                                return (
                                  <div key={key} className="py-1 first:pt-0 last:pb-0 flex flex-wrap gap-2 justify-between">
                                    <span className="font-bold text-foreground">{key}:</span>
                                    <span className="text-red-600 line-through">"{String(prev)}"</span>
                                    <span className="text-muted-foreground">&rarr;</span>
                                    <span className="text-green-600 font-bold">"{String(curr)}"</span>
                                  </div>
                                )
                              }
                              return null
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {history.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-8">No change history logs available.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
