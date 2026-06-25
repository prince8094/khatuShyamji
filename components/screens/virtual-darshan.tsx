"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useAudio } from "@/lib/contexts/AudioContext"

export function VirtualDarshanScreen({ navigate }: { navigate: (s: any) => void }) {
  const { t } = useLanguage()
  const { playTempleBell, soundEnabled } = useAudio()
  const [step, setStep] = useState(1) // 1: Desert, 2: Temple Entrance, 3: Inner Sanctum/Idol
  const [flowerShower, setFlowerShower] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (soundEnabled) {
      playTempleBell('single')
    }
  }, [])

  const handleNextStep = () => {
    if (step < 3) {
      const next = step + 1
      setStep(next)
      if (soundEnabled) {
        playTempleBell(next === 3 ? 'triple' : 'single')
      }
      if (next === 3) {
        // Trigger flower shower at main idol
        setFlowerShower(true)
        setTimeout(() => setFlowerShower(false), 6000)
      }
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      if (soundEnabled) {
        playTempleBell('single')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 select-none overflow-hidden">
      
      {/* ── Landscape Banner Force message for mobile ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 border border-white/20 backdrop-blur-md rounded-full px-4 py-1.5 z-50 text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-2 pointer-events-none md:hidden">
        <Icon name="RotateCw" className="size-3 animate-spin" />
        {t("Rotate for Best Experience", "सर्वोत्तम अनुभव के लिए फोन घुमाएं")}
      </div>

      {/* ── Top Header ── */}
      <div className="relative z-20 flex justify-between items-center text-white">
        <button
          onClick={() => navigate("home")}
          className="grid size-10 place-items-center rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/20 active:scale-90 transition"
        >
          <Icon name="X" className="size-5 text-white" />
        </button>
        
        <div className="text-center">
          <h2 className="font-heading text-lg font-bold text-[#D4AF37] tracking-widest">
            {t("VIRTUAL DARSHAN", "अलौकिक आभासी दर्शन")}
          </h2>
          <p className="text-[10px] text-white/60 tracking-wider mt-0.5 uppercase">
            {step === 1 && t("Step 1: Rajasthan Desert Route", "चरण 1: रींगस मरुभूमि मार्ग")}
            {step === 2 && t("Step 2: Khatu Temple Entrance", "चरण 2: श्री श्याम मंदिर तोरण द्वार")}
            {step === 3 && t("Step 3: Main Deity Darbar", "चरण 3: गर्भगृह - बाबा श्याम दर्शन")}
          </p>
        </div>

        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* ── Immersive Landscape Backgrounds ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="desert"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Desert sunrise */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a16] via-[#a85018] to-[#c27c38]" />
              <div className="absolute bottom-0 inset-x-0 h-[40vh] bg-[#9e5c24] rounded-t-[200px] scale-y-50 opacity-90" />
              <div className="absolute bottom-10 inset-x-0 h-[30vh] bg-[#b87030] rounded-t-[300px] scale-y-50 opacity-90 translate-x-20" />
              
              {/* Devotional particles */}
              <div className="absolute bottom-12 flex flex-col items-center">
                <span className="text-sm font-heading font-semibold text-white/95 drop-shadow-md">
                  {t("Walking to Baba Shyam's Dham...", "बाबा श्याम के धाम की ओर पदयात्रा...")}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#FFF8F0]/70 mt-1 italic">
                  "हारे का सहारा, बाबा श्याम हमारा"
                </span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="temple"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#1C0A00] to-[#0A0A1A]" />
              
              {/* Decorative Temple Toran Gate silhouette */}
              <div className="relative size-64 md:size-80 border-4 border-[#D4AF37]/40 rounded-t-full flex items-end justify-center pb-6 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/mandala-pattern.png')] bg-cover opacity-5" />
                <motion.div 
                  className="w-full h-full bg-[#1A120B]/90 flex flex-col items-center justify-center p-4"
                  initial={{ y: 200 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <span className="text-xs text-[#D4AF37] font-bold tracking-[0.2em] mb-4">
                    ॥ तोरण द्वार ॥
                  </span>
                  <div className="w-16 h-[2px] bg-[#D4AF37]/50" />
                </motion.div>
              </div>

              {/* Float flags in sky */}
              <div className="absolute top-24 left-1/4 animate-bounce">
                <Icon name="Flag" className="size-6 text-[#D97706]" />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="deity"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1E0F00] via-[#0C0600] to-[#050300]"
            >
              {/* Rays backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.45)_0%,transparent_70%)] animate-pulse" />
              
              {/* Main deity */}
              <div className="relative size-60 md:size-80 flex items-center justify-center">
                <Image 
                  src="/images/khatu-shyam-hero.jpg" 
                  alt="Lord Khatu Shyam" 
                  width={250} 
                  height={250} 
                  className="object-contain drop-shadow-[0_0_35px_rgba(212,175,55,0.95)] rounded-full" 
                />
              </div>

              <div className="mt-4 text-center z-10">
                <h3 className="font-heading text-xl font-bold text-[#D4AF37] tracking-widest drop-shadow-md">
                  {t("SHREE KHATU SHYAM NARESH", "श्री खाटू श्याम नरेश की जय")}
                </h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Flower shower particles layer ── */}
      {flowerShower && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-3 rounded-full bg-[#8B1E1E]" // Red rose petals
              style={{ left: `${Math.random() * 100}%`, top: "-5%" }}
              animate={{
                y: ["0vh", "110vh"],
                x: [0, (Math.random() > 0.5 ? 60 : -60), 0],
                rotate: [0, 360],
              }}
              transition={{ duration: 2.5 + Math.random() * 2, ease: "linear" }}
            />
          ))}
        </div>
      )}

      {/* ── Bottom Controls ── */}
      <div className="relative z-20 flex justify-between items-center text-white pb-2 md:pb-4">
        {step > 1 ? (
          <button
            onClick={handlePrevStep}
            className="flex items-center gap-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md px-5 py-2.5 text-xs font-bold transition hover:bg-white/20 active:scale-95"
          >
            <Icon name="ArrowLeft" className="size-4" />
            {t("Go Back", "पीछे जाएं")}
          </button>
        ) : (
          <div className="w-24" /> // Spacer
        )}

        {step === 3 ? (
          <button
            onClick={() => {
              setFlowerShower(true)
              if (soundEnabled) {
                playTempleBell('triple')
              }
              setTimeout(() => setFlowerShower(false), 5000)
            }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-6 py-3 text-xs font-bold text-white shadow-lg active:scale-95 transition"
          >
            <Icon name="Flame" className="size-4 text-white" />
            {t("Offer Flower Shower", "पुष्प वर्षा करें")}
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-black shadow-lg hover:bg-white active:scale-95 transition"
          >
            <span>{t("Continue Forward", "आगे बढ़ें")}</span>
            <Icon name="ArrowRight" className="size-4" />
          </button>
        ) : (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-xs font-bold text-white shadow-lg active:scale-95 transition"
          >
            {t("Complete Darshan", "दर्शन पूर्ण")}
            <Icon name="Check" className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
