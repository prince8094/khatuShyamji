"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useAudio } from "@/lib/contexts/AudioContext"

export function OpeningAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const { t } = useLanguage()
  const { playTempleBell, soundEnabled, setSoundEnabled } = useAudio()
  
  // Play bell sound on splash — max 2-3 rings, independent of soundEnabled toggle
  // Uses Web Audio API directly for a one-shot splash bell experience
  const playOneShotSplashBell = (rings: number = 2) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      
      const playStrike = (delay: number) => {
        const now = ctx.currentTime + delay
        const bellGain = ctx.createGain()
        bellGain.gain.setValueAtTime(0, now)
        bellGain.gain.linearRampToValueAtTime(0.035, now + 0.015)
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5)
        bellGain.connect(ctx.destination)
        
        const frequencies = [440, 543, 672, 825, 935, 1100, 1500]
        frequencies.forEach((f) => {
          const osc = ctx.createOscillator()
          osc.type = "sine"
          osc.frequency.setValueAtTime(f, now)
          osc.connect(bellGain)
          osc.start(now)
          osc.stop(now + 4.5)
        })
      }
      
      // Ring the bell 2-3 times
      for (let i = 0; i < rings; i++) {
        playStrike(i * 0.8)
      }
      // Auto close context after bells finish
      setTimeout(() => { try { ctx.close() } catch(_) {} }, (rings * 0.8 + 5) * 1000)
    } catch (e) {
      console.warn("Splash bell error:", e)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    // Phases:
    // 0: Night Sky (0-2s)
    // 1: Dawn (2-4s)
    // 2: Journey Reveal (4-6s)
    // 3: Temple Arrival (6-8s)
    // 4: Darshan Prelude (8-10s)
    // 5: Lord Reveal (10s onwards)
    
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 4000),
      setTimeout(() => setPhase(3), 6000),
      setTimeout(() => setPhase(4), 8000),
      setTimeout(() => {
        setPhase(5)
        // Play bell independently of soundEnabled — max 2 rings on splash
        playOneShotSplashBell(2)
      }, 10000)
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleEnter = () => {
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A1A] text-white overflow-hidden">
      
      {/* Background layer transitions */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#0A0A1A] to-[#1A120B]"
        animate={{ opacity: phase === 0 ? 1 : 0 }}
        transition={{ duration: 2 }}
      />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#D97706]/20 to-[#1A120B]"
        animate={{ opacity: phase === 1 ? 1 : 0 }}
        transition={{ duration: 2 }}
      />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#FFF8F0]/10 to-[#1A120B]"
        animate={{ opacity: phase >= 2 && phase < 5 ? 1 : 0 }}
        transition={{ duration: 2 }}
      />

      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="night"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
          </motion.div>
        )}
        
        {phase === 1 && (
          <motion.div
            key="dawn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="absolute bottom-0 w-full h-[60vh] bg-gradient-to-t from-[#D97706]/40 to-transparent blur-3xl" />
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="journey"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Path visualization */}
            <div className="w-1/3 h-full bg-gradient-to-t from-[#D4AF37]/10 to-transparent blur-xl" style={{ perspective: '500px', transform: 'rotateX(60deg)' }} />
          </motion.div>
        )}

        {phase === 3 && (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative size-64 border-4 border-[#D4AF37] rounded-t-full flex items-end justify-center pb-4 overflow-hidden">
               <motion.div 
                 initial={{ y: 0 }}
                 animate={{ y: 200 }}
                 transition={{ duration: 2, ease: "easeIn" }}
                 className="absolute inset-0 bg-[#D4AF37]" 
               />
            </div>
          </motion.div>
        )}

        {phase === 4 && (
          <motion.div
            key="prelude"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Golden particles & Incense */}
            <div className="absolute bottom-0 w-full h-[50vh] bg-gradient-to-t from-[#D4AF37]/30 to-transparent blur-2xl" />
          </motion.div>
        )}

        {phase === 5 && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-sm"
          >
            <div className="relative size-64 rounded-full flex items-center justify-center">
               <div className="absolute inset-0 rounded-full bg-[#D4AF37] blur-[100px] opacity-40" />
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1, duration: 2 }}
                 className="relative z-10"
               >
                 <Image src="/images/khatu-shyam-logo.png" alt="Lord Shyam" width={160} height={160} className="object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]" />
               </motion.div>
            </div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="mt-12 flex flex-col items-center"
            >
              <h1 className="font-heading text-4xl font-bold text-[#D4AF37] tracking-[0.2em] drop-shadow-lg mb-8 text-center">
                {t("features.openingAnimation.jaiShriShyam")}
              </h1>
              
              <button
                onClick={handleEnter}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-8 py-3 text-lg font-bold text-white shadow-[0_0_30px_rgba(212,175,55,0.4)] transition active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
                {t("features.openingAnimation.enterDarbar")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound Toggle (Top Left) */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-white/50 hover:text-white transition text-xs uppercase tracking-widest"
        >
          {soundEnabled ? "Sound On" : "Sound Off"}
        </button>
      </div>

      {/* Skip Button (Top Right) */}
      {phase < 5 && (
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={handleSkip}
            className="text-white/50 hover:text-white transition text-xs uppercase tracking-widest"
          >
            {t("features.openingAnimation.skip")}
          </button>
        </div>
      )}
    </div>
  )
}
