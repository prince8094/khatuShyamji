"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"



export function LostFoundScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t, tObject } = useLanguage()
  const foundItems: any[] = tObject("screens.lostFound.foundItemsList") || []
  const [activeTab, setActiveTab] = useState<"found" | "report">("found")
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    date: "",
    location: "",
    phone: "",
    color: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setForm({ itemName: "", description: "", date: "", location: "", phone: "", color: "" })
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">{t("screens.lostFound.lostFound")}</h1>
            <p className="text-sm text-white/80 mt-1">{t("screens.lostFound.reunitingDevoteesWithTheirBelongings")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="PackageSearch" className="size-6" />
          </span>
        </div>
        {/* Helpline */}
        <a href="tel:01576-230011" className="relative mt-4 flex items-center gap-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/15 px-4 py-2.5">
          <Icon name="Phone" className="size-4 text-white" />
          <div>
            <p className="text-[10px] text-white/70 uppercase tracking-wider">{t("screens.lostFound.lostFoundHelpline")}</p>
            <p className="text-sm font-bold text-white">01576-230011</p>
          </div>
        </a>
      </section>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary/60 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab("found")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
            activeTab === "found"
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="Search" className="size-4" />
          {t("screens.lostFound.foundItems")}
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
            activeTab === "report"
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="TriangleAlert" className="size-4" />
          {t("screens.lostFound.reportLost")}
        </button>
      </div>

      {/* Found Items List */}
      {activeTab === "found" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
            <Icon name="Info" className="size-4 text-green-600 shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              {t("screens.lostFound.itemsFoundInTheLast7DaysVisitTheLostFou")}
            </p>
          </div>

          {foundItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm"
            >
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${item.color}`}>
                <Icon name={item.icon} className="size-6" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-foreground truncate">{item.item}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Icon name="MapPin" className="size-3 text-primary" />
                  <span className="text-[10px] font-semibold text-primary">{item.location}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground bg-secondary rounded-lg px-2 py-1">{item.id}</span>
            </motion.div>
          ))}

          <Ornament />

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("screens.lostFound.lostFoundDesk")}</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Icon name="MapPin" className="size-3.5 text-primary" />{t("screens.lostFound.gate2NearMedicalCamp")}</div>
              <div className="flex items-center gap-2"><Icon name="Clock" className="size-3.5 text-primary" />{t("screens.lostFound.open500Am1000Pm")}</div>
              <div className="flex items-center gap-2"><Icon name="Phone" className="size-3.5 text-primary" />01576-230011</div>
            </div>
          </section>
        </div>
      )}

      {/* Report Lost Item Form */}
      {activeTab === "report" && (
        <div className="space-y-4">
          <AnimatePresence>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-3xl border border-green-200 bg-green-50 p-6 text-center shadow-sm"
              >
                <span className="grid size-14 place-items-center rounded-full bg-green-100 text-green-600">
                  <Icon name="CheckCircle" className="size-7" />
                </span>
                <h3 className="font-heading text-base font-bold text-green-700">
                  {t("screens.lostFound.reportSubmitted")}
                </h3>
                <p className="text-xs text-green-600 leading-relaxed">
                  {t("screens.lostFound.ourTeamWillContactYouAtYourNumberIfYourI")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
                  <p className="text-xs text-foreground font-medium">
                    {t("screens.lostFound.fillInAsManyDetailsAsPossibleOurSecurityT")}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.itemName")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("screens.lostFound.egBlueWalletGoldRing")}
                    value={form.itemName}
                    onChange={e => setForm({ ...form, itemName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.colorDescription")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("screens.lostFound.colorBrandSizeMarkings")}
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.whereWasItLost")}</label>
                  <select
                    required
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  >
                    <option value="">{t("screens.lostFound.selectLocation")}</option>
                    {["Main Sanctum", "Queue Complex", "Prasad Counter", "Parking Lot A", "Parking Lot B", "Gate 1", "Gate 2", "Gate 3", "Shyam Kund", "Other"].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.dateOfLoss")}</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.yourPhoneNumber")}</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.additionalDetails")}</label>
                  <textarea
                    rows={2}
                    placeholder={t("screens.lostFound.anyOtherHelpfulDetails")}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Send" className="size-4" />
                  {t("screens.lostFound.submitReport")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}