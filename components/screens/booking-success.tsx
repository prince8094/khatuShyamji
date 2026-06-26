"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useAudio } from "@/lib/contexts/AudioContext"

export function BookingSuccessScreen({ navigate }: { navigate: (s: any) => void }) {
  const { t } = useLanguage()
  const { playTempleBell } = useAudio()
  const [booking, setBooking] = useState<{ id: string; date: string; visitors: number; name: string } | null>(null)

  useEffect(() => {
    // Play bell sound to denote success
    playTempleBell("triple")

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("latest_booking")
      if (saved) {
        setBooking(JSON.parse(saved))
      }
    }
  }, [playTempleBell])

  return (
    <div className="space-y-6 pb-8 text-center">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A120B] to-[#2A1D13] p-8 shadow-xl border border-[#D4AF37]/30">
        <div className="absolute inset-0 bg-[url('/images/mandala-pattern.png')] bg-cover opacity-[0.05]" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Ringing bell icon animation */}
          <div className="relative z-10 mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            <motion.div
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            >
              <Icon name="BellRing" className="size-12" />
            </motion.div>
          </div>

          <h2 className="font-heading text-3xl font-bold text-[#D4AF37] tracking-wide">
            {t("screens.bookingSuccess.bookingConfirmed")}
          </h2>
          <p className="mt-2 text-sm text-white/80 max-w-xs">
            {t("screens.bookingSuccess.yourDigitalPassHasBeenGeneratedSuccessfully")}
          </p>
        </div>
      </div>

      {booking && (
        <section className="rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-md max-w-sm mx-auto text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF8F0] to-transparent pointer-events-none" />
          <h3 className="font-heading text-lg font-bold text-[#1A120B] border-b border-[#E8D5B7] pb-3 mb-4">
            {t("screens.bookingSuccess.bookingDetails")}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6b5440] font-semibold">{t("screens.bookingSuccess.bookingId")}:</span>
              <span className="font-bold text-[#1A120B]">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b5440] font-semibold">{t("screens.bookingSuccess.date")}:</span>
              <span className="font-bold text-[#1A120B]">{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b5440] font-semibold">{t("screens.bookingSuccess.devotees")}:</span>
              <span className="font-bold text-[#1A120B]">{booking.visitors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b5440] font-semibold">{t("screens.bookingSuccess.primaryDevotee")}:</span>
              <span className="font-bold text-[#1A120B]">{booking.name}</span>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-4 max-w-sm mx-auto mt-8">
        <button
          onClick={() => navigate("qr")}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(217,119,6,0.4)] transition active:scale-[0.98]"
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
          {t("screens.bookingSuccess.viewEPassQr")}
          <Icon name="QrCode" className="size-5" />
        </button>

        <button
          onClick={() => navigate("home")}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white py-3.5 text-base font-semibold text-[#6b5440] transition hover:bg-[#FFF8F0] active:scale-[0.98]"
        >
          {t("screens.bookingSuccess.goToHome")}
        </button>
      </div>
    </div>
  )
}