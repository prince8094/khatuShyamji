"use client"

import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { aartiTimings } from "@/lib/data"
import { motion } from "framer-motion"

export function AartiTimingsScreen() {
  const { t, lang } = useLanguage()
  const { goBack } = useNavigation()

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

        <div className="space-y-4">
          {aartiTimings.map((aarti, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={aarti.name}
              className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Icon name="Flame" className="size-5 text-[#FF8C00] opacity-80" />
                <p className="text-sm font-bold text-foreground">
                  {lang === "hi" ? aarti.hindi : aarti.name}
                </p>
              </div>
              <span className="font-heading text-sm font-bold text-[#FF8C00] bg-[#FF8C00]/10 px-3 py-1 rounded-full">
                {aarti.time}
              </span>
            </motion.div>
          ))}
        </div>
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
