"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, QuickAction, ApprovalBadge, ActivityItem } from "@/components/admin/admin-shared"
import type { AdminScreenKey } from "@/lib/admin-data"

const templeContent = [
  { id: "TC-01", title: "Darshan Timings", status: "published" as const, lastUpdated: "29 Jun, 10:15 AM", updatedBy: "Rajesh K.", icon: "Clock", content: "Morning: 4:30 AM – 12:30 PM | Evening: 4:00 PM – 9:00 PM" },
  { id: "TC-02", title: "Aarti Schedule", status: "published" as const, lastUpdated: "29 Jun, 10:15 AM", updatedBy: "Rajesh K.", icon: "Flame", content: "Mangla 4:30 AM, Shringaar 7:00 AM, Bhog 12:30 PM, Sandhya 7:30 PM" },
  { id: "TC-03", title: "Temple Guidelines", status: "published" as const, lastUpdated: "28 Jun, 03:00 PM", updatedBy: "Rajesh K.", icon: "BookOpen", content: "No photography inside sanctum. Mobile phones on silent. Dress modestly." },
  { id: "TC-04", title: "Monsoon Special Timings", status: "draft" as const, lastUpdated: "29 Jun, 09:00 AM", updatedBy: "Rajesh K.", icon: "CloudRain", content: "Updated morning aarti to 5:00 AM due to sunrise change" },
  { id: "TC-05", title: "Festival Calendar", status: "published" as const, lastUpdated: "27 Jun, 11:00 AM", updatedBy: "Rajesh K.", icon: "Calendar", content: "Ekadashi: 30 Jun | Purnima: 10 Jul | Janmashtami: 26 Aug" },
]

const aartiTimingsEditable = [
  { id: "AT-1", name: "Mangla Aarti", time: "4:30 AM", isEditing: false },
  { id: "AT-2", name: "Shringaar", time: "7:00 AM", isEditing: false },
  { id: "AT-3", name: "Bhog Aarti", time: "12:30 PM", isEditing: false },
  { id: "AT-4", name: "Sandhya Aarti", time: "7:30 PM", isEditing: false },
]

export function TempleInfoAdminScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [tab, setTab] = useState<"content" | "timings">("content")
  const published = templeContent.filter((c) => c.status === "published").length
  const drafts = templeContent.filter((c) => c.status === "draft").length

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#B8960C] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Temple Information</h1>
            <p className="text-sm text-white/80 mt-1">Content, timings & guidelines management</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Landmark" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Content Items", value: templeContent.length },
            { label: "Published", value: published },
            { label: "Drafts", value: drafts },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary/60 p-1.5 gap-1">
        {(["content", "timings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
              tab === t ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={t === "content" ? "FileText" : "Clock"} className="size-4" />
            {t === "content" ? "Content" : "Timings"}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <AdminSectionTitle title="Quick Actions" icon="Zap" />
        <div className="grid grid-cols-3 gap-2">
          <QuickAction icon="Plus" label="New Content" />
          <QuickAction icon="Image" label="Add Media" />
          <QuickAction icon="Send" label="Submit Review" />
        </div>
      </section>

      {/* Content Cards */}
      {tab === "content" && (
        <section>
          <AdminSectionTitle title="Managed Content" icon="FileText" />
          <div className="space-y-3">
            {templeContent.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{item.lastUpdated}</span>
                        <span className="size-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-[10px] text-muted-foreground">{item.updatedBy}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    item.status === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    <span className={`size-1.5 rounded-full ${item.status === "published" ? "bg-green-500" : "bg-amber-500"}`} />
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed rounded-xl bg-muted/30 px-3 py-2">
                  {item.content}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 py-2 text-[11px] font-bold text-foreground transition hover:bg-muted/50">
                    <Icon name="Pencil" className="size-3.5" /> Edit
                  </button>
                  <button className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold text-white transition ${
                    item.status === "draft" ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"
                  }`}>
                    <Icon name={item.status === "draft" ? "Upload" : "EyeOff"} className="size-3.5" />
                    {item.status === "draft" ? "Publish" : "Unpublish"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Aarti Timings Editor */}
      {tab === "timings" && (
        <section>
          <AdminSectionTitle title="Aarti Timings" icon="Flame" />
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {aartiTimingsEditable.map((aarti, i) => (
              <div key={aarti.id} className={`flex items-center justify-between px-4 py-3.5 ${i < aartiTimingsEditable.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <Icon name="Flame" className="size-4" />
                  </span>
                  <p className="font-heading text-sm font-bold text-foreground">{aarti.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-[#D97706]">{aarti.time}</span>
                  <button className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition">
                    <Icon name="Pencil" className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]">
            <Icon name="Save" className="size-4" />
            Save Changes
          </button>
        </section>
      )}

      {/* Recent Activity */}
      <section>
        <AdminSectionTitle title="Recent Activity" icon="Activity" />
        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm">
          <ActivityItem time="10:15 AM" action="Temple timings updated for monsoon season" department="temple-info" actor="Rajesh K." icon="Clock" />
          <ActivityItem time="09:00 AM" action="Monsoon special timings — draft created" department="temple-info" actor="Rajesh K." icon="CloudRain" />
          <ActivityItem time="Yesterday" action="Festival calendar published for Jul-Aug" department="temple-info" actor="Rajesh K." icon="Calendar" />
        </div>
      </section>
    </div>
  )
}
