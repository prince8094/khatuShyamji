"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { devoteeApi } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

interface AnnouncementItem {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  date: string
}

const mockAnnouncements: AnnouncementItem[] = [
  {
    id: "1",
    title: "Ekadashi Special Darshan Timings",
    description: "In light of the upcoming Ekadashi festival, darshan hours will be extended to 24 hours starting midnight to accommodate the large influx of pilgrims.",
    priority: "high",
    date: "June 30, 2026",
  },
  {
    id: "2",
    title: "New Shuttle Bus Service Activated",
    description: "Complimentary electric shuttle buses are now running continuously between Parking Lot C and the main Temple Gate 1 corridor.",
    priority: "medium",
    date: "June 29, 2026",
  },
  {
    id: "3",
    title: "Heavy Rainfall Warning — Parking A Closed",
    description: "Due to heavy rains, Parking Lot A is temporarily closed for maintenance. Please redirect all vehicles to Parking Lot B or bypass zones.",
    priority: "critical",
    date: "June 28, 2026",
  },
]

export function AnnouncementsScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { goBack } = useNavigation()
  const { lang, t } = useLanguage()
  const [list, setList] = useState<AnnouncementItem[]>(mockAnnouncements)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      try {
        const langCode = lang === "hi" ? "hi" : "en"
        const data = await devoteeApi.getAnnouncements()

        if (data && data.length > 0) {
          const mapped = data.map((item: any) => {
            // Find translation for selected language
            let trans = item.announcement_translations?.find(
              (t: any) => t.language_code === langCode
            )
            // Fallback to first translation if language not found
            if (!trans && item.announcement_translations?.length > 0) {
              trans = item.announcement_translations[0]
            }

            return {
              id: item.id,
              title: trans?.title || "No Title",
              description: trans?.description || "No description available",
              priority: item.priority as any,
              date: new Date(item.created_at).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            }
          })
          setList(mapped)
        }
      } catch (err) {
        console.error("Failed to load announcements", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()

    const channel = supabase
      .channel("public:announcements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          console.log("Realtime announcements change detected!")
          fetchAnnouncements()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lang])

  const priorityColors = {
    low: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400",
    medium: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
    high: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
    critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 animate-pulse",
  }

  const priorityIcons = {
    low: "Info",
    medium: "Bell",
    high: "AlertCircle",
    critical: "TriangleAlert",
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <button onClick={goBack} className="mb-2 flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white">
              <Icon name="ArrowLeft" className="size-4" /> {t("screens.services.hotelBooking.backToServices")}
            </button>
            <h1 className="font-heading text-xl font-bold">
              {lang === "hi" ? "महत्वपूर्ण घोषणाएं" : "Important Announcements"}
            </h1>
            <p className="text-xs text-white/80 mt-1">
              {lang === "hi" ? "मंदिर प्रशासन की ओर से आधिकारिक अपडेट" : "Official live broadcasts & alerts from Khatu Dham"}
            </p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Megaphone" className="size-6 text-white animate-bounce" />
          </span>
        </div>
      </section>

      {/* Main announcements feed */}
      {loading ? (
        <p className="text-center text-xs text-muted-foreground py-10">Loading latest announcements...</p>
      ) : list.length > 0 ? (
        <div className="space-y-4">
          {list.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-base font-extrabold text-foreground">{item.title}</h2>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase shrink-0 ${priorityColors[item.priority]}`}>
                  <Icon name={priorityIcons[item.priority]} className="size-3" />
                  {item.priority}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {item.description}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold border-t border-border/40 pt-2.5">
                <Icon name="Calendar" className="size-3.5 text-primary" />
                <span>{item.date}</span>
              </div>
            </motion.div>
          ))}
          <Ornament />
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground py-10 italic border border-dashed rounded-2xl">
          No current announcements published.
        </p>
      )}
    </div>
  )
}