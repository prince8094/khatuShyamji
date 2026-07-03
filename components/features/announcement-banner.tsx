"use client"

import { useState, useEffect } from "react"
import { Icon } from "@/components/shared"
import { announcements as defaultAnnouncements } from "@/lib/data"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/contexts/LanguageContext"

export function AnnouncementBanner({ announcements = defaultAnnouncements }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const { t } = useLanguage()

  // Parse markdown bold text
  const parseText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  useEffect(() => {
    if (isHovered || announcements.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isHovered, announcements.length])

  if (!announcements || announcements.length === 0) return null

  const currentAnnouncement = announcements[currentIndex]
  const translatedText = currentAnnouncement.key ? t(currentAnnouncement.key) : currentAnnouncement.text

  return (
    <section 
      className="relative overflow-hidden rounded-3xl border border-[#D97706]/20 border-l-4 border-l-[#800000] bg-[#FFF8E7] shadow-sm transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "150px", backgroundPosition: "center" }}
        aria-hidden="true"
      />

      <div className="relative flex p-4 gap-4 items-start">
        {/* Left Side: Icon */}
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#800000] to-[#500000] text-white shadow-inner border border-[#800000]/50">
          <Icon name="Megaphone" className="size-5" />
        </span>

        {/* Right Side: Title and Sliding Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="font-heading text-sm font-extrabold tracking-wider text-[#800000] uppercase mb-1">
            {t("home.announcements.heading")}
          </h2>
          
          <div className="relative overflow-hidden min-h-[2.5rem] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm leading-relaxed text-[#8a5a22] break-words"
              >
                {parseText(translatedText)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
