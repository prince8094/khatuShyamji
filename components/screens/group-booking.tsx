"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import type { ScreenKey } from "@/lib/data"
import { useNavigation } from "@/lib/contexts/NavigationContext"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { devoteeApi } from "@/lib/api-client"

 type GroupMember = {
  id: number
  name: string
  age: string
  gender: string
  identityProofType?: string
  identityProofNumber?: string
}

const emptyMember = (id: number): GroupMember => ({
  id,
  name: "",
  age: "",
  gender: "",
  identityProofType: "",
  identityProofNumber: "",
})

export function GroupBookingScreen({
  navigate,
  bookingDate,
}: {
  navigate: (s: ScreenKey) => void
  bookingDate?: string | null
}) {
  const { goBack } = useNavigation()
  const { t } = useLanguage()
  
  // Default to 7 members as the minimum constraint
  const [members, setMembers] = useState<GroupMember[]>(() =>
    Array.from({ length: 7 }, (_, i) => emptyMember(i + 1))
  )
  
  const [formData, setFormData] = useState({
    groupName: "",
    leaderName: "",
    leaderPhone: "",
    specialRequirements: "",
  })
 useEffect(() => {
  if (typeof window !== "undefined") {
    const savedCount = localStorage.getItem("booking_devotees_count")
    if (savedCount) {
      const count = Number(savedCount)
      if (count >= 7) {
        setMembers(Array.from({ length: count }, (_, i) => emptyMember(i + 1)))
      }
    }
  }
}, [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateMember = (id: number, field: keyof GroupMember, value: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`member-${id}-${field}`]
      return next
    })
  }

  const addMember = () => {
    const newId = members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1
    setMembers((prev) => [...prev, emptyMember(newId)])
  }

  const removeMember = (id: number) => {
    if (members.length <= 7) {
      alert("A minimum of 7 group members is required for a Group Pass.")
      return
    }
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.groupName.trim()) newErrors.groupName = t("screens.groupBooking.groupNameIsRequired")
    if (!formData.leaderName.trim()) newErrors.leaderName = t("screens.groupBooking.leaderNameIsRequired")
    if (!formData.leaderPhone.trim()) newErrors.leaderPhone = t("screens.groupBooking.phoneNumberIsRequired")
    else if (!/^\d{10}$/.test(formData.leaderPhone)) newErrors.leaderPhone = t("screens.groupBooking.invalidPhoneNumber")
    
    // Validate all members details
    members.forEach((m, idx) => {
      if (!m.name.trim()) {
        newErrors[`member-${m.id}-name`] = `Devotee ${idx + 1} Name is required`
      }
      if (!m.age.trim()) {
        newErrors[`member-${m.id}-age`] = `Devotee ${idx + 1} Age is required`
      }
      if (!m.gender.trim()) {
        newErrors[`member-${m.id}-gender`] = `Devotee ${idx + 1} Gender is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    setErrors({})

    try {
      const activeUserStr = localStorage.getItem("current_user")
      const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null
      const profileId = activeUser?.id

      const bookingNumber = `KSJ-GRP-${Math.floor(10000 + Math.random() * 90000)}`
      
      let bookingDateObj = new Date()
      if (bookingDate) {
        const parsed = Date.parse(bookingDate)
        if (!isNaN(parsed)) {
          bookingDateObj = new Date(parsed)
        }
      }
      const dateStr = bookingDateObj.toISOString().split("T")[0]
      const dayName = bookingDateObj.toLocaleDateString('en-US', { weekday: 'long' })
      const visitorsCount = members.length

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || !profileId) {
        // Fallback mock mode
        const newBooking = {
          id: bookingNumber,
          date: bookingDate || bookingDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          day: dayName,
          visitors: visitorsCount,
          name: formData.groupName,
          leaderName: formData.leaderName,
          phone: formData.leaderPhone,
          members: members,
          status: "upcoming" as const
        }
        localStorage.setItem("latest_booking", JSON.stringify(newBooking))
        localStorage.setItem("booking_devotees_count", String(visitorsCount))
        
        const stored = localStorage.getItem("khatu_bookings")
        const currentList = stored ? JSON.parse(stored) : []
        currentList.unshift(newBooking)
        localStorage.setItem("khatu_bookings", JSON.stringify(currentList))
        
        setTimeout(() => {
          setIsSubmitting(false)
          navigate("booking-success" as any)
        }, 1500)
        return
      }

      // Call REST API
      const bookingData = await devoteeApi.bookDarshan({
        booking_type: "group",
        booking_date: dateStr,
        day_name: dayName,
        visitor_count: visitorsCount,
        group_name: formData.groupName,
        members: members.map((m) => ({
          name: m.name,
          age: parseInt(m.age, 10),
          gender: m.gender,
          nationality: "India",
          identity_proof_type: m.identityProofType || null,
          identity_proof_number: m.identityProofNumber || null,
          is_child: false
        }))
      })

      const newBooking = {
        id: bookingData.booking_number || bookingNumber,
        date: bookingDate || bookingDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        day: dayName,
        visitors: visitorsCount,
        name: formData.groupName,
        leaderName: formData.leaderName,
        phone: formData.leaderPhone,
        members: members,
        status: "upcoming" as const,
        qrToken: bookingData.qr_token
      }
      localStorage.setItem("latest_booking", JSON.stringify(newBooking))
      localStorage.setItem("active_booking_id", bookingData.booking_number || bookingNumber)
      localStorage.setItem("booking_devotees_count", String(visitorsCount))

      try {
        const stored = localStorage.getItem("khatu_bookings")
        const currentList = stored ? JSON.parse(stored) : []
        currentList.unshift(newBooking)
        localStorage.setItem("khatu_bookings", JSON.stringify(currentList))
      } catch (e) {}

      navigate("booking-success" as any)
    } catch (err: any) {
      console.error(err)
      // Fallback local save on error
      const bookingNumber = `KSJ-GRP-${Math.floor(10000 + Math.random() * 90000)}`
      let bookingDateObj = new Date()
      if (bookingDate) {
        const parsed = Date.parse(bookingDate)
        if (!isNaN(parsed)) {
          bookingDateObj = new Date(parsed)
        }
      }
      const newBooking = {
        id: bookingNumber,
        date: bookingDate || bookingDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        day: bookingDateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        visitors: members.length,
        name: formData.groupName,
        leaderName: formData.leaderName,
        phone: formData.leaderPhone,
        members: members,
        status: "upcoming" as const
      }
      localStorage.setItem("latest_booking", JSON.stringify(newBooking))
      localStorage.setItem("booking_devotees_count", String(members.length))
      try {
        const stored = localStorage.getItem("khatu_bookings")
        const currentList = stored ? JSON.parse(stored) : []
        currentList.unshift(newBooking)
        localStorage.setItem("khatu_bookings", JSON.stringify(currentList))
      } catch (e) {}
      navigate("booking-success" as any)
    } finally {
      setIsSubmitting(false)
    }
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

      {/* Booking date banner */}
      {bookingDate && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-white shadow-sm">
          <Icon name="CalendarCheck" className="size-5" />
          <div>
            <p className="text-xs text-white/80">{t("screens.passengerDetails.darshanDate")}</p>
            <p className="font-heading text-sm font-bold">{bookingDate}</p>
          </div>
          <button
            onClick={() => navigate("book")}
            className="ml-auto rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold transition hover:bg-white/30"
          >
            {t("screens.passengerDetails.change")}
          </button>
        </div>
      )}

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
                errors.groupName && "border-red-400 focus:border-red-500"
              )}
            />
            <AnimatePresence>
              {errors.groupName && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 text-xs text-red-500">{errors.groupName}</motion.p>
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
                errors.leaderName && "border-red-400 focus:border-red-500"
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
                  errors.leaderPhone && "border-red-400 focus:border-red-500"
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

          <h3 className="font-heading text-lg font-bold text-[#1A120B] flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-[#D97706]/10 text-[#D97706]">
              <Icon name="Users" className="size-4" />
            </span>
            Devotees Roster Details (Min 7 Required)
          </h3>

          {/* Devotees List Cards */}
          <div className="space-y-4">
            {members.map((m, idx) => (
              <div key={m.id} className="rounded-2xl border border-[#E8D5B7] bg-[#FFF8F0]/30 p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#D97706] uppercase tracking-wider">Devotee #{idx + 1}</span>
                  {members.length > 7 && (
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                    >
                      <Icon name="Trash2" className="size-3.5" /> Remove
                    </button>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-[#6b5440] uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name as in Govt ID"
                    value={m.name}
                    onChange={(e) => updateMember(m.id, "name", e.target.value)}
                    className={cn(
                      "w-full rounded-lg border border-[#E8D5B7] bg-white py-2 px-3 text-xs font-semibold text-[#1A120B] outline-none",
                      errors[`member-${m.id}-name`] && "border-red-400"
                    )}
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6b5440] uppercase mb-1">Age</label>
                    <input
                      type="number"
                      required
                      placeholder="Age"
                      min={0}
                      max={120}
                      value={m.age}
                      onChange={(e) => updateMember(m.id, "age", e.target.value)}
                      className={cn(
                        "w-full rounded-lg border border-[#E8D5B7] bg-white py-2 px-3 text-xs font-semibold text-[#1A120B] outline-none",
                        errors[`member-${m.id}-age`] && "border-red-400"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6b5440] uppercase mb-1">Gender</label>
                    <select
                      value={m.gender}
                      onChange={(e) => updateMember(m.id, "gender", e.target.value)}
                      className={cn(
                        "w-full rounded-lg border border-[#E8D5B7] bg-white py-2 px-3 text-xs font-semibold text-[#1A120B] outline-none",
                        errors[`member-${m.id}-gender`] && "border-red-400"
                      )}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Identity Proof */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6b5440] uppercase mb-1">ID Proof Type</label>
                    <select
                      value={m.identityProofType || ""}
                      onChange={(e) => updateMember(m.id, "identityProofType", e.target.value)}
                      className="w-full rounded-lg border border-[#E8D5B7] bg-white py-2 px-3 text-xs font-semibold text-[#1A120B] outline-none"
                    >
                      <option value="">Select ID Type</option>
                      <option value="Aadhar Card">Aadhar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6b5440] uppercase mb-1">ID Proof Number</label>
                    <input
                      type="text"
                      placeholder="ID Number"
                      value={m.identityProofNumber || ""}
                      onChange={(e) => updateMember(m.id, "identityProofNumber", e.target.value)}
                      className="w-full rounded-lg border border-[#E8D5B7] bg-white py-2 px-3 text-xs font-semibold text-[#1A120B] outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMember}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#D97706] text-[#D97706] hover:bg-[#FFF3E0]/30 w-full justify-center py-3.5 font-bold text-xs transition"
          >
            <Icon name="UserPlus" className="size-4" /> Add Devotee Member
          </button>

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
            Register Group Booking ({members.length} Devotees)
            <Icon name="ArrowRight" className="size-5" />
          </>
        )}
      </button>
    </div>
  )
}
