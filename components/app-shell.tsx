"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import { drawerItems, user, type ScreenKey } from "@/lib/data"
import { HomeScreen } from "@/components/screens/home"
import { BookDarshanScreen } from "@/components/screens/book-darshan"
import { PassengerDetailsScreen } from "@/components/screens/passenger-details"
import { ServicesScreen } from "@/components/screens/services"
import { MyBookingsScreen } from "@/components/screens/my-bookings"
import { QrPassScreen } from "@/components/screens/qr-pass"
import { HowToReachScreen } from "@/components/screens/how-to-reach"
import { ProfileScreen } from "@/components/screens/profile"
import { InfoScreens } from "@/components/screens/info-screens"

const titles: Record<ScreenKey, { en: string; hi: string }> = {
  home: { en: "Khatu Shyam Ji", hi: "खाटू श्याम जी" },
  book: { en: "Book Darshan", hi: "दर्शन बुकिंग" },
  "passenger-details": { en: "Passenger Details", hi: "यात्री विवरण" },
  services: { en: "Services", hi: "सेवाएं" },
  bookings: { en: "My Bookings", hi: "मेरी बुकिंग" },
  qr: { en: "QR Pass", hi: "क्यूआर पास" },
  crowd: { en: "Live Crowd Status", hi: "भीड़ स्थिति" },
  traffic: { en: "Traffic Updates", hi: "ट्रैफिक अपडेट" },
  reach: { en: "How to Reach", hi: "कैसे पहुंचें" },
  offline: { en: "Offline Centers", hi: "ऑफलाइन केंद्र" },
  temple: { en: "Temple Information", hi: "मंदिर जानकारी" },
  emergency: { en: "Emergency Help", hi: "आपातकालीन सहायता" },
  notifications: { en: "Notifications", hi: "सूचनाएं" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल" },
}

const bottomNav: { key: ScreenKey; label: string; icon: string }[] = [
  { key: "home", label: "Home", icon: "Home" },
  { key: "book", label: "Book", icon: "CalendarCheck" },
  { key: "services", label: "Services", icon: "LayoutGrid" },
  { key: "profile", label: "Profile", icon: "User" },
]

export function AppShell() {
  const [screen, setScreen] = useState<ScreenKey>("home")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState<string | null>(null)

  const navigate = (s: ScreenKey) => {
    setScreen(s)
    setDrawerOpen(false)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  const navigateWithDate = (s: ScreenKey, date: string) => {
    setBookingDate(date)
    setScreen(s)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  const isHome = screen === "home"

  return (
    <div className="mx-auto flex min-h-screen w-full md:max-w-[480px] flex-col bg-background md:shadow-2xl">
      {/* Header */}
      <header
        className="sticky top-0 z-30 overflow-hidden text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #FF8C00 0%, #FFA726 55%, #FFB74D 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "url(/images/mandala-pattern.png)",
            backgroundSize: "260px",
          }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3 px-4 pb-4 pt-5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 transition active:scale-95"
            aria-label="Open menu"
          >
            <Icon name="Menu" className="size-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-md overflow-hidden">
              <Image
                src="/images/khatu-shyam-logo.png"
                alt="Khatu Shyam Ji Logo"
                width={36}
                height={36}
                className="size-[36px] object-contain"
              />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-base font-bold leading-tight">
                {titles[screen].en}
              </h1>
              <p className="truncate text-xs text-white/80">{titles[screen].hi}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("notifications")}
            className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 transition active:scale-95"
            aria-label="Notifications"
          >
            <Icon name="Bell" className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-white ring-2 ring-[#FF8C00]" />
          </button>
        </div>

        {isHome ? (
          <div className="relative px-4 pb-3 text-center">
            <p className="font-heading text-lg font-semibold tracking-wide text-white/90">
              जय श्री श्याम
            </p>
          </div>
        ) : null}
      </header>

      {/* Screen content */}
      <main className="flex-1 px-4 pb-28 pt-4">
        {screen === "home" && <HomeScreen navigate={navigate} />}
        {screen === "book" && <BookDarshanScreen navigate={navigate} navigateWithDate={navigateWithDate} />}
        {screen === "passenger-details" && <PassengerDetailsScreen navigate={navigate} bookingDate={bookingDate} />}
        {screen === "services" && <ServicesScreen />}
        {screen === "bookings" && <MyBookingsScreen navigate={navigate} />}
        {screen === "qr" && <QrPassScreen />}
        {screen === "reach" && <HowToReachScreen />}
        {screen === "profile" && <ProfileScreen navigate={navigate} />}
        {["crowd", "traffic", "offline", "temple", "emergency", "notifications"].includes(
          screen,
        ) && <InfoScreens screen={screen} navigate={navigate} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full md:max-w-[480px] border-t border-border bg-card/95 backdrop-blur">
        <div className="grid grid-cols-4">
          {bottomNav.map((item) => {
            const active = screen === item.key
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className="relative flex flex-col items-center gap-1 py-2.5"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-2xl transition",
                    active ? "bg-gradient-to-r from-[#FF8C00] to-[#FFA726] text-white shadow-md" : "text-muted-foreground",
                  )}
                >
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    active ? "text-[#FF8C00]" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col overflow-y-auto bg-background shadow-2xl duration-200 animate-in slide-in-from-left">
            {/* Drawer header */}
            <div
              className="relative overflow-hidden px-5 pb-6 pt-6 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #FF8C00 0%, #FFA726 60%, #FFB74D 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.10]"
                style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "220px" }}
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-full bg-white shadow-md overflow-hidden">
                  <Image
                    src="/images/khatu-shyam-logo.png"
                    alt="Khatu Shyam Ji Logo"
                    width={40}
                    height={40}
                    className="size-[40px] object-contain"
                  />
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="grid size-9 place-items-center rounded-xl bg-white/20"
                  aria-label="Close menu"
                >
                  <Icon name="X" className="size-5" />
                </button>
              </div>
              <p className="relative mt-4 font-heading text-sm font-semibold text-white/90">
                जय श्री श्याम · Khatu Dham
              </p>

              {/* Profile card */}
              <div className="relative mt-3 flex items-center gap-3 rounded-2xl bg-white/15 p-3">
                <span className="grid size-12 place-items-center rounded-full bg-white font-heading text-lg font-bold text-[#FF8C00]">
                  {user.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-white/80">{user.phone}</p>
                </div>
              </div>
            </div>

            {/* Drawer items */}
            <nav className="flex-1 px-3 py-3">
              {drawerItems.map((item) => {
                const active = screen === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    className={cn(
                      "mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                      active ? "bg-[#FFF3E0] text-[#FF8C00]" : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-xl",
                        active ? "bg-gradient-to-r from-[#FF8C00] to-[#FFA726] text-white" : "bg-secondary text-[#FF8C00]",
                      )}
                    >
                      <Icon name={item.icon} className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.hindi}</span>
                    </span>
                    <Icon name="ChevronRight" className="size-4 text-muted-foreground" />
                  </button>
                )
              })}
            </nav>

            <div className="px-5 pb-6 pt-2 text-center text-xs text-muted-foreground">
              Smart Darshan · v1.0
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
