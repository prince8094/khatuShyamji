import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, ActivityItem } from "@/components/admin/admin-shared"
import { devoteeApi, adminApi } from "@/lib/api-client"
import { type AdminScreenKey, type AdminUser } from "@/lib/admin-data"

type TempleContentState = {
  id: string
  title: string
  status: "published" | "draft" | "archived" | "pending-review"
  lastUpdated: string
  updatedBy: string
  icon: string
  content: string
}

type AartiTimingState = {
  id: string
  name: string
  time: string
  isEditing: boolean
}

const initialTempleContent: TempleContentState[] = [
  { id: "TC-01", title: "Darshan Timings", status: "published", lastUpdated: "Today, 10:15 AM", updatedBy: "Rajesh K.", icon: "Clock", content: "Morning: 4:30 AM – 12:30 PM | Evening: 4:00 PM – 9:00 PM" },
  { id: "TC-02", title: "Aarti Schedule", status: "published", lastUpdated: "Today, 10:15 AM", updatedBy: "Rajesh K.", icon: "Flame", content: "Mangla 4:30 AM, Shringaar 7:00 AM, Bhog 12:30 PM, Sandhya 7:30 PM" },
  { id: "TC-03", title: "Temple Guidelines", status: "published", lastUpdated: "Yesterday, 03:00 PM", updatedBy: "Rajesh K.", icon: "BookOpen", content: "No photography inside sanctum. Mobile phones on silent. Dress modestly." },
  { id: "TC-04", title: "Monsoon Special Timings", status: "pending-review", lastUpdated: "Today, 09:00 AM", updatedBy: "Rajesh K.", icon: "CloudRain", content: "Updated morning aarti to 5:00 AM due to sunrise change" },
  { id: "TC-05", title: "Festival Calendar", status: "published", lastUpdated: "27 Jun, 11:00 AM", updatedBy: "Rajesh K.", icon: "Calendar", content: "Ekadashi: 30 Jun | Purnima: 10 Jul | Janmashtami: 26 Aug" },
]

const initialAartiTimings: AartiTimingState[] = [
  { id: "AT-1", name: "Mangla Aarti", time: "4:30 AM", isEditing: false },
  { id: "AT-2", name: "Shringaar", time: "7:00 AM", isEditing: false },
  { id: "AT-3", name: "Bhog Aarti", time: "12:30 PM", isEditing: false },
  { id: "AT-4", name: "Sandhya Aarti", time: "7:30 PM", isEditing: false },
]

export function TempleInfoAdminScreen({
  navigate,
  currentAdmin,
}: {
  navigate: (s: AdminScreenKey) => void
  currentAdmin?: AdminUser
}) {
  const activeUser = currentAdmin?.name || "Rajesh Kumar"
  const isSuperAdmin = currentAdmin?.roles.includes("super-admin") || false
  const isTrusted = isSuperAdmin || currentAdmin?.roles.includes("temple-info")

  const [tab, setTab] = useState<"content" | "timings">("content")
  const [contentList, setContentList] = useState<TempleContentState[]>(initialTempleContent)
  const [aartiTimings, setAartiTimings] = useState<AartiTimingState[]>(initialAartiTimings)
  const [activityLogs, setActivityLogs] = useState<any[]>([
    { id: "L-1", time: "10:15 AM", action: "Temple guidelines updated — Dress modesty code", actor: "Rajesh K." },
    { id: "L-2", time: "09:00 AM", action: "Submitted Monsoon Timings draft for approval", actor: "Rajesh K." },
  ])

  useEffect(() => {
    devoteeApi.getTempleInfo()
      .then((res: any) => {
        if (Array.isArray(res)) {
          // 1. Timings
          const timingsRecord = res.find(r => r.section_key === "darshan_timings")
          if (timingsRecord && Array.isArray(timingsRecord.content)) {
            setAartiTimings(timingsRecord.content.map((t: any, i: number) => ({
              id: t.id || `AT-${i + 1}`,
              name: t.name,
              time: t.time,
              isEditing: false
            })))
          }

          // 2. Guides
          setContentList((prev: TempleContentState[]) => prev.map((c: TempleContentState) => {
            let key = ""
            if (c.id === "TC-01" || c.title.includes("Darshan Timings")) key = "darshan_timings"
            else if (c.id === "TC-03" || c.title.includes("Guidelines")) key = "temple_guidelines"

            if (key) {
              const rec = res.find(r => r.section_key === key)
              if (rec) {
                let text = ""
                if (Array.isArray(rec.content)) {
                  if (key === "darshan_timings") {
                    text = rec.content.map((t: any) => `${t.name}: ${t.time}`).join(" | ")
                  } else {
                    text = rec.content.join(" ")
                  }
                } else if (typeof rec.content === "string") {
                  text = rec.content
                }
                return {
                  ...c,
                  content: text,
                  lastUpdated: new Date(rec.updated_at).toLocaleTimeString()
                }
              }
            }
            return c
          }))
        }
      })
      .catch((err) => console.error("Error loading temple info in admin", err))
  }, [])

  // Modals state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingContent, setEditingContent] = useState("")
  const [scheduleDate, setScheduleDate] = useState("")
  const [showScheduleInput, setShowScheduleInput] = useState(false)

  // Timing inputs
  const [tempTimes, setTempTimes] = useState<Record<string, string>>({})

  // Stats
  const published = contentList.filter((c: TempleContentState) => c.status === "published").length
  const pendingReview = contentList.filter((c: TempleContentState) => c.status === "pending-review").length

  const handleEditClick = (item: TempleContentState) => {
    setEditingItemId(item.id)
    setEditingTitle(item.title)
    setEditingContent(item.content)
    setShowScheduleInput(false)
    setScheduleDate("")
  }

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItemId) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })

    if (isTrusted && !showScheduleInput) {
      // Direct update
      setContentList(prev =>
        prev.map(c => (c.id === editingItemId ? { ...c, title: editingTitle, content: editingContent, status: "published", lastUpdated: "Just now", updatedBy: activeUser } : c))
      )
      setActivityLogs(prev => [
        { id: `L-${Date.now()}`, time: timeStr, action: `Directly published changes to: ${editingTitle}`, actor: activeUser },
        ...prev,
      ])

      let key = ""
      let title = ""
      if (editingItemId === "TC-01" || editingTitle.includes("Darshan Timings")) {
        key = "darshan_timings"
        title = "Darshan Timings"
      } else if (editingItemId === "TC-03" || editingTitle.includes("Guidelines")) {
        key = "temple_guidelines"
        title = "Temple Guidelines"
      }

      if (key) {
        let contentVal: any = editingContent
        if (key === "temple_guidelines") {
          contentVal = editingContent.split(/[.\n]/).map(s => s.trim()).filter(Boolean)
        } else if (key === "darshan_timings") {
          contentVal = editingContent.split("|").map(p => {
            const parts = p.split(":")
            return {
              name: parts[0]?.trim() || "Aarti",
              time: parts.slice(1).join(":")?.trim() || "4:30 AM"
            }
          })
        }
        try {
          await adminApi.updateTempleInfo({
            section_key: key,
            title: title,
            content: contentVal
          })
        } catch (err) {
          console.error("Failed to save content to database", err)
        }
      }
    } else {
      // Route to approval queue / pending
      setContentList(prev =>
        prev.map(c => (c.id === editingItemId ? { ...c, title: editingTitle, content: editingContent, status: "pending-review", lastUpdated: "Just now", updatedBy: activeUser } : c))
      )
      setActivityLogs(prev => [
        {
          id: `L-${Date.now()}`,
          time: timeStr,
          action: `Submitted changes for review: ${editingTitle} ${showScheduleInput ? `(Scheduled: ${scheduleDate})` : ""}`,
          actor: activeUser,
        },
        ...prev,
      ])
    }

    setEditingItemId(null)
  }

  const handleArchiveContent = (id: string) => {
    setContentList(prev =>
      prev.map(c => (c.id === id ? { ...c, status: "archived" } : c))
    )
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      { id: `L-${Date.now()}`, time: timeStr, action: `Archived content block: ${id}`, actor: activeUser },
      ...prev,
    ])
  }

  const handlePublishFromReview = (id: string) => {
    if (!isTrusted) return
    setContentList(prev =>
      prev.map(c => (c.id === id ? { ...c, status: "published", lastUpdated: "Just now", updatedBy: activeUser } : c))
    )
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      { id: `L-${Date.now()}`, time: timeStr, action: `Approved & Published: ${id}`, actor: activeUser },
      ...prev,
    ])
  }

  // Aarti Timing edits
  const handleEditTiming = (id: string, currentTime: string) => {
    setAartiTimings(prev => prev.map(t => (t.id === id ? { ...t, isEditing: true } : t)))
    setTempTimes(prev => ({ ...prev, [id]: currentTime }))
  }

  const handleSaveTiming = async (id: string) => {
    const newTime = tempTimes[id]
    if (!newTime) return

    const target = aartiTimings.find(t => t.id === id)
    if (!target) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })

    if (isTrusted) {
      const nextTimings = aartiTimings.map(t => (t.id === id ? { ...t, time: newTime, isEditing: false } : t))
      setAartiTimings(nextTimings)
      setActivityLogs(prev => [
        { id: `L-${Date.now()}`, time: timeStr, action: `Aarti timing direct update: ${target.name} to ${newTime}`, actor: activeUser },
        ...prev,
      ])

      try {
        await adminApi.updateTempleInfo({
          section_key: "darshan_timings",
          title: "Darshan Timings",
          content: nextTimings.map(t => ({ id: t.id, name: t.name, time: t.time }))
        })
      } catch (err) {
        console.error("Failed to save timings to database", err)
      }
    } else {
      setAartiTimings(prev => prev.map(t => (t.id === id ? { ...t, isEditing: false } : t)))
      setActivityLogs(prev => [
        { id: `L-${Date.now()}`, time: timeStr, action: `Submitted timing edit request for: ${target.name} (${newTime})`, actor: activeUser },
        ...prev,
      ])
    }
  }

  const renderEditModal = () => {
    if (!editingItemId) return null
    const item = contentList.find(c => c.id === editingItemId)
    if (!item) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold text-foreground">Edit Temple Content</h3>
            <button onClick={() => setEditingItemId(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>
          <form onSubmit={handleSaveContent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Title</label>
              <input
                type="text"
                required
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-bold focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Guidelines / Schedule Content</label>
              <textarea
                required
                rows={4}
                value={editingContent}
                onChange={e => setEditingContent(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-medium focus:border-[#D4AF37] focus:outline-none resize-none"
              />
            </div>

            <div className="rounded-xl bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showScheduleInput}
                    onChange={() => setShowScheduleInput(!showScheduleInput)}
                    className="size-4 rounded accent-[#D4AF37]"
                  />
                  <span className="text-xs font-bold text-foreground">Schedule Publication for Later</span>
                </label>
              </div>
              {showScheduleInput && (
                <div className="mt-2.5">
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">Release Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-card p-2 text-xs font-bold focus:border-[#D4AF37]"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => handleArchiveContent(item.id)}
                className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-xs font-bold hover:bg-red-100 mr-auto"
              >
                Archive Block
              </button>
              <button
                type="button"
                onClick={() => setEditingItemId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                {isTrusted && !showScheduleInput ? "Publish Live" : "Submit for Approval"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header operations banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#B8960C] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Temple Guidelines Command</h1>
            <p className="text-xs text-white/80 mt-1">Configure active timings & devotee rules lists</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Landmark" className="size-6 text-white" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Total Blocks", value: contentList.length },
            { label: "Active Live", value: published },
            { label: "Pending Reviews", value: pendingReview },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2.5 text-center border border-white/5">
              <p className="text-[10px] text-white/70 uppercase tracking-wide font-semibold">{s.label}</p>
              <p className="font-heading text-lg font-extrabold text-white mt-0.5">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role notice warning banner */}
      {!isTrusted && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 shadow-sm">
          <Icon name="AlertTriangle" className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p className="font-bold">Standard Role Restrictions Active</p>
            <p className="mt-0.5">Your updates to guidelines and timings require verification logs and approval from operations supervisor before rendering in the Pilgrim app.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary/60 p-1.5 gap-1 shadow-inner">
        {(["content", "timings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
              tab === t ? "bg-white text-[#D97706] shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={t === "content" ? "FileText" : "Clock"} className="size-4" />
            {t === "content" ? "Devotee Guidelines & Info" : "Aarti Timings"}
          </button>
        ))}
      </div>

      {/* Main content display blocks */}
      {tab === "content" && (
        <section className="space-y-4">
          <AdminSectionTitle title="Guidelines & Schedules Catalog" icon="FileText" />
          <div className="space-y-3">
            {contentList.map((item: TempleContentState) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600 shadow-sm">
                      <Icon name={item.icon} className="size-5" />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span>Updated: {item.lastUpdated}</span>
                        <span className="size-1 rounded-full bg-muted-foreground/30" />
                        <span>By: {item.updatedBy}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                    item.status === "published" ? "bg-green-50 text-green-700 border-green-200" :
                    item.status === "pending-review" ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" :
                    "bg-muted text-muted-foreground border-border"
                  }`}>
                    <span className={`size-1 rounded-full ${
                      item.status === "published" ? "bg-green-500" :
                      item.status === "pending-review" ? "bg-amber-500" : "bg-muted-foreground"
                    }`} />
                    {item.status.replace("-", " ")}
                  </span>
                </div>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed rounded-xl bg-muted/40 px-3 py-2 border border-border/40">
                  {item.content}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground hover:bg-muted/40 transition hover:shadow-sm"
                  >
                    <Icon name="Settings" className="size-3.5 text-muted-foreground" /> View & Edit
                  </button>

                  {item.status === "pending-review" && isTrusted && (
                    <button
                      onClick={() => handlePublishFromReview(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 py-2 text-xs font-bold text-white shadow-sm transition active:scale-[0.98]"
                    >
                      <Icon name="CheckCircle" className="size-3.5" /> Approve & Publish
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Aarti Timings checklist */}
      {tab === "timings" && (
        <section className="space-y-4">
          <AdminSectionTitle title="Aarti Timings Scheduler" icon="Flame" />
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
            {aartiTimings.map((aarti: AartiTimingState) => (
              <div key={aarti.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/10 transition">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <Icon name="Flame" className="size-4" />
                  </span>
                  <p className="font-heading text-sm font-bold text-foreground">{aarti.name}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  {aarti.isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tempTimes[aarti.id] || ""}
                        onChange={e => setTempTimes({ ...tempTimes, [aarti.id]: e.target.value })}
                        className="rounded-lg border border-border bg-card p-1 text-center font-bold text-xs text-[#D97706] w-24"
                      />
                      <button
                        onClick={() => handleSaveTiming(aarti.id)}
                        className="grid size-8 place-items-center rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
                      >
                        <Icon name="Check" className="size-4" />
                      </button>
                      <button
                        onClick={() => setAartiTimings((prev: AartiTimingState[]) => prev.map((t: AartiTimingState) => (t.id === aarti.id ? { ...t, isEditing: false } : t)))}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50"
                      >
                        <Icon name="X" className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-heading text-sm font-bold text-[#D97706]">{aarti.time}</span>
                      <button
                        onClick={() => handleEditTiming(aarti.id, aarti.time)}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                      >
                        <Icon name="Pencil" className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History Log */}
      <section>
        <AdminSectionTitle title="Information Change Log" icon="History" />
        <div className="rounded-2xl border border-border bg-card px-4 py-2 shadow-sm">
          {activityLogs.map((log: any) => (
            <ActivityItem
              key={log.id}
              time={log.time}
              action={log.action}
              department="temple-info"
              actor={log.actor}
              icon="Landmark"
            />
          ))}
        </div>
      </section>

      {/* Edit content modal portal */}
      {renderEditModal()}
    </div>
  )
}
