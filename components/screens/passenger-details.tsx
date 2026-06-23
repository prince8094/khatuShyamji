"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import type { ScreenKey } from "@/lib/data"

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

const notes = [
  "The ID card will be required during journey.",
  "Please fill your current citizenship status while booking the ticket. Incorrect information may attract action under the Foreigners Act, 1946.",
  "Darshan is free of charge. No fees will be collected.",
  "Mobile phones and large bags are not allowed inside the sanctum.",
  "Reach the temple at least 30 minutes before your slot time.",
]

export function PassengerDetailsScreen({
  navigate,
  bookingDate,
}: {
  navigate: (s: ScreenKey) => void
  bookingDate: string | null
}) {
  const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger(1)])
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [showGst, setShowGst] = useState(false)
  const [gstin, setGstin] = useState("")
  const [gstDetails, setGstDetails] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updatePassenger = (id: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
    // Clear error for this field
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`${id}-${field}`]
      return next
    })
  }

  const addPassenger = (isChild = false) => {
    const newId = Math.max(...passengers.map((p) => p.id)) + 1
    setPassengers((prev) => [...prev, emptyPassenger(newId, isChild)])
  }

  const removePassenger = (id: number) => {
    if (passengers.length <= 1) return
    setPassengers((prev) => prev.filter((p) => p.id !== id))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    passengers.forEach((p) => {
      if (!p.name.trim()) newErrors[`${p.id}-name`] = "Name is required"
      else if (p.name.trim().length < 3 || p.name.trim().length > 60)
        newErrors[`${p.id}-name`] = "Please enter a valid name between 3 and 60 characters"
      if (!p.age) newErrors[`${p.id}-age`] = "Age is required"
      if (!p.gender) newErrors[`${p.id}-gender`] = "Gender is required"
    })

    if (!mobile.trim()) newErrors.mobile = "Mobile number is required"
    else if (!/^\d{10}$/.test(mobile.trim())) newErrors.mobile = "Enter a valid 10-digit mobile number"

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      navigate("qr")
    }, 2000)
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Booking date banner */}
      {bookingDate && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] px-4 py-3 text-white shadow-sm">
          <Icon name="CalendarCheck" className="size-5" />
          <div>
            <p className="text-xs text-white/80">Darshan Date</p>
            <p className="font-heading text-sm font-bold">{bookingDate}</p>
          </div>
          <button
            onClick={() => navigate("book")}
            className="ml-auto rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold transition hover:bg-white/30"
          >
            Change
          </button>
        </div>
      )}

      {/* Notes section */}
      <section className="rounded-2xl border border-[#FFE0B2] bg-[#FFF8E7] p-4">
        <p className="mb-2 flex items-center gap-2 font-heading text-sm font-bold text-[#8a4b12]">
          <Icon name="Info" className="size-4 text-[#FF8C00]" />
          Notes:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          {notes.map((note, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-[#8a5a22]">
              {note}
            </li>
          ))}
        </ol>
      </section>

      {/* Passenger details */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
          <Icon name="Users" className="size-5 text-[#FF8C00]" />
          Passenger Details
        </h3>

        {passengers.map((p, idx) => (
          <div
            key={p.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm font-bold text-foreground">
                {p.isChild ? "Child" : "Passenger"} {idx + 1}
              </p>
              {passengers.length > 1 && (
                <button
                  onClick={() => removePassenger(p.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-destructive transition hover:bg-red-50"
                >
                  <Icon name="Trash2" className="size-3.5" />
                  Remove
                </button>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Full Name as per Govt. ID
              </label>
              <input
                type="text"
                placeholder="Enter full name"
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
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="Age"
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
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Gender
                </label>
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(p.id, "gender", e.target.value)}
                  className={cn(errors[`${p.id}-gender`] && "!border-red-400")}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors[`${p.id}-gender`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`${p.id}-gender`]}</p>
                )}
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Nationality
              </label>
              <select
                value={p.nationality}
                onChange={(e) => updatePassenger(p.id, "nationality", e.target.value)}
              >
                <option value="India">India</option>
                <option value="Nepal">Nepal</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        ))}

        {/* Add passenger / child buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => addPassenger(false)}
            className="flex items-center gap-1.5 rounded-xl border border-[#FFB74D] bg-[#FFF8E7] px-4 py-2.5 text-sm font-semibold text-[#FF8C00] transition hover:bg-[#FFF3E0] active:scale-[0.98]"
          >
            <Icon name="Plus" className="size-4" />
            + Add Passenger
          </button>
          <button
            onClick={() => addPassenger(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#FFB74D] bg-[#FFF8E7] px-4 py-2.5 text-sm font-semibold text-[#FF8C00] transition hover:bg-[#FFF3E0] active:scale-[0.98]"
          >
            <Icon name="Baby" className="size-4" />
            + Add Child
          </button>
        </div>

        <p className="text-xs text-muted-foreground italic">
          *Children under 5 years of age shall be contact free and no purchase of any ticket is required. (If no separate berth is opted.)
        </p>
      </section>

      {/* Contact details */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
          <Icon name="Phone" className="size-5 text-[#FF8C00]" />
          Contact Details
        </h3>

        <p className="text-xs text-muted-foreground">
          (Ticket details will be sent to email and registered mobile number)
        </p>

        {/* Mobile */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Mobile Number
          </label>
          <div className="flex gap-2">
            <span className="flex items-center justify-center rounded-xl border border-border bg-[#FFF3E0] px-3 text-sm font-semibold text-[#FF8C00]">
              +91
            </span>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
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
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter email address"
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

      {/* Optional GST section */}
      <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          onClick={() => setShowGst(!showGst)}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-[#FFF8E7]"
        >
          <span className="flex items-center gap-2">
            <Icon name="FileText" className="size-5 text-[#FF8C00]" />
            <span className="font-heading text-sm font-bold text-foreground">
              GST Details (Optional)
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-[#FFF3E0] px-2 py-0.5 text-[10px] font-semibold text-[#FF8C00]">
              Optional
            </span>
            <Icon
              name={showGst ? "ChevronUp" : "ChevronDown"}
              className="size-4 text-muted-foreground"
            />
          </span>
        </button>

        {showGst && (
          <div className="border-t border-border px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  GST Identification Number (GSTIN)
                </label>
                <input
                  type="text"
                  placeholder="Enter GSTIN"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  GST Details
                </label>
                <input
                  type="text"
                  placeholder="Company / Business Name"
                  value={gstDetails}
                  onChange={(e) => setGstDetails(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] py-4 font-heading text-base font-bold text-white shadow-lg shadow-[#FF8C00]/20 transition active:scale-[0.99] disabled:opacity-60 hover:shadow-xl"
      >
        {isSubmitting ? (
          <>
            <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Processing...
          </>
        ) : (
          <>
            Confirm Booking
            <Icon name="ArrowRight" className="size-5" />
          </>
        )}
      </button>
    </div>
  )
}
