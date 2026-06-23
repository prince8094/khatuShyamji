"use client"

import Image from "next/image"
import { Icon, Om } from "@/components/shared"
import { user, type ScreenKey } from "@/lib/data"

const menu: { label: string; hindi: string; icon: string; key?: ScreenKey }[] = [
  { label: "Personal Details", hindi: "व्यक्तिगत जानकारी", icon: "UserCog" },
  { label: "My Bookings", hindi: "मेरी बुकिंग", icon: "Ticket", key: "bookings" },
  { label: "Notifications", hindi: "सूचनाएं", icon: "Bell", key: "notifications" },
  { label: "Payment Methods", hindi: "भुगतान", icon: "Wallet" },
  { label: "Help & Support", hindi: "सहायता", icon: "CircleHelp" },
  { label: "About Temple", hindi: "मंदिर के बारे में", icon: "Landmark", key: "temple" },
]

export function ProfileScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  return (
    <div className="space-y-5">
      {/* Profile card */}
      <section
        className="relative overflow-hidden rounded-3xl p-5 text-white shadow-md"
        style={{ backgroundImage: "linear-gradient(135deg,#FF8C00,#FFA726 60%,#FFB74D)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "220px" }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-white font-heading text-2xl font-bold text-[#FF8C00] shadow">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-xl font-bold">{user.name}</p>
            <p className="text-sm text-white/80">{user.phone}</p>
          </div>
          <span className="grid size-8 place-items-center rounded-full bg-white/20 text-lg">
            <Om />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/15 p-3 text-center">
          {[
            { v: "12", l: "Darshans" },
            { v: "3", l: "Upcoming" },
            { v: "5★", l: "Devotee" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-heading text-lg font-bold text-white">{s.v}</p>
              <p className="text-xs text-white/80">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {menu.map((m, i) => (
          <button
            key={m.label}
            onClick={() => m.key && navigate(m.key)}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-[#FFF3E0] ${
              i !== menu.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-[#FFF3E0] text-[#FF8C00]">
              <Icon name={m.icon} className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">{m.label}</span>
              <span className="block text-xs text-muted-foreground">{m.hindi}</span>
            </span>
            <Icon name="ChevronRight" className="size-5 text-muted-foreground" />
          </button>
        ))}
      </section>

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 font-heading text-sm font-bold text-red-600 active:scale-[0.99]">
        <Icon name="LogOut" className="size-5" />
        Logout
      </button>

      <p className="text-center text-xs text-muted-foreground">Smart Darshan · जय श्री श्याम · v1.0</p>
    </div>
  )
}
