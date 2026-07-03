"use client"

import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { useEffect, useState } from "react"
import QRCode from "qrcode"

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as Record<string, any>)[name] ?? Icons.Circle
  return <Cmp className={className} aria-hidden="true" />
}

export function Om({ className }: { className?: string }) {
  // Stylized Om (ॐ) mark drawn as SVG so it renders regardless of font coverage.
  return (
    <svg viewBox="0 0 64 64" className={cn("size-[1.4em]", className)} fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth={4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* lower large loop */}
        <path d="M14 40c0-7 5.5-12 12.5-12 6.5 0 11.5 4.5 11.5 10.5 0 5.5-4 9.5-9 9.5-3.8 0-6.8-2.4-6.8-5.6 0-2.6 1.9-4.6 4.4-4.6 1.7 0 3 .9 3.7 2.2" />
        {/* upper small loop */}
        <path d="M21 27c2.5-3.2 6.6-5 11-5 4.6 0 8.4 2 10.8 5.2" />
        {/* right tail curving down */}
        <path d="M42 30c5 1.5 8 5.6 8 10.6 0 5.4-3.7 9.4-8.6 9.4" />
        {/* crescent */}
        <path d="M38 16c2.2-1.6 5-2.4 7.9-2.4 2.4 0 4.6.5 6.6 1.6" />
        {/* bindu dot */}
        <circle cx={48.5} cy={9.5} r={2.6} fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

/* Small ornamental gold divider with a centered diamond — a handcrafted devotional touch */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-gold", className)} aria-hidden="true">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
      <span className="size-1.5 rotate-45 bg-gold/80" />
      <span className="text-[10px] font-bold tracking-[0.3em] text-gold/80">ॐ</span>
      <span className="size-1.5 rotate-45 bg-gold/80" />
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  )
}

type Tone = "success" | "warning" | "orange" | "muted"

const toneMap: Record<Tone, string> = {
  success: "bg-[#e7f3ea] text-[#216a37]",
  warning: "bg-[#fbeede] text-[#9a5a13]",
  orange: "bg-[#FFF3E0] text-[#FF8C00]",
  muted: "bg-secondary text-secondary-foreground",
}

export function StatusDot({ tone }: { tone: Tone }) {
  const c =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "orange" ? "bg-orange" : "bg-muted-foreground"
  return (
    <span className="relative flex size-2.5">
      <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", c)} />
      <span className={cn("relative inline-flex size-2.5 rounded-full", c)} />
    </span>
  )
}

export function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", toneMap[tone])}>
      {children}
    </span>
  )
}

export function SectionTitle({ title, hindi, action }: { title: string; hindi?: string; action?: React.ReactNode }) {
  const { t } = useLanguage()
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="font-heading text-lg font-bold leading-tight text-foreground">{t(title, hindi)}</h2>
      </div>
      {action}
    </div>
  )
}

/* Cryptographically scannable real QR code generator component */
export function QrMock({ size = 220, seed = "KSJ" }: { size?: number; seed?: string }) {
  const [qrUrl, setQrUrl] = useState<string>("")

  useEffect(() => {
    QRCode.toDataURL(seed, { margin: 1, width: size })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error("Failed to generate real QR code", err))
  }, [seed, size])

  if (!qrUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-muted animate-pulse rounded-2xl flex items-center justify-center text-[10px] text-muted-foreground/60"
      >
        Generating QR...
      </div>
    )
  }

  return (
    <img
      src={qrUrl}
      alt="Scannable secure QR code"
      width={size}
      height={size}
      className="object-contain"
    />
  )
}
