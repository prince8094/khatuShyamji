"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Icon, Om } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { LanguageToggle } from "@/components/ui/language-toggle"

export function WelcomeScreen({ navigate }: { navigate: (s: any) => void }) {
  const { t } = useLanguage()

  return (
    <div className="relative -mx-4 md:-mx-8 -mt-5 -mb-24 lg:-mb-10 min-h-[100dvh] flex flex-col lg:flex-row overflow-hidden bg-[#FAF6F0]">
      
      {/* LEFT PANEL - Desktop Only (Golden Temple Arch & Deity Photo) */}
      <section className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-b from-[#FAF0E4] via-[#FFEEDC] to-[#FFF5EB] relative border-r border-amber-100/50">
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-center"
          style={{ backgroundImage: "url('/images/mandala-pattern.png')", backgroundSize: "400px" }}
        />
        
        {/* Traditional Temple Spires Silhouette Watermark */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none overflow-hidden select-none">
          <svg viewBox="0 0 800 200" className="w-full h-full fill-amber-900/5">
            <path d="M 0 200 L 50 140 L 60 150 L 80 120 L 100 150 L 110 140 L 160 200 M 160 200 L 220 110 L 235 125 L 260 80 L 285 125 L 300 110 L 360 200 M 360 200 L 400 130 L 415 140 L 430 110 L 450 140 L 465 130 L 500 200 M 500 200 L 560 90 L 580 110 L 610 60 L 640 110 L 660 90 L 720 200 M 720 200 L 760 140 L 770 150 L 785 130 L 800 150 L 800 200 Z" />
          </svg>
        </div>

        {/* Top Header */}
        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#800000] to-[#E25822] text-white shadow-md">
            <Om className="size-5" />
          </span>
          <div>
            <h3 className="font-heading font-extrabold text-[#800000] text-sm tracking-wider">
              {t("app.header.title")}
            </h3>
            <p className="text-[10px] font-bold text-amber-800/80 uppercase tracking-widest">
              {t("home.hero.tagline")}
            </p>
          </div>
        </div>

        {/* Middle Deity Arch Portrait */}
        <div className="relative my-6 text-center z-10">
          <div className="relative w-60 h-72 mx-auto rounded-t-full overflow-hidden border-4 border-amber-600/20 shadow-2xl bg-white p-2">
            <div className="relative w-full h-full rounded-t-full overflow-hidden">
              <Image
                src="/images/khatu-shyam-deity.png"
                alt="Baba Shyam Deity"
                fill
                priority
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
          <p className="mt-4 font-heading text-xs font-bold text-amber-900/60 uppercase tracking-[0.2em]">
            {t("home.hero.tagline")}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-black text-[#800000] tracking-wide drop-shadow-sm">
            {t("info.temple.festivalsTitle") === "प्रमुख उत्सव" ? "बाबा श्याम हमारा" : "Baba Shyam Hamara"}
          </h2>
        </div>

        {/* Bottom Benefits */}
        <div className="relative grid grid-cols-3 gap-4 border-t border-amber-200/40 pt-6">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-9 place-items-center rounded-full bg-amber-50 text-[#800000] shadow-sm mb-2">
              <Icon name="ShieldCheck" className="size-4" />
            </span>
            <p className="text-xs font-bold text-amber-950">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "सुरक्षित" : "Secure"}</p>
            <p className="text-[10px] text-amber-800/70 mt-0.5">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "100% सुरक्षित लॉगिन" : "100% Secure Sign In"}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="grid size-9 place-items-center rounded-full bg-amber-50 text-[#800000] shadow-sm mb-2">
              <Icon name="Bell" className="size-4" />
            </span>
            <p className="text-xs font-bold text-amber-950">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "त्वरित सेवा" : "Fast Booking"}</p>
            <p className="text-[10px] text-amber-800/70 mt-0.5">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "झटपट बुकिंग" : "Instant Passes"}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="grid size-9 place-items-center rounded-full bg-amber-50 text-[#800000] shadow-sm mb-2">
              <Icon name="Heart" className="size-4" />
            </span>
            <p className="text-xs font-bold text-amber-950">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "भक्ति से जुड़ें" : "Stay Devotional"}</p>
            <p className="text-[10px] text-amber-800/70 mt-0.5">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "श्याम प्रेम में डूबें" : "Immerse in Devotion"}</p>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL - Welcome Content */}
      <section className="w-full lg:w-1/2 min-h-[100dvh] flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto">
        {/* Floating Language Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>

        {/* Dummy div to balance flex layout */}
        <div className="h-6" />

        {/* Central Welcome Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-3xl border border-amber-100/70 bg-white shadow-xl p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            {/* Circular logo shape containing standard temple icon */}
            <div className="mx-auto mb-8 grid size-28 place-items-center rounded-full border border-amber-200 bg-amber-50/50 p-4 shadow-sm relative">
              <span className="absolute inset-2 rounded-full border border-dashed border-[#800000]/20 animate-[spin_30s_linear_infinite]" />
              <Image
                src="/images/khatu-shyam-logo.png"
                alt="Khatu Shyam Logo"
                width={72}
                height={72}
                priority
                className="object-contain drop-shadow-md relative z-10"
              />
            </div>

            <h1 className="font-heading text-3xl font-black text-[#800000] tracking-wider leading-none">
              {t("auth.welcome.heading")}
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6b5440]/80">
              {t("auth.welcome.subtitle")}
            </p>

            {/* Actions */}
            <div className="mt-10 space-y-4">
              <button
                onClick={() => navigate("login")}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#800000] to-[#E25822] py-4 text-base font-bold text-white shadow-[0_4px_15px_rgba(128,0,0,0.25)] transition duration-300 hover:shadow-[0_6px_20px_rgba(128,0,0,0.35)] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {t("auth.welcome.enter")}
                <Icon name="ArrowRight" className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate("home")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/10 py-3.5 text-base font-bold text-[#6b5440] hover:bg-amber-50 transition active:scale-[0.98]"
              >
                {t("auth.welcome.guest")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Safety Footer */}
        <footer className="mt-8 pt-6 border-t border-amber-100/60 grid grid-cols-3 gap-2 text-center text-[10px] md:text-xs text-[#6b5440]/80">
          <div className="flex flex-col items-center gap-1">
            <Icon name="Lock" className="size-4 text-[#800000]" />
            <span className="font-semibold">{t("app.footer.safety")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name="Shield" className="size-4 text-[#800000]" />
            <span className="font-semibold">{t("app.footer.privacy")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name="Headset" className="size-4 text-[#800000]" />
            <span className="font-semibold">{t("app.footer.support")}</span>
          </div>
        </footer>
      </section>
    </div>
  )
}