"use client"

import { useState } from "react"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const faqs = [
  {
    q: { en: "How do I book a darshan pass?", hi: "दर्शन पास कैसे बुक करें?" },
    a: { en: "Go to 'Book Darshan' from the home screen or bottom navigation. Select your date, number of devotees, and proceed. A QR pass will be generated instantly.", hi: "होम स्क्रीन या नीचे नेविगेशन से 'दर्शन बुक करें' पर जाएं। अपनी तारीख, श्रद्धालुओं की संख्या चुनें और आगे बढ़ें। क्यूआर पास तुरंत बन जाएगा।" }
  },
  {
    q: { en: "Is the darshan booking free?", hi: "क्या दर्शन बुकिंग मुफ्त है?" },
    a: { en: "Yes, the standard darshan pass is completely free. Special sevas may have applicable charges.", hi: "हां, मानक दर्शन पास पूरी तरह मुफ्त है। विशेष सेवाओं पर लागू शुल्क हो सकता है।" }
  },
  {
    q: { en: "Can I cancel my booking?", hi: "क्या मैं अपनी बुकिंग रद्द कर सकता हूं?" },
    a: { en: "Yes, you can cancel from 'My Bookings' up to 24 hours before your scheduled darshan date.", hi: "हां, आप अपनी निर्धारित दर्शन तारीख से 24 घंटे पहले तक 'मेरी बुकिंग' से रद्द कर सकते हैं।" }
  },
  {
    q: { en: "What items are not allowed inside the temple?", hi: "मंदिर के अंदर कौन सी वस्तुएं नहीं जाने दी जाएंगी?" },
    a: { en: "Leather items, non-vegetarian food, alcohol, and large bags are not permitted. Cameras allowed for devotional purposes only.", hi: "चमड़े की वस्तुएं, मांसाहारी भोजन, शराब और बड़े बैग की अनुमति नहीं है। कैमरे केवल आध्यात्मिक उद्देश्यों के लिए अनुमत हैं।" }
  },
  {
    q: { en: "How early should I arrive for darshan?", hi: "दर्शन के लिए कितनी जल्दी पहुंचना चाहिए?" },
    a: { en: "We recommend arriving at least 1 hour before your booked slot. During festivals like Ekadashi, plan to arrive 2-3 hours early.", hi: "हम आपके बुक किए गए स्लॉट से कम से कम 1 घंटे पहले पहुंचने की सलाह देते हैं। एकादशी जैसे त्योहारों के दौरान 2-3 घंटे पहले पहुंचने की योजना बनाएं।" }
  },
  {
    q: { en: "Is the QR pass valid for re-entry?", hi: "क्या क्यूआर पास पुनः प्रवेश के लिए मान्य है?" },
    a: { en: "No, each QR pass is valid for a single entry only on the selected date.", hi: "नहीं, प्रत्येक क्यूआर पास केवल चयनित तारीख पर एक बार प्रवेश के लिए मान्य है।" }
  },
]

const categories = [
  { icon: "CalendarCheck", label: { en: "Booking Issues", hi: "बुकिंग समस्या" }, color: "text-[#D97706] bg-[#FFF3E0]" },
  { icon: "QrCode", label: { en: "QR Pass Help", hi: "क्यूआर पास सहायता" }, color: "text-blue-600 bg-blue-50" },
  { icon: "MapPin", label: { en: "Travel & Stay", hi: "यात्रा और ठहराव" }, color: "text-green-600 bg-green-50" },
  { icon: "Landmark", label: { en: "Temple Info", hi: "मंदिर जानकारी" }, color: "text-purple-600 bg-purple-50" },
  { icon: "Siren", label: { en: "Emergency", hi: "आपातकाल" }, color: "text-red-600 bg-red-50" },
  { icon: "Smartphone", label: { en: "App Support", hi: "ऐप सहायता" }, color: "text-[#D4AF37] bg-[#D4AF37]/10" },
]

export function HelpSupportScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [msgSent, setMsgSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMsgSent(true)
    setForm({ name: "", email: "", message: "" })
    setTimeout(() => setMsgSent(false), 4000)
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 text-white">
            <Icon name="CircleHelp" className="size-7" />
          </span>
          <div>
            <h1 className="font-heading text-xl font-bold">{t("screens.helpSupport.helpSupport")}</h1>
            <p className="text-sm text-white/80">{t("screens.helpSupport.wereHereToHelpYou")}</p>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="grid grid-cols-2 gap-3">
        <a href="tel:1800-180-6127"
          className="flex flex-col items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-center shadow-sm transition hover:shadow-md active:scale-95">
          <span className="grid size-12 place-items-center rounded-2xl bg-green-100 text-green-600">
            <Icon name="Phone" className="size-6" />
          </span>
          <p className="font-heading text-sm font-bold text-green-800">{t("screens.helpSupport.callHelpline")}</p>
          <p className="text-xs text-green-600 font-semibold">1800-180-6127</p>
        </a>
        <button
          onClick={() => navigate("shyam-ai")}
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#D4AF37]/40 bg-[#FFF8F0] p-4 text-center shadow-sm transition hover:shadow-md active:scale-95">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#D97706]">
            <Icon name="Bot" className="size-6" />
          </span>
          <p className="font-heading text-sm font-bold text-foreground">{t("screens.helpSupport.shyamAi")}</p>
          <p className="text-xs text-muted-foreground">{t("screens.helpSupport.instantAnswers")}</p>
        </button>
      </section>

      {/* Support Categories */}
      <section>
        <h2 className="font-heading text-base font-bold text-foreground mb-3">{t("screens.helpSupport.supportCategories")}</h2>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((c, i) => (
            <button key={i}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition hover:border-primary/30 active:scale-95">
              <span className={`grid size-10 place-items-center rounded-xl ${c.color}`}>
                <Icon name={c.icon} className="size-5" />
              </span>
              <span className="text-[11px] font-semibold text-foreground leading-tight">{t(c.label.en, c.label.hi)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="font-heading text-base font-bold text-foreground mb-3">
          {t("screens.helpSupport.frequentlyAskedQuestions")}
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="font-semibold text-sm text-foreground leading-tight">{t(faq.q.en, faq.q.hi)}</span>
                <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} className="size-4 shrink-0 text-primary" />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3 animate-in slide-in-from-top-1 duration-200">
                  {t(faq.a.en, faq.a.hi)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Ornament />

      {/* Send Message */}
      <section className="rounded-3xl border border-[#D4AF37]/30 bg-card p-5 shadow-sm">
        <h2 className="font-heading text-base font-bold text-foreground mb-1">{t("screens.helpSupport.sendUsAMessage")}</h2>
        <p className="text-xs text-muted-foreground mb-4">{t("screens.helpSupport.wellRespondWithin24Hours")}</p>

        {msgSent ? (
          <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 p-4">
            <Icon name="CheckCircle" className="size-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700">{t("screens.helpSupport.messageSentWellGetBackToYouSoon")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              placeholder={t("screens.helpSupport.yourName")}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              required
              placeholder={t("screens.helpSupport.emailAddress")}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <textarea
              required
              rows={3}
              placeholder={t("screens.helpSupport.describeYourIssueOrQuestion")}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="resize-none"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
            >
              <Icon name="Send" className="size-4" />
              {t("screens.helpSupport.sendMessage")}
            </button>
          </form>
        )}
      </section>

      {/* Emergency contact */}
      <section className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-4">
        <Icon name="Siren" className="size-5 shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-bold text-red-700">{t("screens.helpSupport.emergency")}</p>
          <p className="text-xs text-red-500">{t("screens.helpSupport.call112ForImmediatePoliceOrMedicalHelp")}</p>
        </div>
        <a href="tel:112" className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">
          {t("screens.helpSupport.call")}
        </a>
      </section>
    </div>
  )
}
