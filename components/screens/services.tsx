"use client"

import { useState } from "react"
import { Icon } from "@/components/shared"
import { services } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"

const tints = [
  { bg: "bg-[#D97706]/10 border-[#D97706]/20", fg: "text-[#D97706]" },
  { bg: "bg-[#D4AF37]/10 border-[#D4AF37]/20", fg: "text-[#D4AF37]" },
  { bg: "bg-orange-500/10 border-orange-500/20", fg: "text-orange-500" },
  { bg: "bg-green-600/10 border-green-600/20", fg: "text-green-600" },
  { bg: "bg-blue-600/10 border-blue-600/20", fg: "text-blue-600" },
  { bg: "bg-purple-600/10 border-purple-600/20", fg: "text-purple-600" },
]



export function ServicesScreen({ navigate }: { navigate?: (s: ScreenKey) => void }) {
  const { t, tObject } = useLanguage()
  const [activeTab, setActiveTab] = useState<"services" | "tourist">("services")
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null)
  const touristPlaces: any[] = tObject("screens.services.touristPlacesList") || []

  return (
    <div className="space-y-6 pb-8">
      {/* Heading */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t("screens.services.khatuDham")}
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight text-foreground mt-1">
            {t("screens.services.servicesPlaces")}
          </h1>
          <p className="text-xs font-medium text-muted-foreground mt-1">
            {t("screens.services.everythingYouNeedForYourPilgrimage")}
          </p>
        </div>
        <span className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-secondary shadow-sm text-primary">
          <Icon name="LayoutGrid" className="size-6" />
        </span>
      </header>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary/60 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
            activeTab === "services"
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="LayoutGrid" className="size-4" />
          {t("screens.services.services")}
        </button>
        <button
          onClick={() => setActiveTab("tourist")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
            activeTab === "tourist"
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="MapPin" className="size-4" />
          {t("screens.services.touristPlaces")}
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === "services" && (
        <>
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            {services.map((s, i) => {
              const tColor = tints[i % tints.length]
              const isComingSoon = !s.screenKey
              return (
                <button
                  key={s.key}
                  onClick={() => s.screenKey && navigate && navigate(s.screenKey)}
                  disabled={isComingSoon}
                  className={`group flex w-full items-center gap-4 border-b border-border/50 px-5 py-4 text-left transition last:border-0 ${
                    isComingSoon ? "opacity-70 cursor-not-allowed" : "hover:bg-secondary/30 active:bg-secondary/50"
                  }`}
                >
                  <span className={`grid size-12 shrink-0 place-items-center rounded-[1rem] border ${tColor.bg} ${tColor.fg} shadow-inner`}>
                    <Icon name={s.icon} className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-[15px] font-bold text-foreground">
                        {t("screens.services.items." + s.key + ".label")}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/10">
                        {t("screens.services.items." + s.key + ".meta")}
                      </span>
                      {isComingSoon && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                          {t("screens.services.soon")}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {t("screens.services.items." + s.key + ".desc")}
                    </span>
                  </span>
                  {!isComingSoon && (
                    <Icon
                      name="ChevronRight"
                      className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
                    />
                  )}
                </button>
              )
            })}
          </section>

          <section className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 shadow-sm">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-green-100 text-green-600 shadow-inner">
              <Icon name="ShieldCheck" className="size-5" />
            </span>
            <p className="text-xs leading-relaxed text-green-800 font-medium">
              {t("screens.services.allServicesAreVerifiedByTheShriShyamMandir")}
            </p>
          </section>
        </>
      )}

      {/* Tourist Places Tab */}
      {activeTab === "tourist" && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl bg-primary/5 border border-primary/20 p-4">
            <Icon name="Info" className="size-5 shrink-0 text-primary mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed font-medium">
              {t("screens.services.exploreTheSpiritualAndHistoricalHeritageArou")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {touristPlaces.map((place, i) => (
              <div
                key={place.name}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Image / visual banner */}
                <div className={`relative h-36 bg-gradient-to-br ${place.gradient} flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "120px" }} />
                  <span className="grid size-16 place-items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                    <Icon name={place.icon} className="size-8 text-white drop-shadow-lg" />
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-black/25 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20">
                    {place.tag}
                  </span>
                  <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/25 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white">
                    <Icon name="MapPin" className="size-3" />
                    {place.distance}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-heading text-base font-bold text-foreground leading-tight">
                    {place.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {place.desc}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setSelectedPlace(selectedPlace === i ? null : i)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-secondary py-2 text-xs font-bold text-primary transition hover:bg-primary/10"
                    >
                      <Icon name={selectedPlace === i ? "ChevronUp" : "ChevronDown"} className="size-3.5" />
                      {t("screens.services.details")}
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(place.name + " Rajasthan")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md"
                    >
                      <Icon name="Map" className="size-3.5" />
                      {t("screens.services.directions")}
                    </a>
                  </div>

                  {selectedPlace === i && (
                    <div className="mt-3 rounded-xl bg-secondary/50 p-3 border border-border animate-in slide-in-from-top-1 duration-200">
                      <p className="text-xs text-foreground leading-relaxed font-medium">
                        {place.desc}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Navigation" className="size-3.5 text-primary" />
                        <span>{t("screens.services.distanceFromKhatuShyam")} <span className="font-bold text-foreground">{place.distance}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Explore CTA */}
          <section className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D97706]/10 via-[#D4AF37]/5 to-card p-6 text-center shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "150px" }} />
            <div className="relative">
              <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-xl mx-auto mb-4">
                <Icon name="Compass" className="size-7" />
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {t("screens.services.planYourFullItinerary")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t("screens.services.combineYourDarshanWithVisitsToNearbySpiritu")}
              </p>
              <button
                onClick={() => navigate && navigate("reach")}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
              >
                <Icon name="MapPin" className="size-4" />
                {t("screens.services.howToReachKhatu")}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
