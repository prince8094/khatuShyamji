"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import { motion, AnimatePresence } from "framer-motion"
import { drawerItems, user as staticUser, type ScreenKey, type AppUser } from "@/lib/data"
import { type AdminUser } from "@/lib/admin-data"
import { AdminWorkspace } from "@/components/admin/admin-workspace"
import { supabase } from "@/lib/supabase"

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
import { AartiTimingsScreen } from "@/components/screens/services/aarti-timings"
import { ParkingScreen } from "@/components/screens/parking"
import { TrafficUpdatesScreen } from "@/components/screens/services/traffic-updates"
import { MyBookingsScreen } from "@/components/screens/my-bookings"
import { QrPassScreen } from "@/components/screens/qr-pass"
import { HowToReachScreen } from "@/components/screens/how-to-reach"
import { ProfileScreen } from "@/components/screens/profile"
import { InfoScreens } from "@/components/screens/info-screens"
import { ShyamSahayakScreen } from "@/components/screens/shyam-sahayak"
import { OpeningAnimation } from "@/components/features/opening-animation"
import { LanguageToggle } from "@/components/ui/language-toggle"
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
  "seva-booking": { en: "Volunteering Services", hi: "स्वयंसेवक सेवा" },
  offerings: { en: "Offerings", hi: "भेंट" },
  "aarti-timings": { en: "Aarti Timings", hi: "आरती का समय" },
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
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [notifCount] = useState(3) // mock unread notifications count
  const [internalHistoryCount, setInternalHistoryCount] = useState(0)

  // PWA states
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallAvailable, setIsInstallAvailable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [showGeneralInstructions, setShowGeneralInstructions] = useState(false)

  const triggerPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to install prompt: ${outcome}`)
      if (outcome === "accepted") {
        setIsInstallAvailable(false)
        setDeferredPrompt(null)
        setToastMessage("TOCC has been installed successfully.")
        setTimeout(() => setToastMessage(""), 5000)
      }
    } else if (isIOS) {
      setShowIOSInstructions(true)
    } else {
      setShowGeneralInstructions(true)
    }
  }

  const { lang, setLang, t } = useLanguage()
  const { bhatiMode, setBhatiMode, soundEnabled, setSoundEnabled, timeOfDay } = useAudio()

  const syncUserProfile = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, name, phone, city")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Failed to load user profile:", error)
        return null
      }

      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Google Devotee"
      const email = user.email || ""
      const photoUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || ""

      if (profile) {
        // Update last login (robust fallback)
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }

        const { error: updErr } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", user.id)

        if (updErr) {
          console.warn("Update with last_login failed, trying with updated_at only:", updErr)
          if (updErr.code === "PGRST204" || updErr.message?.includes("last_login")) {
            delete updatePayload.last_login
            const { error: retryErr } = await supabase
              .from("profiles")
              .update(updatePayload)
              .eq("id", user.id)

            if (retryErr) {
              console.error("Retry profile update failed:", retryErr)
            }
          } else {
            console.error("Profile update failed:", updErr)
          }
        }
        return profile
      }

      // Auto-create profile if missing (first-time OAuth login)
      let phone = user.phone || user.user_metadata?.phone || ""
      if (!phone) {
        let uniquePhone = `+99${Math.floor(1000000000 + Math.random() * 9000000000)}`
        for (let i = 0; i < 5; i++) {
          const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("phone", uniquePhone)
            .maybeSingle()
          if (!existing) break
          uniquePhone = `+99${Math.floor(1000000000 + Math.random() * 9000000000)}`
        }
        phone = uniquePhone
      }

      const insertPayload: Record<string, any> = {
        id: user.id,
        name: fullName,
        phone: phone,
        email: email || null,
        photo_url: photoUrl || null,
        city: "",
        provider: "google"
      }

      let newProfile = null
      const { data: insData, error: insErr } = await supabase
        .from("profiles")
        .insert(insertPayload)
        .select("id, name, phone, city")
        .single()

      if (insErr) {
        console.warn("Insert with provider failed, trying without provider column:", insErr)
        if (insErr.code === "PGRST204" || insErr.message?.includes("provider")) {
          delete insertPayload.provider
          const { data: retryData, error: retryErr } = await supabase
            .from("profiles")
            .insert(insertPayload)
            .select("id, name, phone, city")
            .single()

          if (retryErr) {
            console.error("Retry profile insert failed:", retryErr)
            return null
          }
          newProfile = retryData
        } else {
          console.error("Profile insert failed:", insErr)
          return null
        }
      } else {
        newProfile = insData
      }

      return newProfile
    } catch (err) {
      console.error("Error in syncUserProfile:", err)
      return null
    }
  }

  useEffect(() => {
    // Check if running as PWA (standalone)
    const standaloneCheck = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes("android-app://")
    setIsStandalone(standaloneCheck)

    // Detect iOS
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iosCheck)

    // Track online/offline status
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallAvailable(true)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen to appinstalled event
    const handleAppInstalled = () => {
      setIsInstallAvailable(false)
      setDeferredPrompt(null)
      setToastMessage("TOCC has been installed successfully.")
      setTimeout(() => setToastMessage(""), 5000)
    }
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const sessionUser = localStorage.getItem("current_user") || localStorage.getItem("temp_signup_user")
    const sessionAdmin = localStorage.getItem("current_admin")
    let initialScreen: ScreenKey = sessionAdmin ? "welcome" : (sessionUser ? "home" : "welcome")
    
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser))
    }
    if (sessionAdmin) {
      setAdminUser(JSON.parse(sessionAdmin))
    }

    // Subscribe to real-time auth changes if Supabase URL is present
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    let subscription: any = null

    if (supabaseUrl) {
      const initSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const profile = await syncUserProfile(session.user)
          if (profile) {
            const userObj = {
              id: profile.id,
              name: profile.name,
              phone: profile.phone,
              city: profile.city || "",
              initials: profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
            }
            setCurrentUser(userObj)
            localStorage.setItem("current_user", JSON.stringify(userObj))
          }
        } else {
          setCurrentUser(null)
          localStorage.removeItem("current_user")
        }
      }
      initSession()

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await syncUserProfile(session.user)
          if (profile) {
            const userObj = {
              id: profile.id,
              name: profile.name,
              phone: profile.phone,
              city: profile.city || "",
              initials: profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
            }
            setCurrentUser(userObj)
            localStorage.setItem("current_user", JSON.stringify(userObj))
          }
        } else {
          setCurrentUser(null)
          localStorage.removeItem("current_user")

          const params = new URLSearchParams(window.location.search)
          const currentScreen = params.get("screen") || "welcome"
          if (currentScreen !== "welcome" && currentScreen !== "login" && currentScreen !== "signup" && currentScreen !== "otp") {
            navigate("welcome")
          }
        }
      })
      subscription = authListener.subscription
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
      return () => {
        window.removeEventListener("popstate", handlePopState)
        if (subscription) {
          subscription.unsubscribe()
        }
      }
    } else {
      setScreen(initialScreen)
    }
  }, [])

  const navigate = (s: ScreenKey) => {
    const authRequiredScreens: ScreenKey[] = [
      "bookings",
      "notifications",
      "qr",
      "lost-found",
      "profile",
      "book",
      "passenger-details",
      "group-booking",
      "seva-booking"
    ]

    if (authRequiredScreens.includes(s) && !currentUser) {
      setToastMessage(lang === "hi" ? "कृपया इस सेवा का उपयोग करने के लिए लॉगिन करें।" : "Please log in to access this feature.")
      setTimeout(() => setToastMessage(""), 4000)
      s = "login"
    }

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
    if (typeof window !== "undefined") {
      window.history.pushState({ screen: s }, "", `?screen=${s}`)
    }
    setScreen(s)
    setInternalHistoryCount(c => c + 1)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  const handleProfileClick = () => {
    if (currentUser) {
      navigate("profile")
    } else {
      navigate("welcome")
    }
  }

  const handleLogout = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      await supabase.auth.signOut()
    }
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

  // ── Admin Mode: Render the admin workspace instead of user app ──
  if (adminUser) {
    return (
      <>
        <AdminWorkspace
          initialUser={adminUser}
          onExitAdmin={() => {
            setAdminUser(null)
            localStorage.removeItem("current_admin")
            navigate("welcome")
          }}
          isStandalone={isStandalone}
          triggerPwaInstall={triggerPwaInstall}
        />

        {/* Floating Install App Button (FAB) for Admin */}
        {!isStandalone && (
          <div className="fixed z-40 right-6 bottom-6 transition-all duration-300">
            <button
              onClick={triggerPwaInstall}
              className="flex items-center justify-center size-12 rounded-full bg-gradient-to-r from-[#800000] to-[#E25822] text-white shadow-lg shadow-[#800000]/30 hover:scale-110 active:scale-95 transition-all border border-[#D4AF37]/50"
              title="Install App"
              aria-label="Install App"
            >
              <Icon name="Download" className="size-6 animate-pulse" />
            </button>
          </div>
        )}

        {/* iOS Safari Instructions Dialog */}
        <AnimatePresence>
          {showIOSInstructions && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-6 shadow-2xl text-center space-y-5"
              >
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <Icon name="X" className="size-5" />
                </button>
                
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-50 border border-amber-200 text-[#800000]">
                  <Icon name="Share" className="size-8" />
                </div>

                <div className="space-y-2 text-center">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Install on iOS Device
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Safari on iOS does not support one-click installations. Please follow these steps to add the app to your Home Screen:
                  </p>
                </div>

                <div className="text-left space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-amber-100/50">
                  <div className="flex gap-3 text-xs font-semibold text-amber-900/80">
                    <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold text-amber-900/80">
                    <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0">2</span>
                    <span>Scroll down the share menu and select <strong>Add to Home Screen</strong>.</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="w-full bg-[#800000] hover:bg-[#a02020] text-white rounded-2xl text-sm font-bold py-3 transition shadow-md"
                >
                  Got It
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* General Browser Instructions Dialog */}
        <AnimatePresence>
          {showGeneralInstructions && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-6 shadow-2xl text-center space-y-5"
              >
                <button
                  onClick={() => setShowGeneralInstructions(false)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <Icon name="X" className="size-5" />
                </button>
                
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-50 border border-amber-200 text-[#800000]">
                  <Icon name="Laptop" className="size-8" />
                </div>

                <div className="space-y-2 text-center">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Install Application
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your browser does not trigger native installation prompts automatically. You can install it manually:
                  </p>
                </div>

                <div className="text-left space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-amber-100/50">
                  <div className="flex gap-3 text-xs font-semibold text-[#800000] leading-relaxed">
                    <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Click the <strong>Menu</strong> icon (three dots <strong className="font-mono">⋮</strong> or three lines <strong className="font-mono">☰</strong>) in your browser's top-right corner.</span>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold text-[#800000] leading-relaxed">
                    <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Select <strong>Save and share</strong> ➔ <strong>Install page as app...</strong> or click <strong>Install App</strong>.</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowGeneralInstructions(false)}
                  className="w-full bg-[#800000] hover:bg-[#a02020] text-white rounded-2xl text-sm font-bold py-3 transition shadow-md"
                >
                  Got It
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {toastMessage && (
            <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3.5 shadow-lg text-sm text-green-700 font-semibold"
              >
                <Icon name="CheckCircle" className="size-5 shrink-0" />
                <span>{toastMessage}</span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    )
  }

  const SidebarContent = () => (
    <>
      <div
        className="relative overflow-hidden px-5 pb-4 pt-3 text-white shrink-0"
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
      <nav className="flex-1 px-5 py-5 overflow-y-auto">
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
        
        {/* PWA Install Button in Sidebar */}
        {!isStandalone && (
          <div className="mt-2 pt-2 border-t border-border">
            <button
              onClick={() => {
                setDrawerOpen(false)
                triggerPwaInstall()
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 text-[#D97706] hover:bg-[#D97706]/5"
            >
              <span className="grid size-9 place-items-center rounded-xl shadow-sm shrink-0 bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white">
                <Icon name="Download" className="size-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-bold leading-tight font-heading truncate">
                  Install App
                </span>
              </span>
            </button>
          </div>
        )}
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
      <div className="flex min-h-screen w-full transition-colors duration-700 bg-background text-foreground">


      {/* Floating Animated Diyas for Night Darshan Mode */}
      {isNightMode && showHeaderAndNav && (
        <div className={cn("pointer-events-none fixed bottom-20 z-40 flex gap-4 transition-all duration-300", !isStandalone ? "right-20" : "right-6")}>
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

      {/* Floating Install App Button (FAB) */}
      {!isStandalone && (
        <div className={cn("fixed z-40 right-6 transition-all duration-300", showHeaderAndNav ? "bottom-20 lg:bottom-6" : "bottom-6")}>
          <button
            onClick={triggerPwaInstall}
            className="flex items-center justify-center size-12 rounded-full bg-gradient-to-r from-[#800000] to-[#E25822] text-white shadow-lg shadow-[#800000]/30 hover:scale-110 active:scale-95 transition-all border border-[#D4AF37]/50"
            title="Install App"
            aria-label="Install App"
          >
            <Icon name="Download" className="size-6 animate-pulse" />
          </button>
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
                  {titles[screen] ? t(titles[screen].en, titles[screen].hi) : screen}
                </h1>
                <p className="truncate text-[10px] uppercase tracking-wider text-white/80">
                  {t("app.header.subtitle")}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Language Toggle — pill style */}
                <LanguageToggle />

                {/* Install App button in Header */}
                {!isStandalone && (
                  <button
                    onClick={triggerPwaInstall}
                    className="relative grid size-9 md:size-10 shrink-0 place-items-center rounded-xl bg-white/20 transition hover:bg-white/30 active:scale-95 text-white"
                    aria-label="Install App"
                    title="Install App"
                  >
                    <Icon name="Download" className="size-5" />
                  </button>
                )}

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
        <main className={cn("flex-1 w-full mx-auto px-4 md:px-8", showHeaderAndNav ? "pt-5 pb-24 lg:pb-10" : "")}>
          {screen === "welcome" && (
            <WelcomeScreen
              navigate={navigate}
              onAdminLogin={(user) => {
                setAdminUser(user)
                localStorage.setItem("current_admin", JSON.stringify(user))
              }}
            />
          )}
          {screen === "login" && (
            <LoginScreen
              navigate={navigate}
              onLoginSuccess={(u) => {
                setCurrentUser(u)
                localStorage.setItem("current_user", JSON.stringify(u))
              }}
            />
          )}
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
          {screen === "home" && (
            <HomeScreen
              navigate={navigate}
              currentUser={currentUser}
              isInstallAvailable={!isStandalone}
              onInstallClick={triggerPwaInstall}
            />
          )}
          {screen === "book" && <BookDarshanScreen navigate={navigate} navigateWithDate={navigateWithDate} />}
          {screen === "passenger-details" && <PassengerDetailsScreen navigate={navigate} bookingDate={bookingDate} />}
          {screen === "group-booking" && <GroupBookingScreen navigate={navigate} bookingDate={bookingDate} />}
          {screen === "services" && <ServicesScreen navigate={navigate} />}
          {screen === "hotel-booking" && <HotelBookingScreen navigate={navigate} />}
          {screen === "transport" && <TransportScreen navigate={navigate} />}
          {screen === "restaurant" && <RestaurantScreen navigate={navigate} />}
          {screen === "shyam-bus" && <ShyamBusScreen navigate={navigate} />}
          {screen === "prashad" && <PrashadScreen navigate={navigate} />}
          {screen === "donation" && <DonationScreen navigate={navigate} />}
          {screen === "seva-booking" && <SevaBookingScreen navigate={navigate} />}
          {screen === "offerings" && <OfferingsScreen navigate={navigate} />}
          {screen === "aarti-timings" && <AartiTimingsScreen />}
          {screen === "emergency" && <EmergencyHelplineScreen navigate={navigate} />}
          {screen === "parking" && <ParkingScreen navigate={navigate} />}
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
                const merged = {
                  ...currentUser,
                  ...updatedUser
                }
                setCurrentUser(merged)
                localStorage.setItem("current_user", JSON.stringify(merged))
              }}
              isInstallAvailable={!isStandalone}
              onInstallClick={triggerPwaInstall}
              isOnline={isOnline}
              isStandalone={isStandalone}
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
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 w-full border-t border-border bg-card/95 backdrop-blur-md pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-5 h-16 w-full">
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
                  className="relative flex flex-col items-center justify-center gap-1 h-full w-full min-w-0 px-1 transition-transform active:scale-95"
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span className="absolute -top-1 w-8 h-1 bg-[#D97706] rounded-b-full" />
                  )}
                  <span
                    className={cn(
                      "grid size-7 sm:size-8 shrink-0 place-items-center rounded-full transition-all duration-300",
                      active ? "bg-gradient-to-r from-[#D97706] to-[#D4AF37] text-white shadow-lg -translate-y-1" : "text-muted-foreground",
                    )}
                  >
                    <Icon name={item.icon} className="size-4 sm:size-[18px]" />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] sm:text-[10px] w-full text-center truncate font-semibold transition-colors duration-300",
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
      {/* iOS Safari Instructions Dialog */}
      <AnimatePresence>
        {showIOSInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-6 shadow-2xl text-center space-y-5"
            >
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <Icon name="X" className="size-5" />
              </button>
              
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-50 border border-amber-200 text-[#800000]">
                <Icon name="Share" className="size-8" />
              </div>

              <div className="space-y-2 text-center">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Install on iOS Device
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Safari on iOS does not support one-click installations. Please follow these steps to add the app to your Home Screen:
                </p>
              </div>

              <div className="text-left space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-amber-100/50">
                <div className="flex gap-3 text-xs font-semibold text-amber-900/80">
                  <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
                </div>
                <div className="flex gap-3 text-xs font-semibold text-amber-900/80">
                  <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0">2</span>
                  <span>Scroll down the share menu and select <strong>Add to Home Screen</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full bg-[#800000] hover:bg-[#a02020] text-white rounded-2xl text-sm font-bold py-3 transition shadow-md"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* General Browser Instructions Dialog */}
      <AnimatePresence>
        {showGeneralInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-6 shadow-2xl text-center space-y-5"
            >
              <button
                onClick={() => setShowGeneralInstructions(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <Icon name="X" className="size-5" />
              </button>
              
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-50 border border-amber-200 text-[#800000]">
                <Icon name="Laptop" className="size-8" />
              </div>

              <div className="space-y-2 text-center">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Install Application
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your browser does not trigger native installation prompts automatically. You can install it manually:
                </p>
              </div>

              <div className="text-left space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-amber-100/50">
                <div className="flex gap-3 text-xs font-semibold text-[#800000] leading-relaxed">
                  <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Click the <strong>Menu</strong> icon (three dots <strong className="font-mono">⋮</strong> or three lines <strong className="font-mono">☰</strong>) in your browser's top-right corner.</span>
                </div>
                <div className="flex gap-3 text-xs font-semibold text-[#800000] leading-relaxed">
                  <span className="grid size-5 place-items-center rounded-full bg-[#800000] text-white text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Select <strong>Save and share</strong> ➔ <strong>Install page as app...</strong> or click <strong>Install App</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowGeneralInstructions(false)}
                className="w-full bg-[#800000] hover:bg-[#a02020] text-white rounded-2xl text-sm font-bold py-3 transition shadow-md"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3.5 shadow-lg text-sm text-green-700 font-semibold"
            >
              <Icon name="CheckCircle" className="size-5 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </NavigationContext.Provider>
  )
}
