"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import { motion } from "framer-motion"
import { drawerItems, user as staticUser, type ScreenKey, type AppUser } from "@/lib/data"

// Screen components
import { HomeScreen } from "@/components/screens/home"
import { BookDarshanScreen } from "@/components/screens/book-darshan"
import { PassengerDetailsScreen } from "@/components/screens/passenger-details"
import { GroupBookingScreen } from "@/components/screens/group-booking"
import { ServicesScreen } from "@/components/screens/services"
import { HotelBookingScreen } from "@/components/screens/services/hotel-booking"
import { TransportScreen } from "@/components/screens/services/transport"
import { RestaurantScreen } from "@/components/screens/services/restaurant"
import { ShyamBusScreen } from "@/components/screens/services/shyam-bus"
import { PrashadScreen } from "@/components/screens/services/prashad"
import { DonationScreen } from "@/components/screens/services/donation"
import { SevaBookingScreen } from "@/components/screens/services/seva-booking"
import { OfferingsScreen } from "@/components/screens/services/offerings"
import { EmergencyHelplineScreen } from "@/components/screens/services/emergency-helpline"
import { ParkingInfoScreen } from "@/components/screens/services/parking-info"
import { TrafficUpdatesScreen } from "@/components/screens/services/traffic-updates"
import { MyBookingsScreen } from "@/components/screens/my-bookings"
import { QrPassScreen } from "@/components/screens/qr-pass"
import { HowToReachScreen } from "@/components/screens/how-to-reach"
import { ProfileScreen } from "@/components/screens/profile"
import { InfoScreens } from "@/components/screens/info-screens"
import { ShyamSahayakScreen } from "@/components/screens/shyam-sahayak"
import { OpeningAnimation } from "@/components/features/opening-animation"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { BhatiMode } from "@/components/features/bhati-mode"
import { VirtualDarshanScreen } from "@/components/screens/virtual-darshan"
import { LiveDarshanScreen } from "@/components/screens/live-darshan"
import { HelpSupportScreen } from "@/components/screens/help-support"

// Auth screens
import { WelcomeScreen } from "@/components/screens/auth/welcome"
import { LoginScreen } from "@/components/screens/auth/login"
import { SignupScreen } from "@/components/screens/auth/signup"
import { OtpScreen } from "@/components/screens/auth/otp"
import { BookingSuccessScreen } from "@/components/screens/booking-success"

// Contexts
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useAudio } from "@/lib/contexts/AudioContext"
import { NavigationContext } from "@/lib/contexts/NavigationContext"

const titles: Record<ScreenKey, { en: string; hi: string }> = {
  welcome: { en: "Welcome", hi: "स्वागत है" },
  login: { en: "Login", hi: "लॉग इन करें" },
  signup: { en: "Sign Up", hi: "पंजीकरण" },
  otp: { en: "Verify OTP", hi: "ओटीपी सत्यापित करें" },
  home: { en: "Khatu Shyam Ji", hi: "खाटू श्याम जी" },
  book: { en: "Book Darshan", hi: "दर्शन बुकिंग" },
  "passenger-details": { en: "Passenger Details", hi: "यात्री विवरण" },
  "group-booking": { en: "Group Booking", hi: "समूह बुकिंग" },
  "booking-success": { en: "Booking Success", hi: "बुकिंग सफल" },
  services: { en: "Services & Places", hi: "सेवाएं और स्थान" },
  bookings: { en: "My Bookings", hi: "मेरी बुकिंग" },
  qr: { en: "QR Pass", hi: "क्यूआर पास" },
  crowd: { en: "Live Crowd Status", hi: "भीड़ स्थिति" },
  traffic: { en: "Traffic Updates", hi: "ट्रैफिक अपडेट" },
  parking: { en: "Parking Info", hi: "पार्किंग जानकारी" },
  "lost-found": { en: "Lost & Found", hi: "खोया और पाया" },
  reach: { en: "How to Reach", hi: "कैसे पहुंचें" },
  offline: { en: "Offline Centers", hi: "ऑफलाइन केंद्र" },
  temple: { en: "Temple Information", hi: "मंदिर जानकारी" },
  emergency: { en: "Emergency Help", hi: "आपातकालीन सहायता" },
  notifications: { en: "Notifications", hi: "सूचनाएं" },
  announcements: { en: "Announcements", hi: "घोषणाएं" },
  profile: { en: "My Profile", hi: "मेरी प्रोफ़ाइल" },
  "shyam-ai": { en: "Shyam Sahayak AI", hi: "श्याम सहायक" },
  "khatu-path": { en: "Shyam Path", hi: "श्याम पथ" },
  "live-darshan": { en: "Live Darshan", hi: "लाइव दर्शन" },
  "virtual-darshan": { en: "Virtual Darshan", hi: "आभासी दर्शन" },
  "help-support": { en: "Help & Support", hi: "सहायता केंद्र" },
  "hotel-booking": { en: "Hotel Booking", hi: "होटल बुकिंग" },
  transport: { en: "Transport", hi: "परिवहन" },
  restaurant: { en: "Restaurant", hi: "भोजनालय" },
  "shyam-bus": { en: "Shyam Bus", hi: "श्याम बस" },
  prashad: { en: "Prashad", hi: "प्रसाद" },
  donation: { en: "Donation", hi: "दान" },
  "seva-booking": { en: "Seva Booking", hi: "सेवा बुकिंग" },
  offerings: { en: "Offerings", hi: "भेंट" },
}

const bottomNav: { key: ScreenKey; icon: string }[] = [
  { key: "home", icon: "Home" },
  { key: "book", icon: "CalendarCheck" },
  { key: "services", icon: "LayoutGrid" },
  { key: "shyam-ai", icon: "Bot" },
  { key: "profile", icon: "User" },
]

// Sidebar item groups
// Sidebar item groups
const sidebarGroups = [
  {
    key: "main",
    items: ["home", "book", "live-darshan", "virtual-darshan", "khatu-path"],
  },
  {
    key: "account",
    items: ["bookings", "qr", "profile"],
  },
  {
    key: "services",
    items: ["services", "lost-found", "reach", "help-support"],
  },
  {
    key: "info",
    items: ["crowd", "traffic", "parking", "offline", "temple", "emergency", "notifications"],
  },
]

export function AppShell() {
  const [screen, setScreen] = useState<ScreenKey>("welcome")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState<string | null>(null)
  const [showOpening, setShowOpening] = useState(true)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [notifCount] = useState(3) // mock unread notifications count
  const [internalHistoryCount, setInternalHistoryCount] = useState(0)

  const { lang, setLang, t } = useLanguage()
  const { bhatiMode, setBhatiMode, soundEnabled, setSoundEnabled, timeOfDay } = useAudio()

  useEffect(() => {
    // Check if user is logged in
    const sessionUser = localStorage.getItem("current_user") || localStorage.getItem("temp_signup_user")
    let initialScreen: ScreenKey = sessionUser ? "home" : "welcome"
    
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser))
    }

    const hasSeen = sessionStorage.getItem("seen_opening")
    if (hasSeen) {
      setShowOpening(false)
    } else {
      sessionStorage.setItem("seen_opening", "true")
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const urlScreen = params.get("screen") as ScreenKey
      if (urlScreen) initialScreen = urlScreen
      
      setScreen(initialScreen)
      
      if (!window.history.state?.screen) {
        window.history.replaceState({ screen: initialScreen }, "", `?screen=${initialScreen}`)
      }

      const handlePopState = (e: PopStateEvent) => {
        if (e.state && e.state.screen) {
          setScreen(e.state.screen)
          setInternalHistoryCount(c => Math.max(0, c - 1))
        }
      }

      window.addEventListener("popstate", handlePopState)
      return () => window.removeEventListener("popstate", handlePopState)
    } else {
      setScreen(initialScreen)
    }
  }, [])

  const navigate = (s: ScreenKey) => {
    if (s === screen) return
    if (typeof window !== "undefined") {
      window.history.pushState({ screen: s }, "", `?screen=${s}`)
    }
    setScreen(s)
    setInternalHistoryCount(c => c + 1)
    setDrawerOpen(false)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  const goBack = () => {
    if (internalHistoryCount > 0) {
      if (typeof window !== "undefined") window.history.back()
    } else {
      navigate("home")
    }
  }

  const pushState = (key: string, value: any) => {
    if (typeof window !== "undefined") {
      const currentState = window.history.state || {}
      window.history.pushState(
        { ...currentState, [key]: value },
        "",
        window.location.search
      )
      setInternalHistoryCount(c => c + 1)
      window.dispatchEvent(new CustomEvent('local-history-change', { detail: { key, value } }))
    }
  }

  const navigateWithDate = (s: ScreenKey, date: string) => {
    setBookingDate(date)
    setScreen(s)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  const handleProfileClick = () => {
    if (currentUser) {
      navigate("profile")
    } else {
      navigate("welcome")
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("current_user")
    localStorage.removeItem("temp_signup_user")
    navigate("welcome")
  }

  const activeUser = currentUser || staticUser

  const isHome = screen === "home"
  const isNightMode = timeOfDay === "night"

  if (showOpening) {
    return <OpeningAnimation onComplete={() => setShowOpening(false)} />
  }

  const SidebarContent = () => (
    <>
      <div
        className="relative overflow-hidden px-5 pb-6 pt-6 text-white shrink-0"
        style={{
          backgroundImage: "linear-gradient(135deg, #D97706 0%, #D4AF37 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "220px" }}
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-between">
          <span className="grid size-14 place-items-center rounded-full bg-white shadow-xl overflow-hidden p-1 border-2 border-[#D4AF37]">
            <Image
              src="/images/khatu-shyam-logo.png"
              alt="Khatu Shyam Ji Logo"
              width={48}
              height={48}
              className="size-full object-contain"
            />
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(false)}
              className="md:hidden grid size-9 place-items-center rounded-full bg-black/20 backdrop-blur-sm transition-transform hover:scale-105"
              aria-label="Close menu"
            >
              <Icon name="X" className="size-5 text-white" />
            </button>
          </div>
        </div>
        <p className="relative mt-4 font-heading text-lg font-bold tracking-widest text-[#FFF8F0] drop-shadow-md">
          {t("navigation.sidebar.title")}
        </p>

        {/* Profile card */}
        <div
          className="relative mt-4 flex items-center gap-3 rounded-2xl bg-black/20 backdrop-blur-md p-3 border border-white/10 cursor-pointer hover:bg-black/30 transition"
          onClick={handleProfileClick}
        >
          {activeUser.photo ? (
            <img
              src={activeUser.photo}
              alt={activeUser.name}
              className="size-12 rounded-full object-cover border border-white/20 shadow-inner shrink-0"
            />
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-white font-heading text-xl font-bold text-[#D97706] shadow-inner shrink-0">
              {activeUser.initials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading font-bold text-white">{activeUser.name}</p>
            <p className="truncate text-xs text-white/80">{activeUser.phone}</p>
          </div>
          {currentUser ? (
            <Icon name="ChevronRight" className="size-4 text-white/70 shrink-0" />
          ) : (
            <span className="text-[10px] font-bold text-white/80 bg-white/20 rounded-full px-2 py-0.5 shrink-0">
              {t("components.appShell.login")}
            </span>
          )}
        </div>
      </div>

      {/* Sidebar items grouped */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {sidebarGroups.map((group) => {
          const groupItems = drawerItems.filter((item) => group.items.includes(item.key))
          if (groupItems.length === 0) return null
          return (
            <div key={group.key} className="mb-4">
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t(`navigation.headings.${group.key}`)}
              </p>
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = screen === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigate(item.key)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200",
                        active ? "bg-[#D97706]/10 text-[#D97706]" : "text-foreground hover:bg-[#D97706]/5",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-xl shadow-sm shrink-0",
                          active ? "bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white" : "bg-card text-[#D97706] border border-border",
                        )}
                      >
                        <Icon name={item.icon} className="size-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-bold leading-tight font-heading truncate">
                          {t(`navigation.items.${item.key}`)}
                        </span>
                      </span>
                      {active && <span className="size-1.5 rounded-full bg-[#D97706] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="p-5 text-center shrink-0 border-t border-border">
        <p className="text-xs font-heading tracking-widest text-muted-foreground">DIGITAL DARSHAN · V2.0</p>
        <div className="mt-3 flex justify-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="grid size-10 place-items-center rounded-full bg-card border border-border text-[#D97706] shadow-sm hover:bg-[#D97706]/10 transition"
            title={soundEnabled ? "Mute Ambience" : "Enable Ambience"}
          >
            <Icon name={soundEnabled ? "Volume2" : "VolumeX"} className="size-4" />
          </button>
          <button
            onClick={() => setBhatiMode(!bhatiMode)}
            className={cn(
              "grid size-10 place-items-center rounded-full border shadow-sm transition",
              bhatiMode ? "bg-[#D97706] border-[#D97706] text-white" : "bg-card border-border text-[#D97706] hover:bg-[#D97706]/10",
            )}
            title="Bhakti Mode"
          >
            <Icon name="Sparkles" className="size-4" />
          </button>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="grid size-10 place-items-center rounded-full bg-card border border-red-200 text-red-500 shadow-sm hover:bg-red-50 transition"
              title="Logout"
            >
              <Icon name="LogOut" className="size-4" />
            </button>
          )}
        </div>
      </div>
    </>
  )

  const showHeaderAndNav = !["welcome", "login", "signup", "otp"].includes(screen)

  return (
    <NavigationContext.Provider value={{ navigate, goBack, pushState }}>
      <div className={cn("flex min-h-screen w-full transition-colors duration-700", isNightMode ? "bg-[#0e0805] text-[#FFF8F0]" : "bg-background text-foreground")}>
      {bhatiMode && <BhatiMode />}

      {/* Floating Animated Diyas for Night Darshan Mode */}
      {isNightMode && showHeaderAndNav && (
        <div className="pointer-events-none fixed bottom-20 right-6 z-40 flex gap-4">
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <div className="w-7 h-4 bg-[#D4AF37] rounded-b-full relative border border-amber-600 shadow-lg">
              <motion.div
                animate={{ scaleY: [0.8, 1.25, 0.8], skewX: [-3, 3, -3] }}
                transition={{ duration: 0.25, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -top-3.5 left-[11px] w-2 h-4 bg-gradient-to-t from-[#D97706] to-yellow-300 rounded-full origin-bottom blur-[0.5px]"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Desktop Sidebar (lg+) */}
      {showHeaderAndNav && (
        <aside
          className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 flex-col border-r border-border bg-card shadow-lg"
          style={{ position: "sticky", top: 0, height: "100vh" }}
        >
          <SidebarContent />
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        {showHeaderAndNav && (
          <header
            className="sticky top-0 z-30 shrink-0 overflow-hidden text-white shadow-md"
            style={{ backgroundImage: "linear-gradient(135deg, #D97706 0%, #D4AF37 100%)" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "250px" }}
              aria-hidden="true"
            />
            <div className="relative flex h-16 items-center gap-3 px-4 md:px-6">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 transition hover:bg-white/30 active:scale-95"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
              >
                <Icon name="Menu" className="size-5" />
              </button>

              {/* Logo with Night Mode Moon Halo */}
              <span className="lg:hidden relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/50 bg-white p-0.5 shadow">
                {isNightMode && (
                  <div className="absolute inset-0 bg-yellow-200/40 rounded-full blur-[3px] animate-pulse" />
                )}
                <Image
                  src="/images/khatu-shyam-logo.png"
                  alt="Khatu Shyam Ji"
                  width={32}
                  height={32}
                  className="size-full object-contain"
                />
              </span>

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-heading text-base font-bold leading-tight drop-shadow-sm md:text-lg">
                  {t(titles[screen].en, titles[screen].hi)}
                </h1>
                <p className="truncate text-[10px] uppercase tracking-wider text-white/80">
                  {t("app.header.subtitle")}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Language Toggle — pill style */}
                <LanguageToggle />

                {/* Notifications Bell — notifications only */}
                <button
                  onClick={() => navigate("notifications")}
                  className="relative grid size-9 md:size-10 shrink-0 place-items-center rounded-xl bg-white/20 transition hover:bg-white/30 active:scale-95"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Icon name="Bell" className="size-5 text-white" />
                  {notifCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#D97706]">
                      {notifCount}
                    </span>
                  )}
                </button>

                {/* AI Assistant button — separate from notifications */}
                <button
                  onClick={() => navigate("shyam-ai")}
                  className="relative hidden md:grid size-9 md:size-10 shrink-0 place-items-center rounded-xl bg-white/20 transition hover:bg-white/30 active:scale-95"
                  aria-label="Shyam Sahayak AI Assistant"
                  title="Shyam Sahayak AI"
                >
                  <Icon name="Bot" className="size-5 text-white" />
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-green-400 ring-2 ring-[#D97706] animate-pulse" />
                </button>
              </div>
            </div>

            {isHome && (
              <div className="relative pb-2.5 text-center lg:hidden">
                <p className="font-heading text-sm font-bold tracking-[0.25em] text-white/90 drop-shadow">
                  {t("auth.welcome.heading")}
                </p>
              </div>
            )}
          </header>
        )}

        {/* Page Content */}
        <main className={cn("flex-1 w-full max-w-5xl mx-auto px-4 md:px-8", showHeaderAndNav ? "pt-5 pb-24 lg:pb-10" : "")}>
          {screen === "welcome" && <WelcomeScreen navigate={navigate} />}
          {screen === "login" && <LoginScreen navigate={navigate} />}
          {screen === "signup" && (
            <SignupScreen
              navigate={navigate}
              onSignupSuccess={(u) => {
                setCurrentUser(u)
                localStorage.setItem("current_user", JSON.stringify(u))
              }}
            />
          )}
          {screen === "otp" && (
            <OtpScreen
              navigate={navigate}
              onLoginSuccess={(u) => {
                setCurrentUser(u)
                localStorage.setItem("current_user", JSON.stringify(u))
              }}
            />
          )}
          {screen === "booking-success" && <BookingSuccessScreen navigate={navigate} />}
          {screen === "virtual-darshan" && <VirtualDarshanScreen navigate={navigate} />}
          {screen === "live-darshan" && <LiveDarshanScreen navigate={navigate} />}
          {screen === "help-support" && <HelpSupportScreen navigate={navigate} />}
          {screen === "home" && <HomeScreen navigate={navigate} currentUser={currentUser} />}
          {screen === "book" && <BookDarshanScreen navigate={navigate} navigateWithDate={navigateWithDate} />}
          {screen === "passenger-details" && <PassengerDetailsScreen navigate={navigate} bookingDate={bookingDate} />}
          {screen === "group-booking" && <GroupBookingScreen navigate={navigate} />}
          {screen === "services" && <ServicesScreen navigate={navigate} />}
          {screen === "hotel-booking" && <HotelBookingScreen navigate={navigate} />}
          {screen === "transport" && <TransportScreen navigate={navigate} />}
          {screen === "restaurant" && <RestaurantScreen navigate={navigate} />}
          {screen === "shyam-bus" && <ShyamBusScreen navigate={navigate} />}
          {screen === "prashad" && <PrashadScreen navigate={navigate} />}
          {screen === "donation" && <DonationScreen navigate={navigate} />}
          {screen === "seva-booking" && <SevaBookingScreen navigate={navigate} />}
          {screen === "offerings" && <OfferingsScreen navigate={navigate} />}
          {screen === "emergency" && <EmergencyHelplineScreen navigate={navigate} />}
          {screen === "parking" && <ParkingInfoScreen navigate={navigate} />}
          {screen === "traffic" && <TrafficUpdatesScreen navigate={navigate} />}
          {screen === "bookings" && <MyBookingsScreen navigate={navigate} />}
          {screen === "qr" && <QrPassScreen />}
          {screen === "reach" && <HowToReachScreen />}
          {screen === "profile" && (
            <ProfileScreen
              navigate={navigate}
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdateUser={(updatedUser) => {
                setCurrentUser(updatedUser)
                localStorage.setItem("current_user", JSON.stringify(updatedUser))
              }}
            />
          )}
          {screen === "shyam-ai" && <ShyamSahayakScreen navigate={navigate} />}
          {["khatu-path", "crowd", "lost-found", "offline", "temple", "notifications", "announcements"].includes(screen) && (
            <InfoScreens screen={screen as any} navigate={navigate} />
          )}
        </main>
      </div>

      {/* Mobile Bottom nav */}
      {showHeaderAndNav && (
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 w-full border-t border-border bg-card/95 backdrop-blur-md pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-5 h-16">
            {bottomNav.map((item) => {
              const active = screen === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === "profile") {
                      handleProfileClick()
                    } else {
                      navigate(item.key)
                    }
                  }}
                  className="relative flex flex-col items-center justify-center gap-1 h-full transition-transform active:scale-95"
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span className="absolute -top-1 w-8 h-1 bg-[#D97706] rounded-b-full" />
                  )}
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full transition-all duration-300",
                      active ? "bg-gradient-to-r from-[#D97706] to-[#D4AF37] text-white shadow-lg -translate-y-1" : "text-muted-foreground",
                    )}
                  >
                    <Icon name={item.icon} className="size-[18px]" />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold transition-colors duration-300",
                      active ? "text-[#D97706]" : "text-muted-foreground",
                    )}
                  >
                    {t(`navigation.${item.key === 'book' ? 'darshan' : (item.key === 'shyam-ai' ? 'ai' : item.key)}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {/* Mobile Drawer */}
      {drawerOpen && showHeaderAndNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col overflow-y-auto bg-background shadow-2xl duration-300 animate-in slide-in-from-left">
            <SidebarContent />
          </aside>
        </div>
      )}
      </div>
    </NavigationContext.Provider>
  )
}
