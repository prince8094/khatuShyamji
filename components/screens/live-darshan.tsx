"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Ornament, StatusDot } from "@/components/shared"
import { aartiTimings } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const upcomingAarti = [
  { name: "Sandhya Aarti", hindi: "संध्या आरती", time: "7:30 PM", status: "upcoming" },
  { name: "Shayan Aarti", hindi: "शयन आरती", time: "9:30 PM", status: "upcoming" },
]

export function LiveDarshanScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  const [isStreamActive] = useState(false) // Set to true when real stream URL is ready
  const [streamUrl] = useState("") // Replace with actual YouTube Live embed URL
  const [showQuality, setShowQuality] = useState(false)
  const [quality, setQuality] = useState("HD 720p")

  return (
    <div className="space-y-5 pb-10">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A0F05] to-[#0A0A1A] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "200px" }} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D97706]/20 blur-3xl rounded-full" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusDot tone="success" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                {t("screens.liveDarshan.liveDarshan")}
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold leading-tight">{t("screens.liveDarshan.shriKhatuShyamJi")}</h1>
            <p className="text-xs text-white/70 mt-1">{t("screens.liveDarshan.liveFromKhatuDhamSikarRajasthan")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/15 border border-white/15 text-white">
            <Icon name="Video" className="size-6" />
          </span>
        </div>
      </section>

      {/* Live Player Area */}
      <section className="overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#0f0b07] shadow-lg">
        {isStreamActive && streamUrl ? (
          <div className="relative aspect-video w-full">
            <iframe
              src={streamUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Khatu Shyam Ji Live Darshan"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#1c1208] to-[#0f0b07]">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "120px" }} />
            {/* Devotional placeholder UI */}
            <motion.div
              animate={{ scale: [0.97, 1.03, 0.97] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-full bg-[#D4AF37]/10 blur-2xl animate-pulse" />
              <span className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#D97706]/30 to-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                <Icon name="Video" className="size-9" />
              </span>
            </motion.div>

            <div className="relative text-center px-6">
              <p className="font-heading text-lg font-bold text-[#D4AF37]">{t("screens.liveDarshan.liveStreamComingSoon")}</p>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                {t("screens.liveDarshan.liveDarshanWillBeAvailableDuringAartiTiming")}
              </p>
            </div>

            <div className="relative flex items-center gap-2 rounded-full bg-[#D97706]/20 border border-[#D97706]/30 px-4 py-2">
              <StatusDot tone="warning" />
              <span className="text-xs font-bold text-[#D4AF37]">{t("screens.liveDarshan.nextLiveSandhyaAarti730Pm")}</span>
            </div>
          </div>
        )}

        {/* Stream controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#D4AF37]/15">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15 transition">
              <Icon name="Volume2" className="size-3.5" />
              {t("screens.liveDarshan.audio")}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowQuality(!showQuality)}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15 transition"
              >
                <Icon name="Settings" className="size-3.5" />
                {quality}
              </button>
              <AnimatePresence>
                {showQuality && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full mb-1 left-0 bg-[#1c1208] border border-[#D4AF37]/20 rounded-xl overflow-hidden shadow-xl z-10"
                  >
                    {["HD 720p", "SD 480p", "Auto"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setQuality(q); setShowQuality(false) }}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-left hover:bg-white/10 ${q === quality ? "text-[#D4AF37]" : "text-white/70"}`}
                      >
                        {q === quality && <Icon name="Check" className="size-3" />}
                        {q}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
            {t("screens.liveDarshan.khatuDhamOfficial")}
          </span>
        </div>
      </section>

      {/* Today's Aarti Schedule */}
      <section className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#FFF8F0] to-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Flame" className="size-5 text-primary" />
          <h2 className="font-heading text-base font-bold text-foreground">{t("screens.liveDarshan.aartiSchedule")}</h2>
        </div>
        <Ornament className="my-3" />
        <div className="space-y-3">
          {aartiTimings.map((a, i) => (
            <div key={a.name} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF3E0] text-primary">
                  <Icon name={i < 2 ? "Sun" : "Moon"} className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{t(a.name, a.hindi)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t(a.hindi, a.name)}</p>
                </div>
              </div>
              <span className="font-heading text-sm font-bold text-primary">{a.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* What to expect */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-foreground mb-3">{t("screens.liveDarshan.aboutLiveDarshan")}</h2>
        <div className="space-y-3">
          {[
            { icon: "Video", text: { en: "Live stream goes active 15 min before each Aarti", hi: "प्रत्येक आरती से 15 मिनट पहले लाइव स्ट्रीम शुरू होती है" } },
            { icon: "Globe", text: { en: "Available globally with HD quality", hi: "एचडी गुणवत्ता के साथ विश्वभर में उपलब्ध" } },
            { icon: "Bell", text: { en: "Notifications sent before each Aarti begins", hi: "प्रत्येक आरती शुरू होने से पहले सूचनाएं भेजी जाती हैं" } },
            { icon: "Volume2", text: { en: "Full audio including conch shell and bhajans", hi: "शंख और भजनों सहित पूर्ण ऑडियो" } },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="grid size-8 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                <Icon name={item.icon} className="size-4" />
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">{t(item.text.en, item.text.hi)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA: Book actual darshan */}
      <button
        onClick={() => navigate("book")}
        className="w-full flex items-center justify-between gap-2 rounded-3xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-6 py-4 text-white shadow-lg transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <Icon name="CalendarCheck" className="size-6" />
          <div className="text-left">
            <p className="font-heading text-sm font-bold">{t("screens.liveDarshan.bookPhysicalDarshan")}</p>
            <p className="text-xs text-white/80">{t("screens.liveDarshan.visitTheTempleInPerson")}</p>
          </div>
        </div>
        <Icon name="ChevronRight" className="size-5" />
      </button>
    </div>
  )
}