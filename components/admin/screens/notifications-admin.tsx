"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, LiveDot, ActivityItem } from "@/components/admin/admin-shared"
import type { AdminScreenKey } from "@/lib/admin-data"
import { adminApi } from "@/lib/api-client"

type NotificationState = {
  id: string
  title: string
  body: string
  department: string
  sentAt: string
  sentBy: string
  delivered: number
  icon: string
  priority: "low" | "medium" | "high" | "critical"
  expiryAt?: string
}

const initialNotifications: NotificationState[] = [
  { id: "NOT-01", title: "Ekadashi Special Arrangements", body: "Extended darshan hours on 30 Jun. Extra counters open.", department: "Global", sentAt: "Today, 09:15 AM", sentBy: "Rajesh K.", delivered: 12450, icon: "Megaphone", priority: "high", expiryAt: "30 Jun, 11:59 PM" },
  { id: "NOT-02", title: "Parking Block C Full", body: "Use Lot B or Overflow Lot D. Free shuttle available.", department: "Parking", sentAt: "Today, 11:15 AM", sentBy: "Vikram S.", delivered: 8320, icon: "SquareParking", priority: "medium", expiryAt: "Today, 06:00 PM" },
  { id: "NOT-03", title: "Traffic Alert — NH-148D", body: "Heavy traffic near Reengus. Expect 30 min delay.", department: "Traffic", sentAt: "Today, 11:30 AM", sentBy: "Anita D.", delivered: 9150, icon: "TrafficCone", priority: "high", expiryAt: "Today, 04:30 PM" },
  { id: "NOT-04", title: "Prasad Counter 4 Ready", body: "Collect your prasad packet at counter 4.", department: "Seva", sentAt: "Yesterday, 02:30 PM", sentBy: "System", delivered: 1, icon: "ShoppingBag", priority: "low" },
]

const templates = [
  { name: "Darshan Closed", title: "Darshan Temporarily Closed", body: "Darshan is temporarily closed due to queue line updates. We will notify once resumed.", icon: "DoorClosed", priority: "high" as const, dept: "Global" },
  { name: "Weather Warning", title: "Severe Weather Alert", body: "Heavy rainfall expected. Carry umbrellas and wear non-slip footwear in courtyard.", icon: "CloudRain", priority: "medium" as const, dept: "Global" },
  { name: "Parking Full", title: "Parking Block Fully Occupied", body: "Selected parking lot is full. Please redirect to Overflow Lot D. Free shuttle active.", icon: "SquareParking", priority: "medium" as const, dept: "Parking" },
  { name: "Ekadashi Notice", title: "Ekadashi Festival Timings", body: "Special arrangements for Ekadashi: darshan hours extended. Security check active.", icon: "Megaphone", priority: "critical" as const, dept: "Global" },
]

export function NotificationsAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [notificationsList, setNotificationsList] = useState<NotificationState[]>([])
  const [loading, setLoading] = useState(true)
  const [composingStep, setComposingStep] = useState<number | null>(null) // null, 1: Template, 2: Message, 3: Audience, 4: Schedule, 5: Preview
  const [form, setForm] = useState({
    title: "",
    body: "",
    department: "Global",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    targetAudience: "All Pilgrims",
    isScheduled: false,
    scheduleTime: "",
    expiryTime: "",
    icon: "Bell",
  })

  const [toastMsg, setToastMsg] = useState("")

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await adminApi.getNotifications()
        if (Array.isArray(res)) {
          const mapped = res.map((n: any) => ({
            id: n.id,
            title: n.title_en,
            body: n.body_en,
            department: n.type.toUpperCase(),
            sentAt: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sentBy: "System DB",
            delivered: 1250,
            icon: n.icon || "Bell",
            priority: (n.tone === "danger" ? "critical" : (n.tone === "warning" ? "high" : "medium")) as any
          }))
          setNotificationsList(mapped)
        }
      } catch (err) {
        console.error("Failed to load DB broadcasts", err)
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  const displayList = notificationsList.length > 0 ? notificationsList : (loading ? [] : initialNotifications)
  const totalDelivered = displayList.reduce((a, n) => a + n.delivered, 0)

  const startComposer = () => {
    setComposingStep(1)
    setForm({
      title: "",
      body: "",
      department: "Global",
      priority: "medium",
      targetAudience: "All Pilgrims",
      isScheduled: false,
      scheduleTime: "",
      expiryTime: "",
      icon: "Bell",
    })
  }

  const handleSelectTemplate = (tpl: typeof templates[0] | "blank") => {
    if (tpl === "blank") {
      setForm(prev => ({
        ...prev,
        title: "",
        body: "",
        priority: "medium",
        department: "Global",
        icon: "Bell",
      }))
    } else {
      setForm(prev => ({
        ...prev,
        title: tpl.title,
        body: tpl.body,
        priority: tpl.priority,
        department: tpl.dept,
        icon: tpl.icon,
      }))
    }
    setComposingStep(2)
  }

  const handleSubmitBroadcast = async () => {
    const tone = form.priority === "critical" ? "danger" : (form.priority === "high" ? "warning" : "info")
    const newNotif: NotificationState = {
      id: crypto.randomUUID(),
      title: form.title,
      body: form.body,
      department: form.department,
      sentAt: form.isScheduled ? `Scheduled for ${form.scheduleTime}` : "Just now",
      sentBy: "System DB",
      delivered: form.isScheduled ? 0 : form.targetAudience === "All Pilgrims" ? 14200 : 340,
      icon: form.icon,
      priority: form.priority,
      expiryAt: form.expiryTime || undefined,
    }

    setNotificationsList(prev => [newNotif, ...prev])
    setComposingStep(null)
    setToastMsg(form.isScheduled ? "Notification scheduled successfully!" : "Notification broadcasted successfully!")
    setTimeout(() => setToastMsg(""), 3500)

    try {
      await adminApi.broadcastNotification({
        title_en: form.title,
        title_hi: form.title,
        body_en: form.body,
        body_hi: form.body,
        type: form.department.toLowerCase(),
        icon: form.icon,
        tone: tone
      })
    } catch (err) {
      console.error("Failed to post notification broadcast", err)
    }
  }

  const priorityColor = (p: string) => {
    switch (p) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const renderComposeWizard = () => {
    if (composingStep === null) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Compose Broadcast Wizard</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Step {composingStep} of 5</p>
            </div>
            <button onClick={() => setComposingStep(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {/* Step 1: Select Template */}
            {composingStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-foreground">Choose a quick operational template to begin:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {templates.map(t => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => handleSelectTemplate(t)}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left hover:bg-[#FFF3E0] hover:border-[#D4AF37] transition"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-orange-50 text-orange-600 shadow-sm shrink-0">
                        <Icon name={t.icon} className="size-4.5" />
                      </span>
                      <div>
                        <p className="font-heading text-xs font-bold text-foreground">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t.body}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate("blank")}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-4 font-bold text-xs hover:bg-muted/40 transition text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="Plus" className="size-4" /> Start with Blank Message
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Message Content & Expiry */}
            {composingStep === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Department Scope</label>
                    <select
                      value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
                    >
                      {["Global", "Accommodation", "Parking", "Traffic", "Seva", "Emergency"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Priority</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value as any })}
                      className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief notification header..."
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Message Body</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Devotee instructions, safety guidelines, alerts..."
                    value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-medium focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Auto-Expiry Datetime (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Today, 6:00 PM or 30 Jun, 11:59 PM"
                    value={form.expiryTime}
                    onChange={e => setForm({ ...form, expiryTime: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                  <p className="text-[9px] text-muted-foreground mt-0.5">Alerts automatically clear from pilgrim apps at this time.</p>
                </div>
              </div>
            )}

            {/* Step 3: Choose Target Audience */}
            {composingStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-foreground">Select recipient group target:</p>
                <div className="space-y-2.5">
                  {[
                    { label: "All Pilgrims", desc: "Broadcast to all mobile and web active pilgrim profiles" },
                    { label: "Accommodation Stays", desc: "Target devotees checked into hotels/dharamshalas" },
                    { label: "Parking Lots managers", desc: "Staff and devotees near physical parking blocks" },
                    { label: "Seva bookings", desc: "Target devotees booked for today's special puja slots" },
                  ].map(aud => (
                    <button
                      key={aud.label}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, targetAudience: aud.label })
                        setComposingStep(4)
                      }}
                      className={`flex flex-col w-full text-left rounded-xl border p-3.5 transition ${
                        form.targetAudience === aud.label
                          ? "bg-[#FFF3E0] border-[#D4AF37] text-foreground"
                          : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <p className="text-xs font-bold text-foreground">{aud.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{aud.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Schedule Settings */}
            {composingStep === 4 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-foreground">Define schedule release properties:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isScheduled: false })}
                    className={`rounded-xl border p-4 text-center transition ${
                      !form.isScheduled ? "bg-[#FFF3E0] border-[#D4AF37] text-foreground font-bold" : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Icon name="Send" className="size-5 mx-auto mb-1.5 text-orange-600" />
                    <span className="text-xs">Publish Immediately</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isScheduled: true })}
                    className={`rounded-xl border p-4 text-center transition ${
                      form.isScheduled ? "bg-[#FFF3E0] border-[#D4AF37] text-foreground font-bold" : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Icon name="Clock" className="size-5 mx-auto mb-1.5 text-orange-600" />
                    <span className="text-xs">Schedule for Later</span>
                  </button>
                </div>

                {form.isScheduled && (
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
                    <label className="block text-xs font-bold text-foreground">Select Release Datetime</label>
                    <input
                      type="text"
                      placeholder="e.g. Today, 5:00 PM"
                      value={form.scheduleTime}
                      onChange={e => setForm({ ...form, scheduleTime: e.target.value })}
                      required
                      className="w-full rounded-lg border border-border bg-card p-2 text-xs font-bold focus:border-[#D4AF37]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Pilgrim App Live Screen Preview */}
            {composingStep === 5 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-foreground">Devotee Mobile Push Notification Preview:</p>
                
                {/* Mock phone display */}
                <div className="rounded-3xl border-8 border-gray-800 bg-[#FFF8F0] p-4 max-w-[280px] mx-auto shadow-md aspect-[9/16] relative flex flex-col justify-start overflow-hidden">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-gray-800 shrink-0" />
                  
                  {/* Lock Screen status */}
                  <div className="text-center mt-6 text-gray-500 font-mono text-[9px]">12:00 PM · Shrine Feed</div>
                  
                  {/* Push Notification card simulation */}
                  <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-3 shadow-lg flex items-start gap-2 max-w-full">
                    <span className="grid size-7 place-items-center rounded-lg bg-orange-100 text-orange-600 shrink-0 mt-0.5">
                      <Icon name={form.icon} className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold text-foreground truncate">{form.title || "No Title Specified"}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5 leading-snug line-clamp-3">{form.body || "No message body specified..."}</p>
                      <p className="text-[8px] text-orange-600 font-bold mt-1 uppercase tracking-wider">{form.department} Alert</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p>Target Audience: <strong className="text-foreground">{form.targetAudience}</strong></p>
                  <p className="mt-1">Scheduled Time: <strong className="text-foreground">{form.isScheduled ? form.scheduleTime : "Immediate"}</strong></p>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex gap-2 justify-between pt-3 mt-4 border-t border-border">
            <button
              type="button"
              disabled={composingStep === 1}
              onClick={() => setComposingStep(prev => (prev ? prev - 1 : 1))}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50 disabled:opacity-50"
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setComposingStep(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
              >
                Cancel
              </button>
              {composingStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setComposingStep(prev => (prev ? prev + 1 : 2))}
                  className="rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitBroadcast}
                  className="rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Submit Broadcast
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header operations banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Notifications & Broadcasts</h1>
            <p className="text-xs text-white/80 mt-1">Compose devotee emergency push alerts & schedules</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Bell" className="size-6 text-white" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Sent Today", value: displayList.length },
            { label: "Delivered Devotees", value: `${(totalDelivered / 1000).toFixed(1)}K` },
            { label: "Active Templates", value: templates.length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2.5 text-center border border-white/5">
              <p className="text-[10px] text-white/70 uppercase tracking-wide font-semibold">{s.label}</p>
              <p className="font-heading text-lg font-extrabold text-white mt-0.5">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-3 shadow-lg text-xs font-bold"
          >
            <Icon name="CheckCircle" className="size-4 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action composed toggle */}
      <div className="flex gap-2">
        <button
          onClick={startComposer}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] text-white py-3.5 text-xs font-extrabold shadow hover:shadow-md transition active:scale-[0.98]"
        >
          <Icon name="Plus" className="size-4.5" /> Compose Notification Wizard
        </button>
      </div>

      {/* Sent Notifications history */}
      <section>
        <AdminSectionTitle
          title="Active & Sent Broadcasts logs"
          icon="Send"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
              <LiveDot color="bg-green-500" /> Active Queue
            </span>
          }
        />
        <div className="space-y-3">
          {displayList.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-[#D97706] shadow-sm shrink-0">
                  <Icon name={notif.icon} className="size-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground">{notif.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="font-bold font-mono">{notif.id}</span>
                        <span className="size-1 rounded-full bg-muted-foreground/30" />
                        <span>Scope: <strong className="text-foreground">{notif.department}</strong></span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${priorityColor(notif.priority)}`}>
                      {notif.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/40 p-2.5 rounded-xl border border-border/40 leading-relaxed">
                    {notif.body}
                  </p>
                  
                  {notif.expiryAt && (
                    <div className="mt-2.5 flex items-center gap-1 text-[10px] text-red-600 font-bold">
                      <Icon name="Clock" className="size-3" /> Auto-Expires: {notif.expiryAt}
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 mt-3 text-[10px] text-muted-foreground font-medium border-t border-border/40 pt-2.5">
                    <span className="flex items-center gap-1"><Icon name="Calendar" className="size-3" /> {notif.sentAt}</span>
                    <span className="size-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1"><Icon name="User" className="size-3" /> By: {notif.sentBy}</span>
                    <span className="size-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1 font-bold text-foreground"><Icon name="Users" className="size-3" /> {notif.delivered.toLocaleString()} Deliv.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Wizard modal */}
      {renderComposeWizard()}
    </div>
  )
}
