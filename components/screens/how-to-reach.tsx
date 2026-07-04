"use client"

import { useState, useEffect } from "react"
import { Icon, SectionTitle } from "@/components/shared"
import { devoteeApi } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/contexts/LanguageContext"

interface TempleDestination {
  id: string
  name: string
  latitude: number
  longitude: number
  google_maps_url: string
}

interface TravelOption {
  id: string
  mode: string
  icon: string
  detail: string
  detail_hi?: string
  display_order: number
}

interface RouteInfo {
  id: string
  title: string
  distance: string
  duration: string
  description: string
}

interface TransportInstruction {
  id: string
  title: string
  instructions: string
}

export function HowToReachScreen() {
  const { t, lang } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [destination, setDestination] = useState<TempleDestination | null>(null)
  const [travelOptions, setTravelOptions] = useState<TravelOption[]>([])
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [instructions, setInstructions] = useState<TransportInstruction[]>([])

  const fetchReachInfo = () => {
    devoteeApi.getReachInfo()
      .then((res: any) => {
        if (res) {
          setDestination(res.destination || null)
          setTravelOptions(res.travel_options || [])
          setRoutes(res.routes || [])
          setInstructions(res.instructions || [])
        }
      })
      .catch((err) => {
        console.error("Failed to load reach information", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchReachInfo()

    const channel = supabase
      .channel("public:reach_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "temple_destinations" },
        () => fetchReachInfo()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "travel_options" },
        () => fetchReachInfo()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "route_information" },
        () => fetchReachInfo()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transport_instructions" },
        () => fetchReachInfo()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#FF8C00] border-t-transparent" />
      </div>
    )
  }

  const mapEmbedUrl = destination
    ? `https://maps.google.com/maps?q=${destination.latitude},${destination.longitude}&z=15&output=embed`
    : "https://maps.google.com/maps?q=27.36965159,75.39855581&z=15&output=embed"

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Map */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="relative h-64 w-full bg-slate-100">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <Icon name="MapPinned" className="size-5 text-[#FF8C00]" />
            <div>
              <p className="font-heading text-sm font-bold text-foreground">
                {destination?.name || "Shree Khatu Shyam Ji Temple"}
              </p>
              <p className="text-xs text-muted-foreground">
                {destination
                  ? `Lat: ${destination.latitude}, Long: ${destination.longitude}`
                  : "Khatu, Sikar, Rajasthan 332602"}
              </p>
            </div>
          </div>
          {destination?.google_maps_url && (
            <a
              href={destination.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF8C00] to-[#FFA726] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md active:scale-95 animate-pulse"
            >
              <Icon name="Navigation" className="size-4" />
              {lang === "hi" ? "दिशानिर्देश" : "Directions"}
            </a>
          )}
        </div>
      </section>

      {/* Travel options */}
      <section>
        <SectionTitle title="Travel Options" hindi="यात्रा के साधन" />
        <div className="space-y-3">
          {travelOptions.map((t) => (
            <div key={t.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF8C00] to-[#FFA726] text-white shadow">
                <Icon name={t.icon || "CarFront"} className="size-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">{t.mode}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {lang === "hi" && t.detail_hi ? t.detail_hi : t.detail}
                </p>
              </div>
            </div>
          ))}
          {travelOptions.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">No travel modes configured.</p>
          )}
        </div>
      </section>

      {/* Route information */}
      {routes.length > 0 && (
        <section>
          <SectionTitle title="Routes & Directions" hindi="मार्ग और दिशानिर्देश" />
          <div className="space-y-3">
            {routes.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm font-bold text-foreground">{r.title}</p>
                  <div className="flex gap-2">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF8C00]">
                      {r.distance}
                    </span>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-muted-foreground">
                      {r.duration}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transport guidelines / instructions */}
      {instructions.length > 0 && (
        <section className="rounded-3xl border border-[#FFE0B2] bg-[#FFF8E7] p-4 space-y-3">
          <p className="flex items-center gap-2 font-heading font-bold text-[#FF8C00]">
            <Icon name="Info" className="size-5" />
            {lang === "hi" ? "परिवहन निर्देश" : "Transit Guidelines"}
          </p>
          <div className="space-y-2">
            {instructions.map((ins) => (
              <div key={ins.id} className="text-xs leading-relaxed text-[#8a5a22]">
                <strong className="block font-semibold mb-0.5">{ins.title}</strong>
                {ins.instructions}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
