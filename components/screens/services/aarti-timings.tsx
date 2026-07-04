"use client"

import { useState, useEffect } from "react"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { devoteeApi } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

interface AartiTiming {
  id: string
  name: string
  name_hi?: string
  start_time: string
  end_time?: string
  description?: string
  description_hi?: string
  status: string
  display_order: number
}

export function AartiTimingsScreen() {
  const { t, lang } = useLanguage()
  const { goBack } = useNavigation()
  const [timingsList, setTimingsList] = useState<AartiTiming[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTimings = () => {
    devoteeApi.getAartiTimings()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setTimingsList(res)
        }
      })
      .catch((err) => {
        console.error("Failed to load aarti timings from DB", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTimings()

    const channel = supabase
      .channel("public:aarti_timings_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "aarti_timings" },
        () => {
          console.log("Realtime aarti_timings change detected!")
          fetchTimings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="grid size-10 place-items-center rounded-2xl bg-secondary/50 text-foreground transition hover:bg-secondary active:scale-95"
        >
          <Icon name="ArrowLeft" className="size-5" />
        </button>
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">
            {t("screens.services.items.aarti.label", "Aarti Timings")}
          </h1>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-md">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1604928257007-4e3a47926b02?auto=format&fit=crop&q=80&w=1200"
          alt="Aarti Timings"
          className="h-48 w-full object-cover sm:h-56 md:h-64"
        />
        <div className="absolute bottom-0 left-0 w-full p-5 z-20">
          <h2 className="font-heading text-2xl font-bold text-white drop-shadow-md">
            {lang === "hi" ? "आरती दर्शन" : "Divine Aarti"}
          </h2>
          <p className="mt-1 text-sm text-white/90 drop-shadow-sm font-medium">
            {lang === "hi"
              ? "दिव्य आरती में शामिल हों और बाबा श्याम का आशीर्वाद प्राप्त करें।"
              : "Join the divine Aartis and receive Baba Shyam's blessings."}
          </p>
        </div>
      </div>

      {/* Timings Card */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#FFA726] text-white shadow-sm">
            <Icon name="Clock" className="size-5" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              {lang === "hi" ? "आज का कार्यक्रम" : "Today's Schedule"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {lang === "hi" ? "दैनिक आरती समय" : "Daily Aarti Timings"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-[#FF8C00] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            {timingsList.map((aarti, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={aarti.id}
                className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <Icon name="Flame" className="size-5 text-[#FF8C00] opacity-80 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {lang === "hi" && aarti.name_hi ? aarti.name_hi : aarti.name}
                    </p>
                    {(aarti.description || aarti.description_hi) && (
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {lang === "hi" && aarti.description_hi ? aarti.description_hi : aarti.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-heading text-sm font-bold text-[#FF8C00] bg-[#FF8C00]/10 px-3 py-1 rounded-full shrink-0">
                  {aarti.start_time}
                  {aarti.end_time ? ` - ${aarti.end_time}` : ""}
                </span>
              </motion.div>
            ))}
            {timingsList.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">No Aarti timings configured.</p>
            )}
          </div>
        )}
      </section>

      {/* Additional Information Notice */}
      <section className="flex items-start gap-3 rounded-2xl border border-[#FFE0B2] bg-[#FFF8E7] dark:bg-[#FF8C00]/10 dark:border-[#FF8C00]/20 p-5 shadow-sm">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF8C00] text-white shadow-sm">
          <Icon name="Info" className="size-5" />
        </span>
        <div className="space-y-2">
          <p className="font-heading text-sm font-bold text-[#8a4b12] dark:text-[#FF8C00]">
            {lang === "hi" ? "महत्वपूर्ण जानकारी" : "Important Note"}
          </p>
          <ul className="list-disc pl-4 text-xs leading-relaxed text-[#8a5a22] dark:text-muted-foreground space-y-1 font-medium marker:text-[#FF8C00]">
            <li>
              {lang === "hi"
                ? "त्यौहारों और विशेष अवसरों पर समय में परिवर्तन हो सकता है।"
                : "Timings may change on festivals and special occasions."}
            </li>
            <li>
              {lang === "hi"
                ? "भक्तों को आरती से 15-20 मिनट पहले पहुंचना चाहिए।"
                : "Devotees should arrive 15–20 minutes before Aarti."}
            </li>
            <li>
              {lang === "hi"
                ? "मंदिर प्रशासन को समय में बदलाव करने का अधिकार सुरक्षित है।"
                : "Temple administration reserves the right to modify timings."}
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
