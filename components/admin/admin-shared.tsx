"use client"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import { motion } from "framer-motion"
import type { AdminRoleKey } from "@/lib/admin-data"
import { deptColors } from "@/lib/admin-data"

// ─── Metric Card ────────────────────────────────────────────────────────────
export function MetricCard({
  icon,
  label,
  value,
  sub,
  trend,
  trendUp,
  className,
}: {
  icon: string
  label: string
  value: string | number
  sub?: string
  trend?: string
  trendUp?: boolean
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-[#FFF3E0] text-[#D97706]">
          <Icon name={icon} className="size-5" />
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold leading-none text-foreground">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        {trend && (
          <span className={cn("text-[11px] font-semibold", trendUp ? "text-green-600" : "text-red-500")}>
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Status Widget (Command Center large tiles) ─────────────────────────────
export function StatusWidget({
  icon,
  label,
  value,
  sub,
  status,
  onClick,
  className,
}: {
  icon: string
  label: string
  value: string | number
  sub?: string
  status: "normal" | "warning" | "critical" | "moderate"
  onClick?: () => void
  className?: string
}) {
  const statusColors = {
    normal: "border-green-200 bg-green-50/50",
    warning: "border-amber-200 bg-amber-50/50",
    critical: "border-red-200 bg-red-50/50",
    moderate: "border-orange-200 bg-orange-50/50",
  }
  const dotColors = {
    normal: "bg-green-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
    moderate: "bg-orange-500",
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border p-4 text-left shadow-sm transition-all hover:shadow-md",
        statusColors[status],
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-white/80 shadow-sm">
          <Icon name={icon} className="size-5 text-[#D97706]" />
        </span>
        <LiveDot color={dotColors[status]} />
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </motion.button>
  )
}

// ─── Live Pulsing Dot ───────────────────────────────────────────────────────
export function LiveDot({ color = "bg-green-500", size = "sm" }: { color?: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "size-2.5" : "size-3.5"
  return (
    <span className="relative flex">
      <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", color, s)} />
      <span className={cn("relative inline-flex rounded-full", color, s)} />
    </span>
  )
}

// ─── Activity Timeline Item ─────────────────────────────────────────────────
export function ActivityItem({
  time,
  action,
  department,
  actor,
  icon,
}: {
  time: string
  action: string
  department: AdminRoleKey
  actor: string
  icon: string
}) {
  const colors = deptColors[department]
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl", colors.bg, colors.text)}>
        <Icon name={icon} className="size-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">{action}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{time}</span>
          <span className="size-1 rounded-full bg-muted-foreground/30" />
          <span className="text-[11px] text-muted-foreground">{actor}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Quick Action Button ────────────────────────────────────────────────────
export function QuickAction({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: string
  label: string
  onClick?: () => void
  variant?: "default" | "danger" | "success"
}) {
  const variants = {
    default: "bg-[#FFF3E0] text-[#D97706] hover:bg-[#FFE0B2] border-[#FFB74D]/30",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200/30",
    success: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200/30",
  }
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm transition-all",
        variants[variant],
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-white/60 shadow-sm">
        <Icon name={icon} className="size-5" />
      </span>
      <span className="text-[11px] font-bold leading-tight">{label}</span>
    </motion.button>
  )
}

// ─── Admin Section Title ────────────────────────────────────────────────────
export function AdminSectionTitle({
  title,
  action,
  icon,
}: {
  title: string
  action?: React.ReactNode
  icon?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} className="size-5 text-[#D97706]" />}
        <h2 className="font-heading text-lg font-bold leading-tight text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  )
}

// ─── Approval Badge ─────────────────────────────────────────────────────────
export function ApprovalBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  }
  const icons = { pending: "Clock", approved: "CheckCircle", rejected: "XCircle" }
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", styles[status])}>
      <Icon name={icons[status]} className="size-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ─── Alert Banner ───────────────────────────────────────────────────────────
export function AlertBanner({
  type = "warning",
  message,
  onDismiss,
}: {
  type?: "emergency" | "warning" | "info"
  message: string
  onDismiss?: () => void
}) {
  const styles = {
    emergency: "bg-red-600 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-500 text-white",
  }
  const icons = { emergency: "Siren", warning: "TriangleAlert", info: "Info" }
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md", styles[type])}
    >
      <Icon name={icons[type]} className="size-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="grid size-7 place-items-center rounded-full bg-white/20 hover:bg-white/30 transition">
          <Icon name="X" className="size-4" />
        </button>
      )}
    </motion.div>
  )
}

// ─── Admin Card (generic resource card) ─────────────────────────────────────
export function AdminCard({
  title,
  subtitle,
  status,
  statusColor,
  stats,
  icon,
  actions,
  className,
}: {
  title: string
  subtitle?: string
  status?: string
  statusColor?: "green" | "amber" | "red" | "blue" | "purple"
  stats?: { label: string; value: string | number }[]
  icon?: string
  actions?: React.ReactNode
  className?: string
}) {
  const statusColors = {
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="grid size-11 place-items-center rounded-xl bg-[#FFF3E0] text-[#D97706] shadow-sm">
              <Icon name={icon} className="size-5" />
            </span>
          )}
          <div>
            <p className="font-heading text-sm font-bold text-foreground">{title}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {status && statusColor && (
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold", statusColors[statusColor])}>
            <span className={cn("size-1.5 rounded-full", statusColor === "green" ? "bg-green-500" : statusColor === "amber" ? "bg-amber-500" : statusColor === "red" ? "bg-red-500" : statusColor === "blue" ? "bg-blue-500" : "bg-purple-500")} />
            {status}
          </span>
        )}
      </div>
      {stats && stats.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl bg-muted/50 px-3 py-2">
              <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
              <p className="font-heading text-sm font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}
      {actions && <div className="mt-3 flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Progress Bar ───────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  max,
  color = "orange",
  showLabel = true,
}: {
  value: number
  max: number
  color?: "orange" | "green" | "red" | "blue"
  showLabel?: boolean
}) {
  const pct = Math.round((value / max) * 100)
  const barColors = {
    orange: "bg-gradient-to-r from-[#D97706] to-[#D4AF37]",
    green: "bg-gradient-to-r from-green-500 to-emerald-400",
    red: "bg-gradient-to-r from-red-500 to-red-400",
    blue: "bg-gradient-to-r from-blue-500 to-blue-400",
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <>
            <span className="text-[11px] text-muted-foreground">{value} / {max}</span>
            <span className="text-[11px] font-bold text-foreground">{pct}%</span>
          </>
        )}
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColors[color])}
        />
      </div>
    </div>
  )
}

// ─── Pipeline Step Badge (Lost & Found workflow) ─────────────────────────────
export function PipelineStep({
  label,
  icon,
  isActive,
  isCompleted,
  count,
}: {
  label: string
  icon: string
  isActive: boolean
  isCompleted: boolean
  count?: number
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-center transition-all min-w-[72px]",
        isActive ? "bg-[#D97706]/10" : isCompleted ? "bg-green-50" : "bg-muted/30",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-lg",
          isActive ? "bg-[#D97706] text-white shadow-md" : isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon name={isCompleted ? "Check" : icon} className="size-4" />
      </span>
      <span className={cn("text-[9px] font-bold leading-tight", isActive ? "text-[#D97706]" : isCompleted ? "text-green-600" : "text-muted-foreground")}>
        {label}
      </span>
      {count !== undefined && (
        <span className={cn("text-[10px] font-bold", isActive ? "text-[#D97706]" : "text-muted-foreground")}>
          {count}
        </span>
      )}
    </div>
  )
}
