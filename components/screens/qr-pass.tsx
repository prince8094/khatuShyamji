"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, QrMock } from "@/components/shared"
import { cn } from "@/lib/utils"
import { user, type ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"

const instructionsEn = [
  "Show this unified E-Pass at the main entry gate.",
  "Carry a valid government ID for all visitors listed.",
  "Reach the temple 30 mins before your slot time.",
  "Mobile phones are strictly prohibited inside the inner sanctum.",
]

const instructionsHi = [
  "मुख्य प्रवेश द्वार पर यह संयुक्त ई-पास दिखाएं।",
  "सूचीबद्ध सभी आगंतुकों के लिए एक वैध सरकारी आईडी साथ रखें।",
  "अपने स्लॉट समय से 30 मिनट पहले मंदिर पहुंचें।",
  "गर्भगृह के अंदर मोबाइल फोन पूरी तरह से प्रतिबंधित हैं।",
]

export function QrPassScreen({ navigate }: { navigate?: (s: ScreenKey) => void }) {
  const { lang, t } = useLanguage()
  const [downloadFeedback, setDownloadFeedback] = useState(false)
  const [shareFeedback, setShareFeedback] = useState(false)
  const [booking, setBooking] = useState<{
    id: string
    name: string
    date: string
    visitors: number | string
    status: string
  } | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeId = localStorage.getItem("active_booking_id")
      const storedBookings = localStorage.getItem("khatu_bookings")
      let found: any = null

      if (activeId && storedBookings) {
        try {
          const list = JSON.parse(storedBookings)
          found = list.find((b: any) => b.id === activeId)
        } catch (e) {}
      }

      if (!found) {
        const latest = localStorage.getItem("latest_booking")
        if (latest) {
          try {
            found = JSON.parse(latest)
          } catch (e) {}
        }
      }

      if (!found && storedBookings) {
        try {
          const list = JSON.parse(storedBookings)
          const upcoming = list.filter((b: any) => b.status === "upcoming")
          found = upcoming.length > 0 ? upcoming[0] : list[0]
        } catch (e) {}
      }

      if (found) {
        setBooking(found)
      } else {
        setBooking({
          id: "KSJ-2026-08841",
          name: user.name,
          date: "28 Jun 2026",
          visitors: "4",
          status: "upcoming"
        })
      }
    }
  }, [])

  const details = [
    { label: t("screens.qrPass.bookingId"), value: booking?.id || "KSJ-2026-08841", icon: "Hash", mono: true },
    { label: t("screens.qrPass.devoteeGroupName"), value: booking?.name || user.name, icon: "User" },
    { label: t("screens.qrPass.darshanDate"), value: booking?.date || "28 Jun 2026", icon: "CalendarCheck" },
    { label: t("screens.qrPass.devoteesCount"), value: `${booking?.visitors || "4"} ${t("screens.qrPass.persons")}`, icon: "Users" },
  ]

  const instructions = lang === "en" ? instructionsEn : instructionsHi

  const handleDownload = () => {
    setDownloadFeedback(true)
    setTimeout(() => setDownloadFeedback(false), 2500)
  }

  const handleShare = async () => {
    const text = `Darshan E-Pass
Booking ID: ${booking?.id || "KSJ-2026-08841"}
Date: ${booking?.date || "28 Jun 2026"}
Visitors: ${booking?.visitors || "4"}
Shri Khatu Shyam Ji Mandir`
    if (navigator.share) {
      await navigator.share({ title: "Darshan E-Pass", text }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text).catch(() => {})
      setShareFeedback(true)
      setTimeout(() => setShareFeedback(false), 2500)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back to bookings */}
      {navigate && (
        <button
          onClick={() => navigate("bookings")}
          className="flex items-center gap-2 text-sm font-semibold text-[#6b5440] transition hover:text-[#D97706]"
        >
          <Icon name="ArrowLeft" className="size-4" />
          {t("screens.qrPass.backToMyBookings")}
        </button>
      )}

      {/* Premium Official Ticket Card */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-[#FFF8F0] shadow-2xl shadow-[#D97706]/10 border-2 border-[#D4AF37]"
      >
        {/* Top gold banner */}
        <div className="relative overflow-hidden px-6 py-6 text-white bg-gradient-to-br from-[#1c110a] to-[#2c1b10] border-b-2 border-[#D4AF37]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "200px" }}
          />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent blur-xl" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-full border border-[#D4AF37] bg-white p-1.5 shadow-inner">
                <Image
                  src="/images/khatu-shyam-logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="size-full object-contain"
                />
              </span>
              <div>
                <p className="font-heading text-lg font-bold tracking-widest text-[#D4AF37] drop-shadow-sm uppercase">
                  {t("screens.qrPass.officialPass")}
                </p>
                <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/80">
                  {t("screens.qrPass.shriShyamMandirBoard")}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                booking?.status === "cancelled" 
                  ? "border-red-500 bg-red-950/40 text-red-400"
                  : "border-green-500 bg-green-950/40 text-green-400"
              )}>
                {booking?.status === "cancelled" ? t("screens.qrPass.cancelled") : t("screens.qrPass.verified")}
              </span>
            </div>
          </div>
        </div>

        {/* QR code Area */}
        <div className="relative flex flex-col items-center px-6 pb-4 pt-10 bg-gradient-to-b from-[#FFF8F0] to-white">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
          
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#D4AF37]/15 to-transparent blur-xl" />
            <div className={`relative rounded-[2rem] border-4 bg-white p-6 shadow-xl ${
              booking?.status === "cancelled" ? "border-red-400" : "border-[#D4AF37]"
            }`}>
              <QrMock size={200} seed={booking?.id || "KSJ-2026-08841"} />
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-[#D4AF37]" />
              <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-[#D4AF37]" />
            </div>
          </div>
          <p className="mt-6 text-[10.5px] font-bold uppercase tracking-widest text-[#D97706] mb-4">
            {booking?.status === "cancelled" ? t("screens.qrPass.invalidPass") : t("screens.qrPass.scanAtToranDwar")}
          </p>
        </div>

        {/* Golden Tear line */}
        <div className="relative my-1 bg-white">
          <div className="border-t-2 border-dashed border-[#D4AF37]/50 mx-6" />
          <span className="absolute -left-3 -top-3 size-6 rounded-full bg-background border-r border-[#D4AF37] shadow-inner" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full bg-background border-l border-[#D4AF37] shadow-inner" />
        </div>

        {/* Details list */}
        <div className="bg-white px-6 pb-8 pt-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6">
            {details.map((d) => (
              <div key={d.label} className="flex flex-col gap-1.5">
                <dt className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-[#6b5440]">
                  <Icon name={d.icon} className="size-3.5 text-[#D97706]" />
                  {d.label}
                </dt>
                <dd
                  className={cn(
                    "font-heading text-sm font-bold text-[#1c110a]",
                    d.mono && "font-mono tracking-tight"
                  )}
                >
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.section>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDownload}
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-4 text-sm font-bold text-white shadow-[0_4px_15px_rgba(217,119,6,0.3)] transition active:scale-[0.98]"
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
          <AnimatePresence mode="wait">
            {downloadFeedback ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                <Icon name="Check" className="size-5" />
                {t("screens.qrPass.savedToPhone")}
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                <Icon name="Download" className="size-5" />
                {t("screens.qrPass.downloadPass")}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E8D5B7] bg-white py-4 text-sm font-bold text-[#D97706] transition hover:border-[#D4AF37] hover:bg-[#FFF8F0] active:scale-[0.98]"
        >
          <AnimatePresence mode="wait">
            {shareFeedback ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                <Icon name="Check" className="size-5" />
                {t("screens.qrPass.copiedLink")}
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                <Icon name="Share2" className="size-5" />
                {t("screens.qrPass.sharePass")}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Instructions */}
      <section className="rounded-3xl border border-[#D4AF37]/30 bg-[#FFF8F0] p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-[#1A120B]">
          <span className="grid size-8 place-items-center rounded-full bg-[#D97706]/10 text-[#D97706]">
            <Icon name="Info" className="size-4" />
          </span>
          {t("screens.qrPass.mandatoryGuidelines")}
        </h3>
        <ul className="space-y-3">
          {instructions.map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#6b5440] font-medium">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-white shadow-sm">
                {i + 1}
              </span>
              <span className="pt-0.5">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Book another CTA */}
      {navigate && (
        <button
          onClick={() => navigate("book")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8D5B7] bg-transparent py-4 text-sm font-bold text-[#6b5440] transition hover:bg-[#FFF8F0] hover:text-[#D97706] active:scale-[0.98]"
        >
          <Icon name="CalendarPlus" className="size-5" />
          {t("screens.qrPass.bookAnotherVisit")}
        </button>
      )}
    </div>
  )
}