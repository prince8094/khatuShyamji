"use client"

import { useLanguage } from "@/lib/contexts/LanguageContext"
import { motion } from "framer-motion"

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="relative flex items-center rounded-full border border-amber-200/60 bg-white/95 p-0.5 text-xs font-bold font-heading shadow-sm dark:border-amber-950/30 dark:bg-black/90 backdrop-blur-md">
      {/* Sliding background */}
      <div className="relative flex items-center select-none">
        <button
          onClick={() => setLang("hi")}
          className={`relative z-10 flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-colors duration-300 ${
            lang === "hi"
              ? "text-white font-extrabold"
              : "text-[#6b5440] hover:text-[#D97706] dark:text-amber-200/70 dark:hover:text-white"
          }`}
          aria-label="हिन्दी"
          title="हिन्दी"
        >
          {lang === "hi" && (
            <motion.div
              layoutId="activeLangHighlight"
              className="absolute inset-0 rounded-full bg-[#800000] shadow-[0_2px_8px_rgba(128,0,0,0.35)]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-20 text-sm">🇮🇳</span>
          <span className="relative z-20 hidden sm:inline">हिन्दी</span>
          <span className="relative z-20 sm:hidden text-[10px]">हिं</span>
        </button>

        <button
          onClick={() => setLang("en")}
          className={`relative z-10 flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-colors duration-300 ${
            lang === "en"
              ? "text-white font-extrabold"
              : "text-[#6b5440] hover:text-[#D97706] dark:text-amber-200/70 dark:hover:text-white"
          }`}
          aria-label="English"
          title="English"
        >
          {lang === "en" && (
            <motion.div
              layoutId="activeLangHighlight"
              className="absolute inset-0 rounded-full bg-[#800000] shadow-[0_2px_8px_rgba(128,0,0,0.35)]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-20 text-sm">🇬🇧</span>
          <span className="relative z-20 hidden sm:inline">English</span>
          <span className="relative z-20 sm:hidden text-[10px]">EN</span>
        </button>
      </div>
    </div>
  )
}
