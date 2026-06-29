"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import type { ScreenKey } from "@/lib/data"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { useLanguage } from "@/lib/contexts/LanguageContext"

export function GroupBookingScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { goBack } = useNavigation()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    groupName: "",
    leaderName: "",
    leaderPhone: "",
    totalPassengers: 7,
    specialRequirements: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.groupName) newErrors.groupName = t("screens.groupBooking.groupNameIsRequired")
    if (!formData.leaderName) newErrors.leaderName = t("screens.groupBooking.leaderNameIsRequired")
    if (!formData.leaderPhone) newErrors.leaderPhone = t("screens.groupBooking.phoneNumberIsRequired")
    else if (!/^\d{10}$/.test(formData.leaderPhone)) newErrors.leaderPhone = t("screens.groupBooking.invalidPhoneNumber")
    if (formData.totalPassengers < 7) newErrors.totalPassengers = t("screens.groupBooking.minimum7PassengersRequired")
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      
      const newBookingId = `KSJ-GRP-${Math.floor(10000 + Math.random() * 90000)}`
      const newBooking = {
        id: newBookingId,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        visitors: formData.totalPassengers,
        name: formData.groupName,
        leaderName: formData.leaderName,
        phone: formData.leaderPhone,
        status: "upcoming" as const
      }
      
      // Save latest booking for immediate view
      localStorage.setItem("latest_booking", JSON.stringify(newBooking))
      
      // Append to the list of bookings
      try {
        const stored = localStorage.getItem("khatu_bookings")
        const currentList = stored ? JSON.parse(stored) : []
        currentList.unshift(newBooking)
        localStorage.setItem("khatu_bookings", JSON.stringify(currentList))
      } catch (e) {
        console.error(e)
      }

      navigate("booking-success" as any)
    }, 2000)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-sm font-semibold text-[#6b5440] transition hover:text-[#D97706]"
      >
        <Icon name="ArrowLeft" className="size-4" />
        {t("screens.groupBooking.backToBooking")}
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A120B] to-[#2A1D13] p-8 text-center shadow-lg border border-[#D4AF37]/20">
        <div className="absolute inset-0 bg-[url('/images/mandala-pattern.png')] bg-cover opacity-[0.05]" />
        <div className="relative z-10">
          <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <Icon name="Users" className="size-8" />
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#D4AF37] tracking-wide">{t("screens.groupBooking.groupBooking")}</h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/70 leading-relaxed">
            {t("screens.groupBooking.forGroupsOf7Devotees")} <br/>
            {t("screens.groupBooking.aSingleGroupPassWillBeGenerated")}
          </p>
        </div>
      </div>

      <section className="space-y-6 rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#FFF8F0] to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-5">
          {/* Group Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#6b5440] uppercase tracking-wider">
              {t("screens.groupBooking.groupSanghaName")}
            </label>
            <input
              type="text"
              placeholder={t("screens.groupBooking.egJaipurShyamMandal")}
              value={formData.groupName}
              onChange={(e) => setFormData(f => ({ ...f, groupName: e.target.value }))}
              className={cn(
                "w-full rounded-xl border border-[#E8D5B7] bg-white py-3.5 px-4 text-sm font-semibold text-[#1A120B] shadow-sm outline-none transition focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10",
                errors.groupName && "border-red-400 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
            <AnimatePresence>
              {errors.groupName && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 text-xs text-red-500">{errors.groupName}</motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Total Passengers */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#6b5440] uppercase tracking-wider">
              {t("screens.groupBooking.totalPassengers")}
            </label>
            <input
              type="number"
              min={7}
              value={formData.totalPassengers}
              onChange={(e) => setFormData(f => ({ ...f, totalPassengers: Number(e.target.value) }))}
              className={cn(
                "w-full rounded-xl border border-[#E8D5B7] bg-white py-3.5 px-4 text-sm font-semibold text-[#1A120B] shadow-sm outline-none transition focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10",
                errors.totalPassengers && "border-red-400 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
            <AnimatePresence>
              {errors.totalPassengers && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 text-xs text-red-500">{errors.totalPassengers}</motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="my-6 border-t border-dashed border-[#E8D5B7]" />

          <h3 className="font-heading text-lg font-bold text-[#1A120B] flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-[#D97706]/10 text-[#D97706]">
              <Icon name="User" className="size-4" />
            </span>
            {t("screens.groupBooking.leaderDetails")}
          </h3>

          {/* Leader Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#6b5440] uppercase tracking-wider">
              {t("screens.groupBooking.leaderName")}
            </label>
            <input
              type="text"
              placeholder={t("screens.groupBooking.enterLeadersFullName")}
              value={formData.leaderName}
              onChange={(e) => setFormData(f => ({ ...f, leaderName: e.target.value }))}
              className={cn(
                "w-full rounded-xl border border-[#E8D5B7] bg-white py-3.5 px-4 text-sm font-semibold text-[#1A120B] shadow-sm outline-none transition focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10",
                errors.leaderName && "border-red-400 focus:border-red-500 focus:ring-red-500/10"
              )}
            />
            <AnimatePresence>
              {errors.leaderName && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 text-xs text-red-500">{errors.leaderName}</motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Leader Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#6b5440] uppercase tracking-wider">
              {t("screens.groupBooking.phoneNumber")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5440] font-semibold bg-white border-r border-[#E8D5B7] pr-3 py-1">
                +91
              </span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.leaderPhone}
                onChange={(e) => setFormData(f => ({ ...f, leaderPhone: e.target.value.replace(/\D/g, '') }))}
                maxLength={10}
                className={cn(
                  "w-full rounded-xl border border-[#E8D5B7] bg-white py-3.5 pl-16 pr-4 text-sm font-semibold text-[#1A120B] shadow-sm outline-none transition focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10",
                  errors.leaderPhone && "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                )}
              />
            </div>
            <AnimatePresence>
              {errors.leaderPhone && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 text-xs text-red-500">{errors.leaderPhone}</motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="my-6 border-t border-dashed border-[#E8D5B7]" />

          {/* Special Requirements */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#6b5440] uppercase tracking-wider">
              {t("screens.groupBooking.specialRequirementsOptional")}
            </label>
            <textarea
              placeholder={t("screens.groupBooking.anySpecialNeedsWheelchairAccessEtc")}
              rows={3}
              value={formData.specialRequirements}
              onChange={(e) => setFormData(f => ({ ...f, specialRequirements: e.target.value }))}
              className="w-full rounded-xl border border-[#E8D5B7] bg-white py-3.5 px-4 text-sm font-semibold text-[#1A120B] shadow-sm outline-none transition focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10 resize-none"
            />
          </div>
        </div>
      </section>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(217,119,6,0.4)] transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-6"
      >
        <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
        {isSubmitting ? (
          <>
            <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t("screens.groupBooking.processing")}
          </>
        ) : (
          <>
            {t("screens.groupBooking.confirmGroupBooking")}
            <Icon name="ArrowRight" className="size-5" />
          </>
        )}
      </button>
    </div>
  )
}
