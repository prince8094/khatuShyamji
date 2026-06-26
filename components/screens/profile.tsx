"use client"

import { Icon, Om } from "@/components/shared"
import { type ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"

type ProfileUser = {
  name: string
  phone: string
  initials: string
}

const menu: { label: { en: string; hi: string }; icon: string; key?: ScreenKey }[] = [
  { label: { en: "My Bookings", hi: "मेरी बुकिंग" }, icon: "Ticket", key: "bookings" },
  { label: { en: "Notifications", hi: "सूचनाएं" }, icon: "Bell", key: "notifications" },
  { label: { en: "Personal Details", hi: "व्यक्तिगत जानकारी" }, icon: "UserCog" },
  { label: { en: "Payment Methods", hi: "भुगतान" }, icon: "Wallet" },
  { label: { en: "Help & Support", hi: "सहायता" }, icon: "CircleHelp", key: "help-support" },
  { label: { en: "About Temple", hi: "मंदिर के बारे में" }, icon: "Landmark", key: "temple" },
]

export function ProfileScreen({
  navigate,
  onLogout,
  currentUser,
}: {
  navigate: (s: ScreenKey) => void
  onLogout?: () => void
  currentUser?: ProfileUser | null
}) {
  const { t } = useLanguage()

  const displayUser = currentUser || { name: "Nand Kumar", phone: "+91 98290 12345", initials: "NK" }

  const stats = [
    { v: "12", l: { en: "Darshans", hi: "दर्शन" } },
    { v: "3", l: { en: "Upcoming", hi: "आने वाले" } },
    { v: "5★", l: { en: "Devotee", hi: "भक्त" } },
  ]

  return (
    <div className="space-y-5 pb-10">
      {/* Profile card */}
      <section
        className="relative overflow-hidden rounded-3xl p-5 text-white shadow-md"
        style={{ backgroundImage: "linear-gradient(135deg,#D97706,#D4AF37 60%,#FFB74D)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "220px" }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-white font-heading text-2xl font-bold text-[#D97706] shadow">
            {displayUser.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-xl font-bold">{displayUser.name}</p>
            <p className="text-sm text-white/80">{displayUser.phone}</p>
          </div>
          <span className="grid size-8 place-items-center rounded-full bg-white/20 text-lg">
            <Om />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/15 p-3 text-center">
          {stats.map((s) => (
            <div key={s.l.en}>
              <p className="font-heading text-lg font-bold text-white">{s.v}</p>
              <p className="text-xs text-white/80">{t(s.l.en, s.l.hi)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {menu.map((m, i) => (
          <button
            key={m.label.en}
            onClick={() => m.key && navigate(m.key)}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-secondary/30 ${i !== menu.length - 1 ? "border-b border-border" : ""
              }`}
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary">
              <Icon name={m.icon} className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">{t(m.label.en, m.label.hi)}</span>
            </span>
            <Icon name="ChevronRight" className="size-5 text-muted-foreground" />
          </button>
        ))}
      </section>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 font-heading text-sm font-bold text-red-600 active:scale-[0.99] transition hover:bg-red-100"
      >
        <Icon name="LogOut" className="size-5" />
        {t("Logout", "लॉग आउट")}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Smart Darshan · जय श्री श्याम · v2.0
      </p>
    </div>
  )
}
