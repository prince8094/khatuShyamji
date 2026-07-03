"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Om } from "@/components/shared"
import { type ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { devoteeApi } from "@/lib/api-client"

type ProfileUser = {
  name: string
  phone: string
  initials: string
  photo?: string
  email?: string
  address?: string
  dob?: string
  gender?: string
}

const menu: { labelKey: string; icon: string; key?: ScreenKey }[] = [
  { labelKey: "navigation.items.bookings", icon: "Ticket", key: "bookings" },
  { labelKey: "navigation.items.notifications", icon: "Bell", key: "notifications" },
  { labelKey: "navigation.items.help-support", icon: "CircleHelp", key: "help-support" },
  { labelKey: "navigation.items.temple", icon: "Landmark", key: "temple" },
]

const AVATAR_PRESETS = [
  {
    id: "mor-pankh",
    nameKey: "profile.edit.presets.morPankh",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#E0F2F1"/>
      <path d="M32 8C22 20 20 40 32 56C44 40 42 20 32 8Z" fill="#00796B" opacity="0.85"/>
      <path d="M32 16C26 24 25 36 32 46C39 36 38 24 32 16Z" fill="#00ACC1"/>
      <path d="M32 24C28 29 28 35 32 40C36 35 36 29 32 24Z" fill="#FBC02D"/>
      <circle cx="32" cy="32" r="4" fill="#0288D1"/>
      <path d="M32 54V60" stroke="#004D40" stroke-width="2"/>
    </svg>`
  },
  {
    id: "diya",
    nameKey: "profile.edit.presets.diya",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#FFF3E0"/>
      <path d="M14 36C14 46 22 50 32 50C42 50 50 46 50 36C50 32 42 32 32 32C22 32 14 32 14 36Z" fill="#D97706"/>
      <path d="M22 36C22 42 26 44 32 44C38 44 42 42 42 36C42 34 38 34 32 34C26 34 22 34 22 36Z" fill="#F59E0B"/>
      <path d="M32 12C32 12 26 22 28 28C30 31 34 31 36 28C38 22 32 12 32 12Z" fill="#FFEB3B"/>
      <path d="M32 18C32 18 29 24 30 27C31 29 33 29 34 27C35 24 32 18 32 18Z" fill="#FF5722"/>
    </svg>`
  },
  {
    id: "om",
    nameKey: "profile.edit.presets.om",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#FFFDE7"/>
      <circle cx="32" cy="32" r="28" stroke="#D4AF37" stroke-width="1.5"/>
      <path d="M24 38c0-4.5 3.5-7.7 8-7.7 4.2 0 7.3 2.9 7.3 6.7 0 3.5-2.6 6-5.8 6-2.4 0-4.3-1.5-4.3-3.6 0-1.7 1.2-3 2.8-3 1.1 0 1.9.6 2.4 1.4" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.5 29.7c1.6-2 4.2-3.2 7-3.2 3 0 5.4 1.3 7 3.3M42 31.6c3.2 1 5.1 3.6 5.1 6.8 0 3.5-2.4 6-5.5 6" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M39.4 22.7c1.4-1 3.2-1.5 5.1-1.5 1.5 0 3 .3 4.2 1" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="46.1" cy="18.5" r="1.7" fill="#D97706"/>
    </svg>`
  },
  {
    id: "flute",
    nameKey: "profile.edit.presets.flute",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#E8F5E9"/>
      <path d="M12 42L48 18M10 40L8 42" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>
      <circle cx="20" cy="36" r="1.5" fill="#1B5E20"/>
      <circle cx="26" cy="32" r="1.5" fill="#1B5E20"/>
      <circle cx="32" cy="28" r="1.5" fill="#1B5E20"/>
      <circle cx="38" cy="24" r="1.5" fill="#1B5E20"/>
      <circle cx="44" cy="20" r="1.5" fill="#1B5E20"/>
      <path d="M42 20C42 20 46 12 50 14C54 16 48 24 48 24" stroke="#00796B" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M44 18C44 18 47 11 51 12C55 13 49 22 49 22" stroke="#00838F" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  }
]

export function ProfileScreen({
  navigate,
  onLogout,
  currentUser,
  onUpdateUser,
}: {
  navigate: (s: ScreenKey) => void
  onLogout?: () => void
  currentUser?: ProfileUser | null
  onUpdateUser?: (user: ProfileUser) => void
}) {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Standard fallback data
  const displayUser: ProfileUser = currentUser || {
    name: "Nand Kumar",
    phone: "+91 98290 12345",
    initials: "NK",
    email: "nand.kumar@devotee.com",
    address: "12, Shyam Nagar, Sikar, Rajasthan",
    dob: "1990-08-15",
    gender: "Male",
  }

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Form Field States
  const [editName, setEditName] = useState(displayUser.name)
  const [editPhone, setEditPhone] = useState(displayUser.phone.replace("+91 ", ""))
  const [editPhoto, setEditPhoto] = useState(displayUser.photo || "")
  const [editEmail, setEditEmail] = useState(displayUser.email || "")
  const [editAddress, setEditAddress] = useState(displayUser.address || "")
  const [editDob, setEditDob] = useState(displayUser.dob || "")
  const [editGender, setEditGender] = useState(displayUser.gender || "")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const stats = [
    { v: "12", lKey: "profile.card.stats.darshans" },
    { v: "3", lKey: "profile.card.stats.upcoming" },
    { v: "5★", lKey: "profile.card.stats.devotee" },
  ]

  // File upload reader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditPhoto(reader.result as string)
      };
      reader.readAsDataURL(file)
    }
  }

  const handleSelectPreset = (svgContent: string) => {
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`
    setEditPhoto(dataUri)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!editName.trim()) {
      errs.name = t("profile.edit.errors.name")
    }
    if (!editPhone.trim()) {
      errs.phone = t("profile.edit.errors.phone")
    } else if (!/^\d{10}$/.test(editPhone)) {
      errs.phone = t("profile.edit.errors.invalidPhone")
    }
    if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      errs.email = t("profile.edit.errors.email")
    }
    if (!editAddress.trim()) {
      errs.address = t("profile.edit.errors.address")
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const newInitials = editName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DV"

    const updatedUser: ProfileUser = {
      name: editName,
      phone: `+91 ${editPhone}`,
      initials: newInitials,
      photo: editPhoto,
      email: editEmail,
      address: editAddress,
      dob: editDob,
      gender: editGender,
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        await devoteeApi.updateProfile({
          name: editName,
          email: editEmail,
          address: editAddress,
          dob: editDob || null,
          gender: editGender || null,
          photo_url: editPhoto || null
        })
      }

      if (onUpdateUser) {
        onUpdateUser(updatedUser)
      }

      setIsEditing(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err: any) {
      console.error("Failed to update profile in database", err)
      alert("Failed to save changes: " + (err.message || err))
    }
  }

  const handleCancel = () => {
    setEditName(displayUser.name)
    setEditPhone(displayUser.phone.replace("+91 ", ""))
    setEditPhoto(displayUser.photo || "")
    setEditEmail(displayUser.email || "")
    setEditAddress(displayUser.address || "")
    setEditDob(displayUser.dob || "")
    setEditGender(displayUser.gender || "")
    setErrors({})
    setIsEditing(false)
  }

  return (
    <div className="relative space-y-5 pb-10">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -60, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl"
          >
            <Icon name="CheckCircle2" className="size-5 shrink-0" />
            <span>{t("profile.edit.toastSuccess")}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isEditing ? (
        <>
          {/* Premium Profile card */}
          <section
            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#D97706]/10"
            style={{ backgroundImage: "linear-gradient(135deg,#D97706,#D4AF37 60%,#FFB74D)" }}
          >
            <div
              className="absolute inset-0 opacity-[0.10]"
              style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "220px" }}
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-4">
              {displayUser.photo ? (
                <img
                  src={displayUser.photo}
                  alt={displayUser.name}
                  className="size-16 rounded-full object-cover border-2 border-white shadow-md bg-white shrink-0"
                />
              ) : (
                <span className="grid size-16 place-items-center rounded-full bg-white font-heading text-2xl font-bold text-[#D97706] shadow shrink-0">
                  {displayUser.initials}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-heading text-xl font-bold tracking-wide">{displayUser.name}</p>
                <p className="text-sm text-white/95 font-medium">{displayUser.phone}</p>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-white/20 text-lg">
                <Om />
              </span>
            </div>

            {/* Stats block */}
            <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-black/15 p-3 text-center backdrop-blur-sm">
              {stats.map((s) => (
                <div key={s.lKey}>
                  <p className="font-heading text-lg font-bold text-white">{s.v}</p>
                  <p className="text-[11px] text-white/80 font-medium">{t(s.lKey)}</p>
                </div>
              ))}
            </div>

            {/* Edit Profile Button - Prominent */}
            <button
              onClick={() => setIsEditing(true)}
              className="relative z-10 mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 py-3 font-heading text-sm font-bold text-white transition active:scale-[0.98]"
            >
              <Icon name="UserPen" className="size-4" />
              {t("profile.card.editBtn")}
            </button>
          </section>

          {/* Menu Options */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300">
            {menu.map((m, i) => (
              <button
                key={m.labelKey}
                onClick={() => m.key && navigate(m.key)}
                className={`group flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#D97706]/5 active:bg-secondary/30 ${
                  i !== menu.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary group-hover:scale-105 transition-transform">
                  <Icon name={m.icon} className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-foreground group-hover:text-[#D97706] transition-colors">{t(m.labelKey)}</span>
                </span>
                <Icon name="ChevronRight" className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </section>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 font-heading text-sm font-bold text-red-600 active:scale-[0.99] transition duration-300 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Icon name="LogOut" className="size-5" />
            {t("common.logout")}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {t("app.footer.version")}
          </p>
        </>
      ) : (
        /* EDIT PROFILE FORM SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-heading text-lg font-bold text-foreground">
              {t("profile.edit.title")}
            </h2>
            <span className="text-[#D97706]">
              <Om className="size-6" />
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Avatar Select & Photo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("profile.edit.photoLabel")}
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-dashed border-border bg-[#D97706]/5">
                <div className="relative group shrink-0">
                  {editPhoto ? (
                    <img
                      src={editPhoto}
                      alt="Avatar Preview"
                      className="size-20 rounded-full object-cover border-2 border-[#D97706] shadow bg-white"
                    />
                  ) : (
                    <div className="grid size-20 place-items-center rounded-full bg-white border-2 border-dashed border-[#D97706]/50 font-heading text-2xl font-bold text-[#D97706] shadow">
                      {displayUser.initials}
                    </div>
                  )}
                  {editPhoto && (
                    <button
                      type="button"
                      onClick={() => setEditPhoto("")}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                      title={t("common.close")}
                    >
                      <Icon name="Trash" className="size-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold text-[#D97706] hover:bg-[#FFF3E0] shadow-sm transition active:scale-95 dark:bg-black dark:border-amber-900/30"
                    >
                      <Icon name="Upload" className="size-3.5" />
                      {t("profile.edit.uploadBtn")}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      {t("profile.edit.presetsLabel")}
                    </p>
                    <div className="flex gap-2.5 overflow-x-auto py-1">
                      {AVATAR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset.svg)}
                          className="size-11 rounded-full overflow-hidden border-2 border-transparent hover:border-[#D97706]/75 hover:scale-105 active:scale-95 transition shrink-0 bg-white shadow-sm"
                          title={t(preset.nameKey)}
                        >
                          <div dangerouslySetInnerHTML={{ __html: preset.svg }} className="size-full" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("profile.edit.nameLabel")}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#D97706]">
                    <Icon name="User" className="size-4" />
                  </span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-semibold shadow-inner outline-none transition duration-200 ${
                      errors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-border focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10"
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.name}</p>}
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("profile.edit.phoneLabel")}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-[#D97706] font-bold border-r border-border pr-2 py-0.5">
                    <Icon name="Smartphone" className="size-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    className={`w-full rounded-xl border py-3 pl-20 pr-4 text-sm font-semibold shadow-inner outline-none transition duration-200 ${
                      errors.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-border focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10"
                    }`}
                  />
                </div>
                {errors.phone && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("profile.edit.emailLabel")}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#D97706]">
                    <Icon name="Mail" className="size-4" />
                  </span>
                  <input
                    type="email"
                    placeholder={t("profile.edit.emailPlaceholder")}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-semibold shadow-inner outline-none transition duration-200 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-border focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10"
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.email}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("profile.edit.dobLabel")} <span className="text-[10px] text-muted-foreground">({t("profile.edit.optional")})</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#D97706]">
                    <Icon name="Calendar" className="size-4" />
                  </span>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm font-semibold shadow-inner outline-none transition duration-200 focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("profile.edit.genderLabel")} <span className="text-[10px] text-muted-foreground">({t("profile.edit.optional")})</span>
                </label>
                <div className="flex rounded-xl bg-secondary p-0.5 text-xs font-bold font-heading w-full max-w-sm">
                  {["Male", "Female", "Other"].map((genderVal) => {
                    const labelStr = genderVal === "Male" 
                      ? t("profile.edit.gender.male") 
                      : genderVal === "Female" 
                      ? t("profile.edit.gender.female") 
                      : t("profile.edit.gender.other")
                    return (
                      <button
                        key={genderVal}
                        type="button"
                        onClick={() => setEditGender(genderVal)}
                        className={`flex-1 py-2.5 rounded-lg transition-all duration-200 text-center uppercase tracking-wide ${
                          editGender === genderVal
                            ? "bg-[#800000] text-white shadow-md font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {labelStr}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("profile.edit.addressLabel")}
                </label>
                <div className="relative flex items-start">
                  <span className="absolute left-3 top-3.5 text-[#D97706]">
                    <Icon name="MapPin" className="size-4" />
                  </span>
                  <textarea
                    rows={3}
                    placeholder={t("profile.edit.addressPlaceholder")}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-semibold shadow-inner outline-none transition duration-200 ${
                      errors.address
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-border focus:border-[#D97706] focus:ring-4 focus:ring-[#D97706]/10"
                    }`}
                  />
                </div>
                {errors.address && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.address}</p>}
              </div>

            </div>

            {/* Buttons: Save & Cancel */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#800000] to-[#E25822] py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(128,0,0,0.2)] hover:shadow-[0_6px_18px_rgba(128,0,0,0.3)] transition active:scale-[0.98]"
              >
                <Icon name="Check" className="size-4" />
                {t("profile.edit.saveBtn")}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary py-3.5 text-sm font-bold text-foreground hover:bg-muted transition active:scale-[0.98]"
              >
                <Icon name="X" className="size-4" />
                {t("profile.edit.cancelBtn")}
              </button>
            </div>

          </form>
        </motion.div>
      )}

    </div>
  )
}
