"use client"

import { Icon, Om } from "@/components/shared"
import { motion } from "framer-motion"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.href = "/"
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#FAF6F0]">
      {/* Traditional background watermark */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-center"
        style={{ backgroundImage: "url('/images/mandala-pattern.png')", backgroundSize: "400px" }}
      />

      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none overflow-hidden select-none">
        <svg viewBox="0 0 800 200" className="w-full h-full fill-amber-900/5">
          <path d="M 0 200 L 50 140 L 60 150 L 80 120 L 100 150 L 110 140 L 160 200 M 160 200 L 220 110 L 235 125 L 260 80 L 285 125 L 300 110 L 360 200 Z" />
        </svg>
      </div>

      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-amber-100/70 bg-white/90 backdrop-blur-md shadow-xl p-8 text-center"
      >
        <div className="space-y-6">
          {/* Centered Logo with gold frame */}
          <div className="mx-auto grid size-20 place-items-center rounded-full border border-amber-200 bg-amber-50/50 p-4 relative">
            <span className="absolute inset-1 rounded-full border border-dashed border-[#800000]/25 animate-[spin_20s_linear_infinite]" />
            <Om className="size-8 text-[#800000] relative z-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-black text-[#800000] tracking-wide">
              जय श्री श्याम
            </h2>
            <p className="text-sm font-bold text-amber-800 uppercase tracking-widest">
              You are Offline
            </p>
          </div>

          <div className="py-4 border-y border-amber-100/50 text-left space-y-3">
            <div className="flex gap-3 text-amber-900/75">
              <Icon name="WifiOff" className="size-5 shrink-0 text-[#800000] mt-0.5" />
              <p className="text-sm font-semibold">
                No active internet connection was detected.
              </p>
            </div>
            <div className="flex gap-3 text-amber-900/75">
              <Icon name="CalendarCheck" className="size-5 shrink-0 text-[#800000] mt-0.5" />
              <p className="text-sm font-semibold">
                Previously loaded passes and details can still be accessed under "My Bookings" in your browser.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#800000] to-[#E25822] py-4 text-base font-bold text-white shadow-md active:scale-[0.98] transition hover:shadow-lg"
            >
              <Icon name="RefreshCw" className="size-4 animate-spin-slow" />
              Try Reconnecting
            </button>
            
            <p className="text-[10px] text-amber-800/60 font-bold uppercase tracking-wider">
              Smart Pilgrim Management System
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
