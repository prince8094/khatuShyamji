"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import type { ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useNavigation } from "@/lib/contexts/NavigationContext"

type Passenger = {
  id: number
  name: string
  age: string
  gender: string
  nationality: string
  isChild: boolean
}

const emptyPassenger = (id: number, isChild = false): Passenger => ({
  id,
  name: "",
  age: "",
  gender: "",
  nationality: "India",
  isChild,
})

export function PassengerDetailsScreen({
  navigate,
  bookingDate,
}: {
  navigate: (s: ScreenKey) => void
  bookingDate: string | null
}) {
  const { lang, t, tObject } = useLanguage()
  const { goBack } = useNavigation()
  const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger(1)])
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Prefill passengers array based on selected count
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("booking_devotees_count")
      if (savedCount) {
        const count = Number(savedCount)
        const list = Array.from({ length: count }, (_, i) => emptyPassenger(i + 1))
        setPassengers(list)
      }
    }
  }, [])

  const updatePassenger = (id: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`${id}-${field}`]
      return next
    })
  }


  const removePassenger = (id: number) => {
    if (passengers.length <= 1) return
    setPassengers((prev) => prev.filter((p) => p.id !== id))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    passengers.forEach((p) => {
      if (!p.name.trim()) newErrors[`${p.id}-name`] = t("screens.passengerDetails.nameIsRequired")
      else if (p.name.trim().length < 3 || p.name.trim().length > 60)
        newErrors[`${p.id}-name`] = t("screens.passengerDetails.pleaseEnterAValidName")
      if (!p.age) newErrors[`${p.id}-age`] = t("screens.passengerDetails.ageIsRequired")
      if (!p.gender) newErrors[`${p.id}-gender`] = t("screens.passengerDetails.genderIsRequired")
    })

    if (!mobile.trim()) newErrors.mobile = t("screens.passengerDetails.mobileNumberIsRequired")
    else if (!/^\d{10}$/.test(mobile.trim())) newErrors.mobile = t("screens.passengerDetails.enterAValid10DigitNumber")

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = t("screens.passengerDetails.enterAValidEmailAddress")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate("qr")
    }, 2000)
  }

  const notes = tObject("booking.passenger.notes") || []

  return (
    <div className="space-y-5 pb-8">
      {/* Back button */}
      <button
        onClick={goBack}
        className="mb-2 flex items-center gap-1 text-sm font-bold text-[#6b5440] hover:text-[#D97706]"
      >
        <Icon name="ArrowLeft" className="size-4" />
        Back
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

      {/* Notes section */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 flex items-center gap-2 font-heading text-sm font-bold text-primary">
          <Icon name="Info" className="size-4" />
          {t("screens.passengerDetails.notes")}
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          {(notes as string[]).map((note: string, i: number) => (
            <li key={i} className="text-[13px] leading-relaxed text-muted-foreground">
              {note}
            </li>
          ))}
        </ol>
      </section>

      {/* Passenger details */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
          <Icon name="Users" className="size-5 text-primary" />
          {t("screens.passengerDetails.passengerDetails")}
        </h3>

        {passengers.map((p, idx) => (
          <div
            key={p.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm font-bold text-foreground">
                {p.isChild ? t("screens.passengerDetails.child") : t("screens.passengerDetails.passenger")} {idx + 1}
              </p>
              {passengers.length > 1 && (
                <button
                  onClick={() => removePassenger(p.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-destructive transition hover:bg-red-50"
                >
                  <Icon name="Trash2" className="size-3.5" />
                  {t("screens.passengerDetails.remove")}
                </button>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("screens.passengerDetails.fullNameAsPerGovtId")}
              </label>
              <input
                type="text"
                placeholder={t("screens.passengerDetails.enterFullName")}
                value={p.name}
                onChange={(e) => updatePassenger(p.id, "name", e.target.value)}
                className={cn(errors[`${p.id}-name`] && "!border-red-400")}
              />
              {errors[`${p.id}-name`] && (
                <p className="mt-1 text-xs text-red-500">{errors[`${p.id}-name`]}</p>
              )}
            </div>

            {/* Age + Gender row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("screens.passengerDetails.age")}
                </label>
                <input
                  type="number"
                  placeholder={t("screens.passengerDetails.age")}
                  min={0}
                  max={120}
                  value={p.age}
                  onChange={(e) => updatePassenger(p.id, "age", e.target.value)}
                  className={cn(errors[`${p.id}-age`] && "!border-red-400")}
                />
                {errors[`${p.id}-age`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`${p.id}-age`]}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("screens.passengerDetails.gender")}
                </label>
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(p.id, "gender", e.target.value)}
                  className={cn(errors[`${p.id}-gender`] && "!border-red-400")}
                >
                  <option value="">{t("screens.passengerDetails.select")}</option>
                  <option value="male">{t("screens.passengerDetails.male")}</option>
                  <option value="female">{t("screens.passengerDetails.female")}</option>
                  <option value="other">{t("screens.passengerDetails.other")}</option>
                </select>
                {errors[`${p.id}-gender`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`${p.id}-gender`]}</p>
                )}
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("screens.passengerDetails.nationality")}
              </label>
              <select
                value={p.nationality}
                onChange={(e) => updatePassenger(p.id, "nationality", e.target.value)}
              >
                <option value="India">{t("screens.passengerDetails.india")}</option>
                <option value="Nepal">{t("screens.passengerDetails.nepal")}</option>
                <option value="Other">{t("screens.passengerDetails.otherOption")}</option>
              </select>
            </div>
          </div>
        ))}


        <p className="text-xs text-muted-foreground italic">
          *{t("screens.passengerDetails.childrenUnder5YearsOfAgeShallBeContactFre")}
        </p>
      </section>

      {/* Contact details */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
          <Icon name="Phone" className="size-5 text-primary" />
          {t("screens.passengerDetails.contactDetails")}
        </h3>

        <p className="text-xs text-muted-foreground">
          {t("screens.passengerDetails.ticketDetailsWillBeSentToEmailAndRegistere")}
        </p>

        {/* Mobile */}
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t("screens.passengerDetails.mobileNumber")}
          </label>
          <div className="flex gap-2">
            <span className="flex items-center justify-center rounded-xl border border-border bg-secondary px-3 text-sm font-bold text-primary">
              +91
            </span>
            <input
              type="tel"
              placeholder={t("screens.passengerDetails.enter10DigitMobileNumber")}
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value)
                setErrors((prev) => { const n = { ...prev }; delete n.mobile; return n })
              }}
              maxLength={10}
              className={cn("flex-1", errors.mobile && "!border-red-400")}
            />
          </div>
          {errors.mobile && (
            <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t("screens.passengerDetails.emailAddress")}
          </label>
          <input
            type="email"
            placeholder={t("screens.passengerDetails.enterEmailAddress")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((prev) => { const n = { ...prev }; delete n.email; return n })
            }}
            className={cn(errors.email && "!border-red-400")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>
      </section>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-4 font-heading text-base font-bold text-white shadow-lg shadow-primary/20 transition active:scale-[0.99] disabled:opacity-60 hover:shadow-xl"
      >
        {isSubmitting ? (
          <>
            <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t("screens.passengerDetails.processing")}
          </>
        ) : (
          <>
            {t("screens.passengerDetails.confirmBooking")}
            <Icon name="ArrowRight" className="size-5" />
          </>
        )}
      </button>
    </div>
  )
}
