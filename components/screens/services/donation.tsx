"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const categories = [
  { id: "general", name: "General Fund", nameHi: "सामान्य कोष", desc: "Supports overall temple operations and maintenance.", descHi: "मंदिर के समग्र संचालन और रखरखाव में सहयोग।" },
  { id: "bhandara", name: "Free Bhandara (Annakshetra)", nameHi: "निःशुल्क भंडारा (अन्नक्षेत्र)", desc: "Provides free daily meals to thousands of visiting pilgrims.", descHi: "दर्शनार्थी भक्तों को प्रतिदिन निःशुल्क भोजन सेवा।" },
  { id: "gaushala", name: "Shri Krishna Gaushala", nameHi: "श्री कृष्ण गौशाला", desc: "Care, fodder, and medical support for cows in the trust gaushala.", descHi: "ट्रस्ट की गौशाला में गौ-माता की सेवा, चारा और चिकित्सा सहायता।" },
  { id: "construction", name: "Temple Construction & Art", nameHi: "मंदिर निर्माण एवं कला", desc: "Contributes to expansion and beautiful marble carvings of the temple.", descHi: "मंदिर विस्तार और सुंदर संगमरमर नक्काशी में योगदान।" },
]

export function DonationScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  const [selectedCat, setSelectedCat] = useState<typeof categories[0]>(categories[0])
  const [amount, setAmount] = useState<string>("501")
  const [donorForm, setDonorForm] = useState({
    name: "",
    phone: "",
    email: "",
    pan: "",
  })
  const [donated, setDonated] = useState(false)

  const handleDonation = (e: React.FormEvent) => {
    e.preventDefault()
    setDonated(true)
    setTimeout(() => {
      setDonated(false)
      setDonorForm({ name: "", phone: "", email: "", pan: "" })
      setAmount("501")
    }, 4000)
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <button onClick={() => navigate("services")} className="mb-2 flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white">
              <Icon name="ArrowLeft" className="size-4" /> {t("screens.services.donation.backToServices")}
            </button>
            <h1 className="font-heading text-xl font-bold">{t("screens.services.donation.devotionalDonation")}</h1>
            <p className="text-xs text-white/80 mt-1">{t("screens.services.donation.supportTempleSevaGaushalaFreeBhandaras")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/25 border border-white/20">
            <Icon name="HandCoins" className="size-6 text-white" />
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Categories */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">{t("screens.services.donation.selectCause")}</p>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedCat.id === c.id
                  ? "bg-primary/5 border-primary dark:bg-muted"
                  : "bg-card border-border hover:border-primary/50 dark:bg-card dark:border-border/30"
              }`}
            >
              <h3 className="font-heading font-bold text-sm text-foreground">{t(c.name, c.nameHi)}</h3>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-normal">{t(c.desc, c.descHi)}</p>
            </button>
          ))}
        </div>

        {/* Right column: Form & Amount */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm dark:bg-card dark:border-border/30 space-y-5">
            <div className="border-b border-border/50 pb-4 dark:border-border/20">
              <h3 className="font-heading text-base font-bold text-foreground">
                {t("screens.services.donation.donationDetails")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("screens.services.donation.cause")} <span className="font-bold text-foreground">{t(selectedCat.name, selectedCat.nameHi)}</span>
              </p>
            </div>

            <AnimatePresence mode="wait">
              {donated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-8 text-center"
                >
                  <span className="grid size-16 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/30">
                    <Icon name="CheckCircle" className="size-8" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-green-600 dark:text-green-400">
                    {t("screens.services.donation.donationReceivedWithThanks")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                    {t("screens.services.donation.babasBlessingsUponYouATaxExemptionReceiptU")}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleDonation} className="space-y-4">
                  {/* Amount Selectors */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.donation.selectAmount")}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["101", "501", "1100", "2100"].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt)}
                          className={`rounded-xl py-2 text-xs font-bold border transition ${
                            amount === amt
                              ? "bg-primary border-primary text-white"
                              : "bg-secondary/20 border-border text-foreground hover:bg-secondary/45 dark:bg-muted dark:border-border/30"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.donation.orEnterCustomAmount")}</label>
                    <input
                      type="number"
                      required
                      placeholder="₹5000"
                      min="10"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="dark:bg-muted dark:border-border/30 font-bold text-primary font-heading"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.donation.donorFullName")}</label>
                      <input
                        type="text"
                        required
                        placeholder="Mohan Sharma"
                        value={donorForm.name}
                        onChange={e => setDonorForm({ ...donorForm, name: e.target.value })}
                        className="dark:bg-muted dark:border-border/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.donation.contactNumber")}</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={donorForm.phone}
                        onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })}
                        className="dark:bg-muted dark:border-border/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.donation.emailAddress")}</label>
                      <input
                        type="email"
                        required
                        placeholder="mohan@example.com"
                        value={donorForm.email}
                        onChange={e => setDonorForm({ ...donorForm, email: e.target.value })}
                        className="dark:bg-muted dark:border-border/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.services.donation.panNumberFor80gReceipt")}</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={donorForm.pan}
                        onChange={e => setDonorForm({ ...donorForm, pan: e.target.value })}
                        className="dark:bg-muted dark:border-border/30 uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                  >
                    <Icon name="Heart" className="size-4" />
                    {t(`Donate ₹${amount || "0"} Now`, `₹${amount || "0"} अभी दान करें`)}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
