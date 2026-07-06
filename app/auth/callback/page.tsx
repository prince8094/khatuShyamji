"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Icon, Om } from "@/components/shared"
import { motion } from "framer-motion"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    const handleAuthCallback = async () => {
      try {
        // Wait for session to be established by Supabase client
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (!session?.user) {
          // If no session found immediately, wait for onAuthStateChange to fire
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (currentSession?.user && active) {
              await processSessionUser(currentSession.user)
            }
          })

          // Timeout after 10 seconds if no session is captured
          setTimeout(() => {
            if (active && status === "loading") {
              authListener.subscription.unsubscribe()
              setStatus("error")
              setErrorMessage("Authentication timed out. Unable to retrieve session from Google.")
            }
          }, 10000)
          return
        }

        if (active) {
          await processSessionUser(session.user)
        }
      } catch (err: any) {
        console.error("Callback verification failed:", err)
        if (active) {
          setStatus("error")
          setErrorMessage(err.message || "Google authentication failed. Please try again.")
        }
      }
    }

    const processSessionUser = async (user: any) => {
      try {
        // 1. Check if profile exists in public.profiles
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profileErr) {
          console.error("Failed checking existing profile:", profileErr)
        }

        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Google Devotee"
        const email = user.email || ""
        const photoUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || ""

        if (!profile) {
          // 2. Profile does not exist - generate unique placeholder phone number
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

          // Try inserting profile with provider column (primary attempt)
          const insertPayload: Record<string, any> = {
            id: user.id,
            name: fullName,
            phone: phone,
            email: email || null,
            photo_url: photoUrl || null,
            city: "",
            provider: "google"
          }

          const { error: insErr } = await supabase
            .from("profiles")
            .insert(insertPayload)

          if (insErr) {
            console.warn("Insert with provider failed, trying without provider column:", insErr)
            // PGRST204 is column not found or schema caching issue
            if (insErr.code === "PGRST204" || insErr.message?.includes("provider")) {
              delete insertPayload.provider
              const { error: retryErr } = await supabase
                .from("profiles")
                .insert(insertPayload)

              if (retryErr) {
                console.error("Retry insert failed:", retryErr)
                throw retryErr
              }
            } else {
              throw insErr
            }
          }
        } else {
          // 3. Profile exists - update last_login
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
                console.error("Retry update failed:", retryErr)
                throw retryErr
              }
            } else {
              throw updErr
            }
          }
        }

        // 4. Sync local storage settings for active sessions
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("id, name, phone, city")
          .eq("id", user.id)
          .single()

        if (updatedProfile) {
          const userObj = {
            id: updatedProfile.id,
            name: updatedProfile.name,
            phone: updatedProfile.phone,
            city: updatedProfile.city || "",
            initials: updatedProfile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
          }
          localStorage.setItem("current_user", JSON.stringify(userObj))
        }

        if (active) {
          setStatus("success")
          // Redirect back to root shell displaying Home screen
          setTimeout(() => {
            window.location.href = "/?screen=home"
          }, 1000)
        }
      } catch (err: any) {
        console.error("Processing user session failed:", err)
        if (active) {
          setStatus("error")
          setErrorMessage(err.message || "Unable to sync devotee profile.")
        }
      }
    }

    handleAuthCallback()

    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#FAF6F0]">
      {/* Traditional background watermark */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-center"
        style={{ backgroundImage: "url('/images/mandala-pattern.png')", backgroundSize: "400px" }}
      />

      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none overflow-hidden select-none">
        <svg viewBox="0 0 800 200" className="w-full h-full fill-amber-900/5">
          <path d="M 0 200 L 50 140 L 60 150 L 80 120 L 100 150 L 110 140 L 160 200 M 160 200 L 220 110 L 235 125 L 260 80 L 285 125 L 300 110 L 360 200 Z" />
        </svg>
      </div>

      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-amber-100/70 bg-white shadow-xl p-8 text-center"
      >
        {status === "loading" && (
          <div className="space-y-6">
            <div className="mx-auto grid size-20 place-items-center rounded-full border border-amber-200 bg-amber-50/50 p-4 relative">
              <span className="absolute inset-1 rounded-full border border-dashed border-[#800000]/25 animate-[spin_20s_linear_infinite]" />
              <Om className="size-8 text-[#800000] relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-black text-[#800000] tracking-wide animate-pulse">
                जय श्री श्याम
              </h2>
              <p className="text-sm font-semibold text-amber-900/70">
                Jai Shree Shyam
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="text-[#800000]"
              >
                <Icon name="Loader2" className="size-6" />
              </motion.div>
              <p className="text-xs text-[#6b5440]/80 font-bold uppercase tracking-wider">
                Connecting with Baba Shyam...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-green-50 border border-green-200 text-green-600">
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Icon name="CheckCircle" className="size-10" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl font-bold text-green-700 animate-bounce">
                Authentication Successful!
              </h2>
              <p className="text-xs text-amber-900/60 font-semibold">
                Welcome to Smart Pilgrim Portal
              </p>
            </div>

            <p className="text-xs text-gray-500 animate-pulse font-medium">
              Redirecting you to the portal home...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-red-50 border border-red-200 text-red-600">
              <Icon name="XCircle" className="size-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-lg font-bold text-red-700">
                Authentication Error
              </h2>
              <p className="text-xs text-red-600/80 font-semibold px-2">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setStatus("loading")
                  setErrorMessage("")
                  window.location.reload()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#800000] to-[#E25822] py-3 text-sm font-bold text-white shadow-md active:scale-[0.98] transition"
              >
                <Icon name="RefreshCw" className="size-4" />
                Retry Authentication
              </button>
              <button
                onClick={() => {
                  window.location.href = "/?screen=login"
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 active:scale-[0.98] transition hover:bg-gray-50"
              >
                <Icon name="ArrowLeft" className="size-4" />
                Back to Login
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
