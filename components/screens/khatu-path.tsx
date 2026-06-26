 "use client"
 
 import { useState, useEffect } from "react"
 import { motion, AnimatePresence } from "framer-motion"
 import { Icon } from "@/components/shared"
 import { useLanguage } from "@/lib/contexts/LanguageContext"
 import { useAudio } from "@/lib/contexts/AudioContext"
 
 type Stage = {
   id: number
   name: string
   distanceLeft: number
   desc: string
   bgImage: string
   activity: string
 }
 
 type DevotionalItem = {
   id: string
   title: string
   type: "aarti" | "chalisa" | "bhajan"
   lyrics: string
 }
 
 export function KhatuPathScreen({ navigate }: { navigate: (s: any) => void }) {
   const { lang, t, tObject } = useLanguage()
   const STAGES: Stage[] = tObject("padyatra.stages") || []
   const DEVOTIONAL_ITEMS: DevotionalItem[] = tObject("padyatra.devotionalItems") || []
   const { playTempleBell, soundEnabled, setSoundEnabled } = useAudio()
   
   const [activeTab, setActiveTab] = useState<"padyatra" | "devotional" | "jaap">("padyatra")
   const [currentStageIndex, setCurrentStageIndex] = useState(0)
   const [chants, setChants] = useState(0)
   const [activeLyrics, setActiveLyrics] = useState<DevotionalItem | null>(null)
   const [playStatus, setPlayStatus] = useState<Record<string, boolean>>({})
 
   // Load progress on mount
   useEffect(() => {
     if (typeof window !== "undefined") {
       const savedIndex = localStorage.getItem("khatu_path_stage")
       if (savedIndex) {
         setCurrentStageIndex(Number(savedIndex))
       }
       const savedChants = localStorage.getItem("khatu_path_chants")
       if (savedChants) {
         setChants(Number(savedChants))
       }
     }
   }, [])
 
   const handleNextStage = () => {
     if (currentStageIndex < STAGES.length - 1) {
       const nextIndex = currentStageIndex + 1
       setCurrentStageIndex(nextIndex)
       localStorage.setItem("khatu_path_stage", String(nextIndex))
       try {
         playTempleBell("single")
       } catch (e) {}
     } else {
       // Completed, redirect to live darshan or home
       alert(t("screens.khatuPath.congratulationsYouHaveCompletedYourSpiritual"))
       navigate("live-darshan")
     }
   }
 
   const handleResetJourney = () => {
     if (confirm(t("screens.khatuPath.areYouSureYouWantToRestartYourJourneyFrom"))) {
       setCurrentStageIndex(0)
       localStorage.setItem("khatu_path_stage", "0")
       try {
         playTempleBell("single")
       } catch (e) {}
     }
   }
 
   const handleChantTap = () => {
     const newChants = chants + 1
     setChants(newChants)
     localStorage.setItem("khatu_path_chants", String(newChants))
     if (newChants % 11 === 0) {
       try {
         playTempleBell("single")
       } catch (e) {}
     }
   }
 
   const handleResetChants = () => {
     setChants(0)
     localStorage.setItem("khatu_path_chants", "0")
   }
 
   const handlePlayAudio = (id: string) => {
     // Toggle play status
     setPlayStatus(prev => {
       const updated = { ...prev, [id]: !prev[id] }
       // Play sound notification if starting
       if (updated[id]) {
         try {
           playTempleBell("single")
         } catch (e) {}
         // Show simulated notification
         setTimeout(() => {
           alert(t("screens.khatuPath.audioStreamingIsComingSoonPlayingOfflineTem"))
         }, 100)
       }
       return updated
     })
   }
 
   const activeStage = STAGES[currentStageIndex]
   const progressPercent = (currentStageIndex / (STAGES.length - 1)) * 100
 
   return (
     <div className="space-y-6 pb-12">
       {/* Header Info */}
       <div className="flex items-center justify-between">
         <div>
           <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
             <Icon name="Footprints" className="text-primary size-6 animate-pulse" />
             {t("screens.khatuPath.khatuPadyatra")}
           </h2>
           <p className="text-xs text-muted-foreground mt-0.5">
             {t("screens.khatuPath.experienceTheSpiritualWalkFromRingasToKhatu")}
           </p>
         </div>
         <button
           onClick={() => setSoundEnabled(!soundEnabled)}
           className={`grid size-10 place-items-center rounded-2xl border transition active:scale-95 ${
             soundEnabled ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
           }`}
         >
           <Icon name={soundEnabled ? "Volume2" : "VolumeX"} className="size-5" />
         </button>
       </div>
 
       {/* Tabs Menu */}
       <div className="flex rounded-2xl bg-secondary/60 p-1 gap-1">
         {[
           { key: "padyatra", label: t("screens.khatuPath.journeyGuide"), icon: "Map" },
           { key: "devotional", label: t("screens.khatuPath.textsBhajans"), icon: "Music" },
           { key: "jaap", label: t("screens.khatuPath.shyamJaapCounter"), icon: "Fingerprint" }
         ].map((tab) => (
           <button
             key={tab.key}
             onClick={() => setActiveTab(tab.key as any)}
             className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-1 text-center text-xs font-bold transition-all duration-200 ${
               activeTab === tab.key
                 ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                 : "text-muted-foreground hover:text-foreground"
             }`}
           >
             <Icon name={tab.icon} className="size-4" />
             <span>{tab.label}</span>
           </button>
         ))}
       </div>
 
       {/* --- CONTENT AREA --- */}
       <AnimatePresence mode="wait">
         {/* 1. PADYATRA JOURNEY GUIDE */}
         {activeTab === "padyatra" && (
           <motion.div
             key="padyatra"
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             className="space-y-6"
           >
             {/* Journey Progress Hero Card */}
             <div 
               className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl border border-primary/20"
               style={{ background: activeStage.bgImage }}
             >
               <div className="absolute inset-0 bg-[url('/images/mandala-pattern.png')] bg-cover opacity-[0.06] pointer-events-none" />
               
               <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                 <div className="flex items-start justify-between">
                   <div>
                     <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FFF8F0]">
                        {lang === 'hi' ? `चरण ${activeStage.id} / 6` : `Stage ${activeStage.id} of 6`}
                     </span>
                     <h3 className="font-heading text-2xl font-bold mt-2 text-[#D4AF37] drop-shadow-md">
                       {activeStage.name}
                     </h3>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] uppercase tracking-widest text-[#FFF8F0]/70">{t("screens.khatuPath.distanceLeft")}</p>
                     <p className="font-heading text-2xl font-bold text-white mt-0.5">
                       {activeStage.distanceLeft} <span className="text-xs">KM</span>
                     </p>
                   </div>
                 </div>
 
                 <p className="text-sm text-white/90 leading-relaxed font-medium">
                   {activeStage.desc}
                 </p>
 
                 {/* Interactive Activity Box */}
                 <div className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
                   <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                     <Icon name="Activity" className="size-4" />
                     {t("screens.khatuPath.stageTaskExperience")}
                   </p>
                   <p className="text-xs text-white/95 mt-1 leading-relaxed">
                     {activeStage.activity}
                   </p>
                 </div>
 
                 {/* Progress bar */}
                 <div className="space-y-1.5 pt-2">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/80">
                     <span>{t("screens.khatuPath.ringas0")}</span>
                     <span>{t("screens.khatuPath.shreeShyamDarbar100")}</span>
                   </div>
                   <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
                     <div 
                       className="h-full bg-gradient-to-r from-[#D97706] to-[#D4AF37] shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-700"
                       style={{ width: `${progressPercent}%` }}
                     />
                   </div>
                 </div>
 
                 {/* Navigation Buttons */}
                 <div className="flex gap-3 pt-2">
                   {currentStageIndex > 0 && (
                     <button
                       onClick={handleResetJourney}
                       className="flex-1 border border-white/30 rounded-2xl py-3 text-xs font-bold text-white/90 hover:bg-white/10 transition active:scale-[0.98]"
                     >
                       <Icon name="RotateCcw" className="size-4 inline mr-1" />
                       {t("screens.khatuPath.resetJourney")}
                     </button>
                   )}
                   <button
                     onClick={handleNextStage}
                     className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3 px-6 text-xs font-bold text-white shadow-lg active:scale-[0.98] transition hover:shadow-xl"
                   >
                     <span>
                       {currentStageIndex === STAGES.length - 1 
                         ? t("screens.khatuPath.enterMainDarbar") 
                         : t("screens.khatuPath.continueToNextStage")}
                     </span>
                     <Icon name="ArrowRight" className="size-4" />
                   </button>
                 </div>
               </div>
             </div>
 
             {/* Stages overview road map card */}
             <div className="rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm">
               <h4 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                 <Icon name="MapPin" className="text-primary size-4" />
                 {t("screens.khatuPath.padyatraMilestonesMap")}
               </h4>
               <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                 {STAGES.map((s, idx) => {
                   const isActive = idx === currentStageIndex
                   const isPassed = idx < currentStageIndex
                   return (
                     <div key={s.id} className="relative flex items-start gap-4">
                       {/* Step Circle */}
                       <span className={`absolute -left-[23px] top-1 grid size-5 place-items-center rounded-full border text-[9px] font-bold shadow-sm transition-all duration-300 ${
                         isActive 
                           ? "bg-primary border-primary text-white scale-125 ring-4 ring-primary/20" 
                           : isPassed 
                           ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D97706]"
                           : "bg-secondary border-border text-muted-foreground"
                       }`}>
                         {idx + 1}
                       </span>
                       <div className="min-w-0 flex-1">
                         <p className={`text-xs font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                           {s.name}
                         </p>
                         <p className="text-[10px] text-muted-foreground mt-0.5">
                           {s.distanceLeft} KM {t("screens.khatuPath.leftToTemple")}
                         </p>
                       </div>
                       {isActive && (
                         <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-primary animate-pulse">
                           {t("screens.khatuPath.current")}
                         </span>
                       )}
                     </div>
                   )
                 })}
               </div>
             </div>
           </motion.div>
         )}
 
         {/* 2. DEVOTIONAL TEXTS & BHAJANS */}
         {activeTab === "devotional" && (
           <motion.div
             key="devotional"
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             className="space-y-4"
           >
             <div className="rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm">
               <div className="flex items-center gap-3">
                 <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary shadow-inner">
                   <Icon name="BookOpen" className="size-5" />
                 </span>
                 <div>
                   <h3 className="font-heading text-sm font-bold text-foreground">
                     {t("screens.khatuPath.bhajanAartiSangrah")}
                   </h3>
                   <p className="text-[11px] text-muted-foreground mt-0.5">
                     {t("screens.khatuPath.listenOrReadLyricsOfPopularDevotionalPaths")}
                   </p>
                 </div>
               </div>
 
               <div className="space-y-3 pt-2">
                 {DEVOTIONAL_ITEMS.map((item) => {
                   const isPlaying = playStatus[item.id] || false
                   return (
                     <article 
                       key={item.id}
                       className="rounded-2xl border border-border bg-secondary/20 p-4 flex items-center justify-between hover:border-primary/30 transition shadow-sm"
                     >
                       <div className="min-w-0 flex-1 pr-4">
                         <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1.5">
                           {t("padyatra." + item.type)}
                         </span>
                         <h4 className="text-xs font-bold text-foreground truncate">
                           {item.title}
                         </h4>
                       </div>
 
                       <div className="flex items-center gap-2">
                         {/* Read lyrics button */}
                         <button
                           onClick={() => setActiveLyrics(item)}
                           className="grid size-9 place-items-center rounded-xl bg-white border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition active:scale-95"
                           title={t("screens.khatuPath.readLyrics")}
                         >
                           <Icon name="FileText" className="size-4" />
                         </button>
                         
                         {/* Play/Listen button */}
                         <button
                           onClick={() => handlePlayAudio(item.id)}
                           className={`grid size-9 place-items-center rounded-xl transition active:scale-95 ${
                             isPlaying 
                               ? "bg-primary text-white shadow-md animate-pulse" 
                               : "bg-white border border-border text-primary hover:bg-secondary/50"
                           }`}
                           title={t("screens.khatuPath.listen")}
                         >
                           <Icon name={isPlaying ? "Pause" : "Play"} className="size-4" />
                         </button>
                       </div>
                     </article>
                   )
                 })}
               </div>
             </div>
 
             {/* Modal lyrics overlay */}
             <AnimatePresence>
               {activeLyrics && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                 >
                   <motion.div 
                     initial={{ scale: 0.9, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.9, y: 20 }}
                     className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#D4AF37]/30 max-h-[80vh] flex flex-col"
                   >
                     <div className="flex items-center justify-between border-b border-border pb-3 mb-4 shrink-0">
                       <h4 className="font-heading text-base font-bold text-foreground">
                         {activeLyrics.title}
                       </h4>
                       <button
                         onClick={() => setActiveLyrics(null)}
                         className="grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:bg-red-50 hover:text-destructive transition"
                       >
                         <Icon name="X" className="size-4" />
                       </button>
                     </div>
 
                     <div className="flex-1 overflow-y-auto text-center space-y-4 px-2 py-2">
                       <p className="text-xs text-muted-foreground italic font-semibold mb-2">
                         {t("screens.khatuPath.lyricsDevanagariRoman")}
                       </p>
                       <pre className="font-sans text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8D5B7]/55">
                         {activeLyrics.lyrics}
                       </pre>
                     </div>
 
                     <div className="pt-4 border-t border-border mt-4 shrink-0">
                       <button
                         onClick={() => {
                           handlePlayAudio(activeLyrics.id)
                           setActiveLyrics(null)
                         }}
                         className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3 text-xs font-bold text-white shadow-md active:scale-95 transition"
                       >
                         <Icon name="Volume2" className="size-4" />
                         {t("screens.khatuPath.listenAudioChant")}
                       </button>
                     </div>
                   </motion.div>
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.div>
         )}
 
         {/* 3. SHYAM JAAP COUNTER */}
         {activeTab === "jaap" && (
           <motion.div
             key="jaap"
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             className="space-y-6"
           >
             {/* Jaap Counter Device */}
             <div className="rounded-[2.5rem] bg-gradient-to-br from-[#1A120B] to-[#2A1D13] border-2 border-[#D4AF37]/40 p-6 text-center text-white shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('/images/mandala-pattern.png')] bg-cover opacity-[0.04] pointer-events-none" />
               <div className="absolute top-0 right-0 w-36 h-36 bg-[#D97706]/10 blur-3xl rounded-full" />
               
               <h3 className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase mb-4">
                 {t("screens.khatuPath.shyamJaapMantra")}
               </h3>
 
               <div className="flex flex-col items-center justify-center space-y-6 py-4">
                 {/* Large Counter Circular Ring */}
                 <div className="relative">
                   <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#D97706] to-[#D4AF37] opacity-20 blur-[6px] animate-pulse" />
                   
                   <motion.button 
                     whileTap={{ scale: 0.92 }}
                     onClick={handleChantTap}
                     className="relative grid size-36 place-items-center rounded-full bg-[#1c110a] border-4 border-[#D4AF37]/50 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),0_8px_24px_rgba(217,119,6,0.3)] active:border-primary transition"
                   >
                     <span className="font-heading text-5xl font-extrabold text-[#D4AF37] tracking-tight drop-shadow-md">
                       {chants}
                     </span>
                     <span className="text-[9px] uppercase tracking-widest text-[#FFF8F0]/50 absolute bottom-6 font-bold">
                       {t("screens.khatuPath.tapJaap")}
                     </span>
                   </motion.button>
                 </div>
 
                 {/* Reset button */}
                 <button 
                   onClick={handleResetChants}
                   className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95"
                 >
                   <Icon name="RotateCcw" className="size-3.5" />
                   <span>{t("screens.khatuPath.resetCount")}</span>
                 </button>
               </div>
 
               {/* Guide Quote */}
               <p className="text-[10px] text-[#FFF8F0]/70 mt-4 leading-relaxed font-semibold italic">
                 "{t("screens.khatuPath.chantHareKaSaharaBabaShyamHamaraWhileWalki")}"
               </p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   )
 }
 
