"use client"
import { useState } from "react"
import { Icon } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { devoteeApi } from "@/lib/api-client"

const helplines = [
  { name: "Medical Emergency", number: "108", icon: "HeartPulse", color: "text-red-500", bg: "bg-red-50 border-red-100" },
  { name: "Police Helpline", number: "100", icon: "Shield", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  { name: "Fire Station", number: "101", icon: "Flame", color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
  { name: "Temple Security", number: "9887654321", icon: "ShieldCheck", color: "text-green-600", bg: "bg-green-50 border-green-100" },
  { name: "Lost & Found Desk", number: "01572-280555", icon: "PackageSearch", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  { name: "District Ambulance", number: "112", icon: "Truck", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
]

export function EmergencyHelplineScreen({ navigate }: { navigate?: (s: ScreenKey) => void }) {
  const { t } = useLanguage()
  
  // State for SOS trigger
  const [sosType, setSosType] = useState<"medical" | "fire" | "crowd" | "security">("medical")
  const [locationText, setLocationText] = useState("")
  const [triggering, setTriggering] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const triggerSOS = async () => {
    setTriggering(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const activeUserStr = localStorage.getItem("current_user")
      if (!activeUserStr) {
        setErrorMsg("Please login to trigger live SOS dispatcher.")
        setTriggering(false)
        return
      }

      const activeUser = JSON.parse(activeUserStr)
      const profileId = activeUser.id

      // Simulated or real GPS coordinates
      let latitude = 27.3712
      let longitude = 75.3995

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude
              longitude = pos.coords.longitude
              resolve()
            },
            () => {
              resolve()
            },
            { timeout: 3000 }
          )
        })
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        // Fallback local storage logging for testing/demo
        const mockSos = {
          id: crypto.randomUUID(),
          profileId,
          profileName: activeUser.name || "Test Pilgrim",
          profilePhone: activeUser.phone || "+91 99999 88888",
          incidentType: sosType,
          locationLatitude: latitude,
          locationLongitude: longitude,
          locationText: locationText || "Temple Entrance Corridor",
          status: "pending",
          createdAt: new Date().toISOString()
        }

        const localSosList = JSON.parse(localStorage.getItem("mock_sos_requests") || "[]")
        localSosList.unshift(mockSos)
        localStorage.setItem("mock_sos_requests", JSON.stringify(localSosList))

        setSuccessMsg("SOS alert dispatched successfully (Demo Mode)!")
        setTriggering(false)
        setLocationText("")
        return
      }

      // Write to REST API
      await devoteeApi.triggerSOS({
        incident_type: sosType,
        location_latitude: latitude,
        location_longitude: longitude,
        location_text: locationText || "Temple Complex Main Hall"
      })

      setSuccessMsg("Emergency dispatch alerted! A responder is being routed to your location.")
      setLocationText("")
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "Failed to trigger SOS alert.")
    } finally {
      setTriggering(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Khatu Dham</p>
        <h1 className="font-heading text-2xl font-bold text-foreground mt-1">{t("screens.services.emergencyHelpline.emergencyHelpline")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t("screens.services.emergencyHelpline.247MedicalPoliceAssistance")}</p>
      </header>

      {/* Premium Emergency SOS Trigger Module */}
      <section className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/40 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/20">
            <Icon name="Siren" className="size-5 animate-pulse" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-extrabold text-red-950">Live Incident SOS Dispatch</h3>
            <p className="text-[10px] text-red-800/80 font-bold">Alert the temple command center immediately</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "medical", label: "Medical Help", icon: "HeartPulse" },
            { key: "crowd", label: "Crowd Surge", icon: "Users" },
            { key: "fire", label: "Fire Incident", icon: "Flame" },
            { key: "security", label: "Security Risk", icon: "ShieldAlert" },
          ].map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => setSosType(type.key as any)}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                sosType === type.key
                  ? "bg-red-600 border-red-600 text-white shadow-sm"
                  : "bg-white border-red-200 text-red-900 hover:bg-red-50/50"
              }`}
            >
              <Icon name={type.icon} className="size-4 shrink-0" />
              {type.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-red-900/70">
            Current Location Details
          </label>
          <input
            type="text"
            placeholder="e.g. Near Gate 1 queue lines, VIP corridor"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none placeholder:text-red-900/30 text-red-950"
          />
        </div>

        <button
          type="button"
          onClick={triggerSOS}
          disabled={triggering}
          className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition hover:shadow-red-600/40 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {triggering ? (
            <span className="flex items-center gap-1.5">
              <Icon name="Loader2" className="size-4 animate-spin" />
              Dispatched...
            </span>
          ) : (
            <>
              <Icon name="Radio" className="size-4 animate-ping" />
              Trigger Live SOS Alert
            </>
          )}
        </button>

        {successMsg && (
          <p className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-1.5">
            <Icon name="CheckCircle" className="size-3.5" />
            {successMsg}
          </p>
        )}

        {errorMsg && (
          <p className="text-[10px] font-extrabold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-1.5">
            <Icon name="AlertTriangle" className="size-3.5" />
            {errorMsg}
          </p>
        )}
      </section>

      {/* Traditional Call Helplines */}
      <section className="space-y-3">
        <h3 className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Traditional Helpline Numbers
        </h3>
        {helplines.map((h) => (
          <a key={h.number} href={"tel:" + h.number} className={"flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-md active:scale-[0.98] " + h.bg}>
            <span className={"grid size-11 shrink-0 place-items-center rounded-xl bg-white/80 shadow-inner " + h.color}>
              <Icon name={h.icon} className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-heading text-sm font-bold text-foreground">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.number}</p>
            </div>
            <Icon name="Phone" className={"size-5 shrink-0 " + h.color} />
          </a>
        ))}
      </section>
    </div>
  )
}