"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import type { ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { devoteeApi } from "@/lib/api-client"

type BookingType = "solo" | "group" | null

export function BookDarshanScreen({
  navigate,
  navigateWithDate,
}: {
  navigate: (s: ScreenKey) => void
  navigateWithDate: (s: ScreenKey, date: string) => void
}) {
  const { t, tObject } = useLanguage()
  const MONTHS = tObject("booking.months") || [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  const WEEKDAYS = tObject("booking.weekdays") || ["S", "M", "T", "W", "T", "F", "S"]
  const [bookingType, setBookingType] = useState<BookingType>(null)
  const [month, setMonth] = useState(5) // June (0-indexed)
  const year = 2026
  const [selected, setSelected] = useState<number | null>(28)
  const [devoteesCount, setDevoteesCount] = useState<number>(1)
  const [bookedDates, setBookedDates] = useState<string[]>([])

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const bookings = await devoteeApi.getDarshanSlots()
        const totals: Record<string, number> = {}
        bookings.forEach((b: any) => {
          const d = b.booking_date
          totals[d] = (totals[d] || 0) + (b.visitor_count || 1)
        })
        const full: string[] = []
        const MAX_DAILY_CAPACITY = 100 // Block slot if daily manifest matches limit
        Object.entries(totals).forEach(([d, count]) => {
          if (count >= MAX_DAILY_CAPACITY) {
            full.push(d)
          }
        })
        setBookedDates(full)
      } catch (err) {
        console.error("Failed to fetch slots count:", err)
      }
    }
    fetchSlots()
  }, [])

  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay()
    const total = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = Array.from({ length: first }, () => null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
  }, [month])

  const today = 23

  const handleContinue = () => {
    if (bookingType === "group") {
      navigate("group-booking")
      return
    }
    if (!selected) return
    const dateStr = `${selected} ${MONTHS[month]} ${year}`
    localStorage.setItem("booking_devotees_count", String(devoteesCount))
    navigateWithDate("passenger-details", dateStr)
  }

  const isContinueDisabled =
    !bookingType ||
    (bookingType === "solo" && !selected)

  return (
    <div className="space-y-6 pb-36 md:pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A120B] to-[#0A0A1A] p-8 text-center shadow-lg">
        <div className="absolute inset-0 bg-[url('/images/mandala-pattern.png')] bg-cover opacity-10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D97706]/20 to-transparent blur-2xl" />
        <div className="relative z-10">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Icon name="CalendarCheck" className="size-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-wide text-[#D4AF37]">{t("screens.bookDarshan.bookYourDarshan")}</h2>
          <p className="mt-1 text-sm text-white/70 uppercase tracking-wider">{t("screens.bookDarshan.planYourSacredVisit")}</p>
        </div>
      </div>

      {/* Step 0: Booking Type Selection */}
      <section className="rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF8F0] to-transparent pointer-events-none" />

        <div className="relative z-10 mb-5">
          <span className="inline-block rounded-full bg-[#D97706]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D97706] mb-2">Step 1</span>
          <h3 className="font-heading text-xl font-bold text-[#1A120B]">
            {t("screens.bookDarshan.selectBookingType")}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 relative z-10">
          {/* Solo / Family */}
          <button
            onClick={() => { setBookingType("solo"); }}
            className={cn(
              "group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200",
              bookingType === "solo"
                ? "border-[#D97706] bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E0] shadow-md"
                : "border-[#E8D5B7] bg-white hover:border-[#D4AF37]/60 hover:bg-[#FFF8F0]"
            )}
          >
            {bookingType === "solo" && (
              <span className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-[#D97706] text-white">
                <Icon name="Check" className="size-3.5" />
              </span>
            )}
            <span className={cn(
              "grid size-12 place-items-center rounded-2xl transition-all",
              bookingType === "solo"
                ? "bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white shadow-md"
                : "bg-[#FFF3E0] text-[#D97706]"
            )}>
              <Icon name="Users" className="size-6" />
            </span>
            <div>
              <p className="font-heading text-base font-bold text-[#1A120B]">{t("screens.bookDarshan.soloFamily")}</p>
              <p className="text-xs text-[#6b5440] mt-0.5 leading-relaxed">{t("screens.bookDarshan.upTo6MembersStandardQrPass")}</p>
            </div>
          </button>

          {/* Group Booking */}
          <button
            onClick={() => setBookingType("group")}
            className={cn(
              "group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200",
              bookingType === "group"
                ? "border-[#D97706] bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E0] shadow-md"
                : "border-[#E8D5B7] bg-white hover:border-[#D4AF37]/60 hover:bg-[#FFF8F0]"
            )}
          >
            {bookingType === "group" && (
              <span className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-[#D97706] text-white">
                <Icon name="Check" className="size-3.5" />
              </span>
            )}
            <span className={cn(
              "grid size-12 place-items-center rounded-2xl transition-all",
              bookingType === "group"
                ? "bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white shadow-md"
                : "bg-[#FFF3E0] text-[#D97706]"
            )}>
              <Icon name="UserPlus" className="size-6" />
            </span>
            <div>
              <p className="font-heading text-base font-bold text-[#1A120B]">{t("screens.bookDarshan.groupBooking")}</p>
              <p className="text-xs text-[#6b5440] mt-0.5 leading-relaxed">{t("screens.bookDarshan.7MembersUnifiedGroupQrPass")}</p>
            </div>
          </button>
        </div>
      </section>

      {/* For Group: show proceed immediately */}
      <AnimatePresence>
        {bookingType === "group" && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#8B1E1E]/10 to-transparent p-5 shadow-sm"
          >
            <div className="flex items-center gap-2.5 text-[#8B1E1E] font-bold text-sm mb-2">
              <Icon name="Info" className="size-4" />
              <span>{t("screens.bookDarshan.groupBookingSelected")}</span>
            </div>
            <p className="text-xs text-[#6b5440] leading-relaxed">
              {t("screens.bookDarshan.for7DevoteesAUnifiedGroupQrPassIsIssuedY")}
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* For Solo/Family: show devotees count + calendar */}
      <AnimatePresence>
        {bookingType === "solo" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Step 2: Devotees Count */}
            <section className="rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF8F0] to-transparent pointer-events-none" />
              <div className="relative z-10 mb-4">
                <span className="inline-block rounded-full bg-[#D97706]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D97706] mb-2">Step 2</span>
                <h3 className="font-heading text-xl font-bold text-[#1A120B]">
                  {t("screens.bookDarshan.howManyDevotees")}
                </h3>
              </div>

              <div className="flex items-center justify-center gap-6 py-4 relative z-10">
                <button
                  onClick={() => setDevoteesCount(Math.max(1, devoteesCount - 1))}
                  className="grid size-12 place-items-center rounded-full bg-white border border-[#E8D5B7] text-[#D97706] shadow-sm transition hover:border-[#D4AF37] active:scale-95"
                >
                  <Icon name="Minus" className="size-5" />
                </button>
                <div className="w-20 text-center">
                  <span className="font-heading text-4xl font-extrabold text-[#D97706]">{devoteesCount}</span>
                </div>
                <button
                  onClick={() => setDevoteesCount(Math.min(6, devoteesCount + 1))}
                  className="grid size-12 place-items-center rounded-full bg-white border border-[#E8D5B7] text-[#D97706] shadow-sm transition hover:border-[#D4AF37] active:scale-95"
                >
                  <Icon name="Plus" className="size-5" />
                </button>
              </div>
              <p className="text-center text-xs text-[#6b5440] font-semibold">
                {t("screens.bookDarshan.standardBookingPassUpTo6Devotees")}
              </p>
            </section>

            {/* Step 3: Calendar */}
            <motion.section
              className="rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-md relative overflow-hidden"
            >
              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div>
                  <span className="inline-block rounded-full bg-[#D97706]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D97706] mb-2">Step 3</span>
                  <h3 className="font-heading text-xl font-bold text-[#1A120B]">
                    {t("screens.bookDarshan.selectDate")}
                  </h3>
                </div>
                {/* Month controls */}
                <div className="flex items-center gap-3 rounded-full border border-[#E8D5B7] bg-[#FFF8F0] px-3 py-1.5 shadow-inner">
                  <button
                    onClick={() => setMonth((m) => Math.max(5, m - 1))}
                    className="grid size-8 place-items-center rounded-full text-[#D97706] transition hover:bg-white disabled:opacity-30"
                    disabled={month <= 5}
                  >
                    <Icon name="ChevronLeft" className="size-4" />
                  </button>
                  <span className="font-heading text-sm font-bold text-[#1A120B] w-24 text-center">
                    {MONTHS[month]} {year}
                  </span>
                  <button
                    onClick={() => setMonth((m) => Math.min(7, m + 1))}
                    className="grid size-8 place-items-center rounded-full text-[#D97706] transition hover:bg-white disabled:opacity-30"
                    disabled={month >= 7}
                  >
                    <Icon name="ChevronRight" className="size-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center mb-4 border-b border-[#E8D5B7] pb-2">
                {(WEEKDAYS as string[]).map((d: string, i: number) => (
                  <span key={i} className="text-[10px] font-bold text-[#6b5440] uppercase">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((d, i) => {
                  if (d === null) return <span key={i} />
                  const isPast = d < today
                  const dateStrDb = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
                  const isBooked = bookedDates.includes(dateStrDb)
                  const disabled = isPast || isBooked
                  const isSel = selected === d
                  return (
                    <button
                      key={i}
                      disabled={disabled}
                      onClick={() => setSelected(d)}
                      className={cn(
                        "relative grid aspect-square place-items-center rounded-xl font-heading text-base font-bold transition-all duration-200",
                        isSel && "bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white shadow-[0_4px_15px_rgba(212,175,55,0.4)] scale-110 z-10",
                        !isSel && !disabled && "bg-transparent text-[#1A120B] border border-transparent hover:border-[#D4AF37]/40 hover:bg-[#FFF8F0]",
                        isBooked && "text-[#6b5440]/40 line-through decoration-[#8B1E1E]/30",
                        isPast && !isBooked && "text-[#6b5440]/30",
                      )}
                    >
                      {d}
                      {d === today && !isSel && (
                        <span className="absolute bottom-1.5 size-1 rounded-full bg-[#D4AF37]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 bg-white border-t border-[#E8D5B7] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:static md:bg-transparent md:border-0 md:p-0 md:shadow-none md:bottom-auto">
        <button
          disabled={isContinueDisabled}
          onClick={handleContinue}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#1A120B] to-[#2A1D13] py-4 text-base font-bold text-[#D4AF37] shadow-xl transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-white/5 opacity-0 transition group-hover:opacity-100" />
          {bookingType === "group"
            ? t("screens.bookDarshan.proceedToGroupBooking")
            : t("screens.bookDarshan.confirmProceed")}
          <Icon name="ArrowRight" className="size-5" />
        </button>
      </div>
    </div>
  )
}
