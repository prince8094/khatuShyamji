"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import type { ScreenKey } from "@/lib/data"
import { useLanguage } from "@/lib/contexts/LanguageContext"

const suggestions = [
  { en: "Temple timings?", hi: "मंदिर का समय?" },
  { en: "Where to park?", hi: "पार्किंग कहां है?" },
  { en: "How to reach?", hi: "कैसे पहुंचें?" },
  { en: "Crowd status?", hi: "भीड़ कितनी है?" },
]

const faqAnswers: Record<string, { en: string; hi: string }> = {
  "Temple timings?": {
    en: "Morning darshan is from 5:30 AM to 1:00 PM. Evening darshan is from 4:00 PM to 10:00 PM. Mangala Aarti is held at 4:30 AM.",
    hi: "सुबह का दर्शन: सुबह 5:30 से दोपहर 1:00 बजे तक। शाम का दर्शन: शाम 4:00 से रात 10:00 बजे तक। मंगला आरती सुबह 4:30 बजे होती है।",
  },
  "Where to park?": {
    en: "Parking Lot A is near Gate 1 (currently full). Parking Lot B near Gate 3 has 320 spaces available. Free shuttle runs every 15 minutes to the temple.",
    hi: "पार्किंग लॉट A गेट 1 के पास है (अभी भरा हुआ है)। गेट 3 के पास पार्किंग लॉट B में 320 स्थान उपलब्ध हैं। मंदिर के लिए हर 15 मिनट में मुफ्त शटल चलती है।",
  },
  "How to reach?": {
    en: "The nearest railway station is Ringas Junction, 17 kilometers away. From Jaipur, take NH-148D, which takes about 1 hour 45 minutes. Cabs and buses are also available from Sikar, 43 kilometers away.",
    hi: "निकटतम रेलवे स्टेशन रींगस जंक्शन है, जो 17 किलोमीटर दूर है। जयपुर से: NH-148D लें, लगभग 1 घंटे 45 मिनट का समय लगता है। सीकर से भी टैक्सी और बसें उपलब्ध हैं, जो 43 किलोमीटर दूर है।",
  },
  "Crowd status?": {
    en: "Current crowd level is Moderate with approximately 6,400 devotees. The best times to visit are 5 to 7 AM or 7 to 9 PM for shorter wait times.",
    hi: "वर्तमान भीड़ का स्तर मध्यम है, जिसमें लगभग 6,400 भक्त हैं। कम प्रतीक्षा समय के लिए दर्शन करने का सबसे अच्छा समय सुबह 5 से 7 बजे या शाम 7 से 9 बजे है।",
  },
}

export function ShyamSahayakScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t, lang } = useLanguage()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([])
  
  const recognitionRef = useRef<any>(null)
  const isRunningRef = useRef(false)       // tracks whether .start() has been called
  const isComponentMounted = useRef(true)

  // Initialize SpeechSynthesis greeting
  useEffect(() => {
    isComponentMounted.current = true
    const greeting = t("screens.shyamSahayak.khamaGhaniBhaktIAmShyamSahayakAskMeAnythi")
    setResponse(greeting)
    
    return () => {
      isComponentMounted.current = false
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [t])

  // Setup browser SpeechRecognition
  useEffect(() => {
    // Tear down any existing instance before creating a new one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        if (isRunningRef.current) {
          recognitionRef.current.stop()
          isRunningRef.current = false
        }
      } catch (_) {}
      recognitionRef.current = null
    }
    setIsListening(false)

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = lang === "en" ? "en-IN" : "hi-IN"

        rec.onresult = (event: any) => {
          if (!isComponentMounted.current) return
          isRunningRef.current = false
          const text = event.results[0][0].transcript
          setTranscript(text)
          setChatHistory((prev) => [...prev, { role: "user", text }])

          // Match speech query to FAQs
          let matchedAnswer = ""
          const lowerText = text.toLowerCase()
          if (lowerText.includes("time") || lowerText.includes("timing") || lowerText.includes("समय") || lowerText.includes("आरती") || lowerText.includes("खुल")) {
            const ans = faqAnswers["Temple timings?"]
            matchedAnswer = lang === "hi" ? ans.hi : ans.en
          } else if (lowerText.includes("park") || lowerText.includes("praking") || lowerText.includes("पार्किंग") || lowerText.includes("गाड़ी")) {
            const ans = faqAnswers["Where to park?"]
            matchedAnswer = lang === "hi" ? ans.hi : ans.en
          } else if (lowerText.includes("reach") || lowerText.includes("route") || lowerText.includes("मार्ग") || lowerText.includes("पहुंचें") || lowerText.includes("रास्ता") || lowerText.includes("रेलवे")) {
            const ans = faqAnswers["How to reach?"]
            matchedAnswer = lang === "hi" ? ans.hi : ans.en
          } else if (lowerText.includes("crowd") || lowerText.includes("rush") || lowerText.includes("भीड़") || lowerText.includes("स्थिति") || lowerText.includes("लाइन")) {
            const ans = faqAnswers["Crowd status?"]
            matchedAnswer = lang === "hi" ? ans.hi : ans.en
          } else {
            matchedAnswer = lang === "hi"
              ? `मैंने आपको "${text}" कहते सुना। मैं मंदिर के समय, पार्किंग, मार्ग या भीड़ की स्थिति में सहायता कर सकता हूँ। कृपया इनमें से कुछ पूछें!`
              : `I heard you say "${text}". I can help with temple timings, parking, route directions, or crowd status. Please ask one of these topics!`
          }

          setTimeout(() => {
            if (!isComponentMounted.current) return
            setResponse(matchedAnswer)
            setChatHistory((prev) => [...prev, { role: "ai", text: matchedAnswer }])
            speakText(matchedAnswer)
          }, 900)
        }

        rec.onerror = (e: any) => {
          // e.error is a string like "aborted", "no-speech", "not-allowed", "network" etc.
          const code = e?.error ?? "unknown"
          if (code === "aborted") {
            // normal stop — ignore silently
          } else if (code === "network") {
            // Chrome's SpeechRecognition requires Google's cloud servers (speech.googleapis.com).
            // This error fires when that service is unreachable (offline, HTTPS required, or blocked).
            const msg =
              lang === "hi"
                ? "वॉयस पहचान उपलब्ध नहीं है। कृपया टेक्स्ट में टाइप करें।"
                : "Voice recognition unavailable. Please type your question instead."
            setResponse(msg)
          } else if (code === "not-allowed") {
            const msg =
              lang === "hi"
                ? "माइक की अनुमति नहीं मिली। ब्राउज़र सेटिंग में माइक चालू करें।"
                : "Microphone permission denied. Please allow mic access in browser settings."
            setResponse(msg)
          } else {
            console.warn("Speech recognition error:", code)
          }
          isRunningRef.current = false
          setIsListening(false)
        }

        rec.onend = () => {
          isRunningRef.current = false
          setIsListening(false)
        }

        recognitionRef.current = rec
      }
    }
  }, [lang])

  // Helper to speak output text
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel() // stop any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Detect language to choose correct voice accent
        const containsHindi = /[\u0900-\u097F]/.test(text)
        utterance.lang = containsHindi ? "hi-IN" : "en-IN"
        utterance.rate = containsHindi ? 0.95 : 1.0 // slightly slower for clear hindi
        
        window.speechSynthesis.speak(utterance)
      } catch (err) {
        console.error("SpeechSynthesis error:", err)
      }
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      // User tapped Stop — abort the session
      if (recognitionRef.current && isRunningRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
      }
      isRunningRef.current = false
      setIsListening(false)
    } else {
      setTranscript("")
      setResponse(null)

      if (recognitionRef.current) {
        // Guard: don't call .start() if already running
        if (isRunningRef.current) return

        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }

        try {
          recognitionRef.current.start()
          isRunningRef.current = true
          setIsListening(true)
        } catch (err: any) {
          // InvalidStateError means recognition is already active — ignore
          if (err?.name !== "InvalidStateError") {
            console.warn("Failed to start recognition:", err)
          }
        }
      } else {
        // Fallback mock if speech recognition is not supported in this browser
        setIsListening(true)
        setTimeout(() => {
          if (!isComponentMounted.current) return
          const mockQ = t("screens.shyamSahayak.templeTimings")
          setTranscript(mockQ)
          setChatHistory((prev) => [...prev, { role: "user", text: mockQ }])

          setTimeout(() => {
            if (!isComponentMounted.current) return
            const ans = faqAnswers["Temple timings?"]
            const ansText = lang === "hi" ? ans.hi : ans.en
            setResponse(ansText)
            setChatHistory((prev) => [...prev, { role: "ai", text: ansText }])
            speakText(ansText)
            setIsListening(false)
          }, 900)
        }, 2000)
      }
    }
  }

  const handleSuggestion = (q: { en: string; hi: string }) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const qText = lang === "hi" ? q.hi : q.en
    setChatHistory((prev) => [...prev, { role: "user", text: qText }])

    const ans = faqAnswers[q.en]
    if (ans) {
      const ansText = lang === "hi" ? ans.hi : ans.en
      setTimeout(() => {
        if (!isComponentMounted.current) return
        setResponse(ansText)
        setChatHistory((prev) => [...prev, { role: "ai", text: ansText }])
        speakText(ansText)
      }, 600)
    }
  }

  return (
    <div className="flex flex-col space-y-4 pb-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold text-primary">
          {t("screens.shyamSahayak.shyamSahayakAi")}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t("screens.shyamSahayak.yourPersonalVoiceGuidedTempleAssistant")}
        </p>
      </div>

      {/* Chat area */}
      <div className="rounded-3xl border border-border bg-card p-4 space-y-3 min-h-[220px] max-h-[300px] overflow-y-auto shadow-sm">
        {/* Initial AI greeting */}
        {response && chatHistory.length === 0 && (
          <div className="flex items-start gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold shadow">
              AI
            </span>
            <div className="rounded-2xl rounded-tl-none bg-secondary/60 px-4 py-3 text-sm text-foreground max-w-[85%]">
              {response}
            </div>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={cn("flex items-start gap-2", msg.role === "user" ? "flex-row-reverse" : "")}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold shadow",
                msg.role === "user"
                  ? "bg-secondary border border-border text-[#D97706]"
                  : "bg-gradient-to-br from-primary to-secondary text-white"
              )}
            >
              {msg.role === "user" ? "U" : "AI"}
            </span>
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm max-w-[85%]",
                msg.role === "user"
                  ? "rounded-tr-none bg-primary text-white"
                  : "rounded-tl-none bg-secondary/60 text-foreground"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isListening && (
          <div className="flex items-center gap-2 text-primary text-xs font-bold animate-pulse">
            <Icon name="Mic" className="size-4" />
            {t("screens.shyamSahayak.listeningSaySomething")}
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("screens.shyamSahayak.tapToAskSpeak")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(s)}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-left text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-secondary/40 active:scale-[0.97]"
            >
              {lang === "hi" ? s.hi : s.en}
            </button>
          ))}
        </div>
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3 pt-2">
        {isListening && (
          <div className="relative flex items-center justify-center">
            <span className="absolute size-28 rounded-full bg-red-500/20 animate-ping" />
            <span className="absolute size-20 rounded-full bg-red-500/30 animate-pulse" />
          </div>
        )}
        <button
          onClick={handleMicClick}
          className={cn(
            "relative z-10 grid size-20 place-items-center rounded-full shadow-xl transition-all duration-300",
            isListening
              ? "bg-red-500 text-white shadow-red-500/40 scale-110"
              : "bg-gradient-to-br from-primary to-secondary text-white shadow-primary/30 hover:scale-105"
          )}
          aria-label={isListening ? t("screens.shyamSahayak.stopListening") : t("screens.shyamSahayak.startListening")}
        >
          <Icon name={isListening ? "Square" : "Mic"} className="size-9" />
        </button>
        <p className="text-xs text-muted-foreground text-center font-medium">
          {isListening
            ? t("screens.shyamSahayak.tapToStopSpeaking")
            : t("screens.shyamSahayak.tapMicToSpeakYourQuestion")}
        </p>
      </div>

      {/* Quick nav links */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        {[
          { key: "temple" as ScreenKey, label: t("screens.shyamSahayak.templeInfo"), icon: "Landmark" },
          { key: "reach" as ScreenKey, label: t("screens.shyamSahayak.howToReach"), icon: "MapPin" },
          { key: "emergency" as ScreenKey, label: t("screens.shyamSahayak.emergency"), icon: "Siren" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-secondary/30 active:scale-95"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
              <Icon name={item.icon} className="size-4" />
            </span>
            <span className="leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
