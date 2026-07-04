"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Icon, Om } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useAudio } from "@/lib/contexts/AudioContext"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { useNavigation } from "@/lib/contexts/NavigationContext"

import { supabase } from "@/lib/supabase"

export function LoginScreen({ 
  navigate,
  onLoginSuccess
}: { 
  navigate: (s: any) => void 
  onLoginSuccess?: (user: any) => void
}) {
  const { goBack } = useNavigation();
  const { t } = useLanguage()
  const { playTempleBell } = useAudio()
  
  // Mobile state
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleMessage, setGoogleMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length === 10) {
      setError("")
      setLoading(true)
      try {
        const unspacedPhone = `+91${phone}`
        
        // Check profile first (and bootstrap if dev mode)
        const checkRes = await fetch("/api/devotee/auth-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: unspacedPhone, signup: false })
        })
        const checkResult = await checkRes.json()
        if (!checkResult.success) {
          setError(checkResult.error || "Profile not found. Please sign up first.")
          setLoading(false)
          return
        }

        // Development Mode bypass for any phone number
        if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
          playTempleBell('single')
          localStorage.setItem("temp_login_phone", unspacedPhone)
          navigate("otp")
          setLoading(false)
          return
        }

        // Trigger OTP (Real flow)
        const { error: authError } = await supabase.auth.signInWithOtp({
          phone: unspacedPhone,
        })
        if (authError) throw authError

        playTempleBell('single')
        localStorage.setItem("temp_login_phone", unspacedPhone)
        navigate("otp")
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to send OTP. Please check connection.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGoogleLogin = async () => {
    playTempleBell('single')
    
    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
      setLoading(true)
      try {
        const mockPhone = "+999999999999"
        const email = "999999999999@devotee.com"
        
        // 1. Initialize auth on the server (makes sure user and profile exist)
        const initRes = await fetch("/api/devotee/auth-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            phone: mockPhone, 
            signup: false, 
            name: "Mock Google Devotee",
            city: "Shyam Dham"
          })
        })
        
        let initResult = await initRes.json()
        if (!initResult.success) {
          const signupRes = await fetch("/api/devotee/auth-init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              phone: mockPhone, 
              signup: true,
              name: "Mock Google Devotee",
              city: "Shyam Dham"
            })
          })
          initResult = await signupRes.json()
        }
        
        // 2. Sign in with password on client (dev bypass)
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: "devotee_dev_bypass_123"
        })
        if (authError) throw authError
        
        if (data?.user) {
          const finalUser = {
            id: data.user.id,
            name: "Mock Google Devotee",
            phone: mockPhone,
            city: "Shyam Dham",
            initials: "GD"
          }
          if (onLoginSuccess) {
            onLoginSuccess(finalUser)
          }
          navigate("home")
        }
      } catch (err: any) {
        console.error("Mock Google login failed", err)
        setGoogleMessage(err.message || "Mock Google login failed.")
        setTimeout(() => setGoogleMessage(""), 3000)
      } finally {
        setLoading(false)
      }
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err: any) {
      console.error("Google login failed", err)
      setGoogleMessage(err.message || "Google Sign-In failed.")
      setTimeout(() => {
        setGoogleMessage("")
      }, 3000)
    }
  }

  return (
    <div className="relative -mx-4 md:-mx-8 -mt-5 -mb-24 lg:-mb-10 min-h-[100dvh] flex flex-col lg:flex-row overflow-hidden bg-[#FAF6F0]">
      
      {/* LEFT PANEL - Desktop Only (Golden Temple Arch & Deity Photo) */}
      <section className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-b from-[#FAF0E4] via-[#FFEEDC] to-[#FFF5EB] relative border-r border-amber-100/50">
        {/* Background Mandala overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-center"
          style={{ backgroundImage: "url('/images/mandala-pattern.png')", backgroundSize: "400px" }}
        />
        
        {/* Traditional Temple Spires Silhouette Watermark */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none overflow-hidden select-none">
          <svg viewBox="0 0 800 200" className="w-full h-full fill-amber-900/5">
            <path d="M 0 200 L 50 140 L 60 150 L 80 120 L 100 150 L 110 140 L 160 200 M 160 200 L 220 110 L 235 125 L 260 80 L 285 125 L 300 110 L 360 200 M 360 200 L 400 130 L 415 140 L 430 110 L 450 140 L 465 130 L 500 200 M 500 200 L 560 90 L 580 110 L 610 60 L 640 110 L 660 90 L 720 200 M 720 200 L 760 140 L 770 150 L 785 130 L 800 150 L 800 200 Z" />
          </svg>
        </div>

        {/* Top Header */}
        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#800000] to-[#E25822] text-white shadow-md">
            <Om className="size-5" />
          </span>
          <div>
            <h3 className="font-heading font-extrabold text-[#800000] text-sm tracking-wider">
              {t("app.header.title")}
            </h3>
            <p className="text-[10px] font-bold text-amber-800/80 uppercase tracking-widest">
              {t("home.hero.tagline")}
            </p>
          </div>
        </div>

        {/* Middle Deity Arch Portrait */}
        <div className="relative my-6 text-center z-10">
          <div className="relative w-80 h-110 mx-auto rounded-t-full overflow-hidden border-4 border-amber-600/20 shadow-2xl bg-white p-2">
            <div className="relative w-full h-full rounded-t-full overflow-hidden">
              <Image
                src="/images/khatu-shyam-deity.png"
                alt="Baba Shyam Deity"
                fill
                priority
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
          <p className="mt-4 font-heading text-xs font-bold text-amber-900/60 uppercase tracking-[0.2em]">
            {t("home.hero.tagline")}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-black text-[#800000] tracking-wide drop-shadow-sm">
            {t("info.temple.festivalsTitle") === "प्रमुख उत्सव" ? "बाबा श्याम हमारा" : "Baba Shyam Hamara"}
          </h2>
        </div>

        {/* Bottom Benefits */}
        <div className="relative grid grid-cols-3 gap-4 border-t border-amber-200/40 pt-6">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-9 place-items-center rounded-full bg-amber-50 text-[#800000] shadow-sm mb-2">
              <Icon name="ShieldCheck" className="size-4" />
            </span>
            <p className="text-xs font-bold text-amber-950">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "सुरक्षित" : "Secure"}</p>
            <p className="text-[10px] text-amber-800/70 mt-0.5">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "100% सुरक्षित लॉगिन" : "100% Secure Sign In"}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="grid size-9 place-items-center rounded-full bg-amber-50 text-[#800000] shadow-sm mb-2">
              <Icon name="Bell" className="size-4" />
            </span>
            <p className="text-xs font-bold text-amber-950">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "त्वरित सेवा" : "Fast Booking"}</p>
            <p className="text-[10px] text-amber-800/70 mt-0.5">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "झटपट बुकिंग" : "Instant Passes"}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="grid size-9 place-items-center rounded-full bg-amber-50 text-[#800000] shadow-sm mb-2">
              <Icon name="Heart" className="size-4" />
            </span>
            <p className="text-xs font-bold text-amber-950">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "भक्ति से जुड़ें" : "Stay Devotional"}</p>
            <p className="text-[10px] text-amber-800/70 mt-0.5">{t("info.crowd.liveTracking") === "लाइव ट्रैकिंग" ? "श्याम प्रेम में डूबें" : "Immerse in Devotion"}</p>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL - Forms & Visual Interactions */}
      <section className="w-full lg:w-1/2 min-h-[100dvh] flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto">
        {/* Floating Language Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>

        {/* Dummy div to balance flex layout */}
        <div className="h-6" />

        {/* Central Glassmorphic Form Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-3xl border border-amber-100/70 bg-white shadow-xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            {/* Small center circle logo */}
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full border border-amber-200 bg-amber-50 text-[#800000] relative">
              <span className="font-heading font-extrabold text-sm tracking-widest select-none">
                {t("info.temple.festivalsTitle") === "प्रमुख उत्सव" ? "श्याम" : "Shyam"}
              </span>
              <span className="absolute -top-1 size-2 rounded-full bg-amber-500" />
            </div>

            <div className="mb-6 text-center">
              <h2 className="font-heading text-2xl font-black text-[#1A120B] tracking-wide">
                {t("auth.login.title")}
              </h2>
              <p className="mt-2 text-sm text-[#6b5440] leading-relaxed">
                {t("auth.login.description")}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#6b5440] uppercase tracking-wider">
                  {t("auth.login.phoneLabel")}
                </label>
                
                {/* Rounded phone inputs with flag selector */}
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-[#6b5440] font-extrabold border-r border-amber-200/80 pr-2.5 py-1.5 select-none bg-amber-50/50 rounded-l-xl">
                    <span className="text-sm">🇮🇳</span>
                    <span className="text-xs">+91</span>
                    <Icon name="ChevronDown" className="size-3 text-amber-800" />
                  </div>
                  
                  <input
                    type="tel"
                    placeholder={t("auth.login.phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    disabled={loading}
                    className="w-full rounded-2xl border border-amber-200 bg-white py-4 pl-28 pr-4 text-sm font-semibold text-[#1A120B] shadow-inner outline-none transition duration-300 focus:border-[#800000] focus:ring-4 focus:ring-[#800000]/10 placeholder-amber-900/25 disabled:opacity-55"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600">
                  <Icon name="TriangleAlert" className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={phone.length !== 10 || loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#800000] to-[#E25822] py-4 text-base font-bold text-white shadow-[0_6px_20px_rgba(128,0,0,0.25)] transition duration-300 hover:shadow-[0_8px_25px_rgba(128,0,0,0.35)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Icon name="Loader2" className="size-5" />
                  </motion.div>
                ) : (
                  <>
                    <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {t("auth.login.button")}
                    <Icon name="ArrowRight" className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>


              {/* Divider */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-amber-100"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-amber-900/30 uppercase tracking-widest">
                  {t("common.or")}
                </span>
                <div className="flex-grow border-t border-amber-100"></div>
              </div>

              {/* Google Login Section */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="block text-xs font-bold text-[#6b5440] uppercase tracking-wider text-left mb-1.5">
                    Continue with Google
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-3.5 text-base font-bold text-gray-700 shadow-sm transition hover:shadow-md hover:bg-gray-50 active:scale-[0.98] hover:border-amber-200"
                  >
                    <svg className="size-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                <AnimatePresence>
                  {googleMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-semibold text-amber-800"
                    >
                      <Icon name="Info" className="size-4 shrink-0 text-amber-700" />
                      <span>{googleMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          
          {/* Back Button */}
          <button
            onClick={goBack}
            className="mt-6 flex items-center justify-center gap-2 w-full text-sm font-bold text-[#6b5440] hover:text-[#800000] transition-colors duration-300"
          >
            <Icon name="ArrowLeft" className="size-4" />
            {t("auth.login.backWelcome")}
          </button>
        </div>

        {/* Safety Footer */}
        <footer className="mt-8 pt-6 border-t border-amber-100/60 grid grid-cols-3 gap-2 text-center text-[10px] md:text-xs text-[#6b5440]/80">
          <div className="flex flex-col items-center gap-1">
            <Icon name="Lock" className="size-4 text-[#800000]" />
            <span className="font-semibold">{t("app.footer.safety")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name="Shield" className="size-4 text-[#800000]" />
            <span className="font-semibold">{t("app.footer.privacy")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name="Headset" className="size-4 text-[#800000]" />
            <span className="font-semibold">{t("app.footer.support")}</span>
          </div>
        </footer>
      </section>
    </div>
  )
}