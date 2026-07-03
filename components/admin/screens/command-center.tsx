"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import {
  StatusWidget,
  AdminSectionTitle,
  LiveDot,
  AlertBanner,
  MetricCard,
  ProgressBar,
  ActivityItem,
} from "@/components/admin/admin-shared"
import { commandCenterData, activityFeed, type AdminScreenKey } from "@/lib/admin-data"
import { devoteeApi, adminApi } from "@/lib/api-client"

export function CommandCenterScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [liveTime, setLiveTime] = useState("")
  
  // High-Level Command Overrides States
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)
  const [isDarshanClosed, setIsDarshanClosed] = useState(false)
  const [isGlobalAlarm, setIsGlobalAlarm] = useState(false)
  
  const [activityLogs, setActivityLogs] = useState<any[]>(activityFeed)
  const [telemetry, setTelemetry] = useState<any>({
    crowd_level: "Moderate",
    crowd_count: 6420,
    wait_time_minutes: 35,
    darshan_status: "Open",
    is_emergency_mode: false,
    is_darshan_closed: false,
    is_global_alarm: false,
  })

  const [summary, setSummary] = useState<any>({
    total_profiles: 0,
    today_devotees: 0,
    parking: {
      total: 0,
      occupied: 0,
      free: 0
    },
    active_volunteers: 0,
    active_stays: 0,
    pending_emergencies: 0,
    telemetry: {
      crowd_level: "Moderate",
      crowd_count: 0,
      wait_time_minutes: 0,
      darshan_status: "Open",
      is_emergency_mode: false,
      is_darshan_closed: false,
      is_global_alarm: false
    }
  })

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await adminApi.getAnalyticsSummary()
        if (res) {
          setSummary(res)
          setIsEmergencyMode(!!res.telemetry?.is_emergency_mode)
          setIsDarshanClosed(!!res.telemetry?.is_darshan_closed)
          setIsGlobalAlarm(!!res.telemetry?.is_global_alarm)
          setTelemetry(res.telemetry || {})
        }
      } catch (err) {
        console.error("Error loading dashboard summary stats", err)
      }
    }
    fetchSummary()
  }, [])

  const updateTelemetryInDb = async (updatedFields: any) => {
    const nextTelemetry = { ...telemetry, ...updatedFields }
    setTelemetry(nextTelemetry)
    try {
      await adminApi.updateTempleInfo({
        section_key: "live_telemetry",
        title: "Live Operational Telemetry",
        content: nextTelemetry
      })
    } catch (err) {
      console.error("Failed to update database telemetry", err)
    }
  }

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setLiveTime(
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const d = commandCenterData
  const parkingPct = Math.round((summary.parking.occupied / (summary.parking.total || 1)) * 100)
  const hotelsPct = Math.round((summary.active_stays / 260) * 100) // assume total 260 rooms capacity

  const toggleEmergencyMode = () => {
    const nextState = !isEmergencyMode
    setIsEmergencyMode(nextState)
    updateTelemetryInDb({ is_emergency_mode: nextState })
    
    // Log command override
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      {
        id: `ACT-${Date.now()}`,
        time: timeStr,
        action: `[CRITICAL CONTROL] Emergency Mode toggled to ${nextState ? "ACTIVE" : "INACTIVE"}`,
        department: "emergency",
        actor: "Nand Kumar",
        icon: "Siren",
      },
      ...prev,
    ])
  }

  const toggleCloseDarshan = () => {
    const nextState = !isDarshanClosed
    setIsDarshanClosed(nextState)
    updateTelemetryInDb({ is_darshan_closed: nextState })

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      {
        id: `ACT-${Date.now()}`,
        time: timeStr,
        action: `[SYSTEM ACTION] Main Shrine Darshan gates toggled to ${nextState ? "CLOSED" : "OPEN"}`,
        department: "super-admin",
        actor: "Nand Kumar",
        icon: "DoorClosed",
      },
      ...prev,
    ])
  }

  const toggleGlobalAlarm = () => {
    const nextState = !isGlobalAlarm
    setIsGlobalAlarm(nextState)
    updateTelemetryInDb({ is_global_alarm: nextState })

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setActivityLogs(prev => [
      {
        id: `ACT-${Date.now()}`,
        time: timeStr,
        action: `[CRITICAL ALERT] Global Alarm broadcast toggled to ${nextState ? "ACTIVE" : "OFF"}`,
        department: "super-admin",
        actor: "Nand Kumar",
        icon: "Megaphone",
      },
      ...prev,
    ])
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Alert Overrides Banner display */}
      <AnimatePresence>
        {isEmergencyMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl bg-red-600 text-white px-4 py-3 shadow-md animate-pulse border border-red-700"
          >
            <Icon name="Siren" className="size-5 shrink-0 text-white" />
            <p className="flex-1 text-xs font-extrabold tracking-wide">
              🚨 SYSTEM OVERRIDE: Emergency Mode Active. Dispatch coordination channels locked. Devotee apps showing SOS guidelines.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDarshanClosed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl bg-amber-500 text-white px-4 py-3 shadow-md border border-amber-600"
          >
            <Icon name="DoorClosed" className="size-5 shrink-0 text-white" />
            <p className="flex-1 text-xs font-extrabold tracking-wide">
              ⚠️ DARSHAN TEMPORARILY CLOSED: Gates 1, 2, and 3 are offline. Booking passes frozen. Live feeds update dispatched to Pilgrim app.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGlobalAlarm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl bg-orange-600 text-white px-4 py-3 shadow-md border border-orange-700"
          >
            <Icon name="Megaphone" className="size-5 shrink-0 text-white" />
            <p className="flex-1 text-xs font-extrabold tracking-wide">
              📢 GLOBAL ALARM BROADCAST ACTIVE: Critical safety notification pushed to all device tokens.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Clock Bar */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-2">
          <LiveDot color="bg-white" />
          <span className="text-sm font-bold">TOCC COMMAND CONSOLE</span>
          <span className="text-xs text-white/85 ml-1 hidden sm:inline">Khatu Dham Operations</span>
        </div>
        <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-lg border border-white/10">
          <Icon name="Clock" className="size-4 text-white/80" />
          <span className="font-mono text-sm font-bold tabular-nums">{liveTime}</span>
        </div>
      </div>

      {/* Live Overview Cards */}
      <section>
        <AdminSectionTitle
          title="Command Operations Feed (Read-Only)"
          icon="Activity"
          action={
            <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1.5 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <LiveDot color="bg-green-500" size="sm" /> Telemetry Online
            </span>
          }
        />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatusWidget
            icon="Users"
            label="Live Crowd Flow"
            value={summary.telemetry.crowd_count.toLocaleString()}
            sub={`${summary.telemetry.crowd_level} Density`}
            status={summary.telemetry.crowd_count > 8000 ? "warning" : "normal"}
            onClick={() => navigate("command-center")}
          />
          <StatusWidget
            icon="Clock"
            label="Queue Wait Time"
            value={`${summary.telemetry.wait_time_minutes} Mins`}
            sub="Active check-in wait time"
            status={summary.telemetry.wait_time_minutes > 90 ? "critical" : summary.telemetry.wait_time_minutes > 45 ? "warning" : "normal"}
          />
          <StatusWidget
            icon="TrafficCone"
            label="Highway traffic"
            value={d.traffic.value}
            sub={d.traffic.route}
            status={d.traffic.status}
            onClick={() => navigate("traffic-ops")}
          />
          <StatusWidget
            icon="SquareParking"
            label="Parking Available"
            value={`${summary.parking.free} lots free`}
            sub={`${parkingPct}% occupied of ${summary.parking.total}`}
            status={parkingPct > 85 ? "warning" : "normal"}
            onClick={() => navigate("parking-management")}
          />
          <StatusWidget
            icon="BedDouble"
            label="Stays Occupancy"
            value={`${260 - summary.active_stays} stays free`}
            sub={`${hotelsPct}% occupied of 260 rooms`}
            status={hotelsPct > 85 ? "warning" : "normal"}
            onClick={() => navigate("accommodation")}
          />
          <StatusWidget
            icon="DoorOpen"
            label="Shrine Gates Status"
            value={isDarshanClosed ? "CLOSED" : (summary.telemetry.darshan_status || "Open")}
            sub={isDarshanClosed ? "Gates Offline" : `Queue: Active flow`}
            status={isDarshanClosed ? "critical" : "normal"}
          />
        </div>
      </section>

      {/* Critical System Control Quick Actions */}
      <section>
        <AdminSectionTitle title="Operational Overrides Controls" icon="Zap" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={toggleGlobalAlarm}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm transition-all ${
              isGlobalAlarm ? "bg-orange-600 text-white border-orange-700" : "bg-[#FFF3E0] text-[#D97706] hover:bg-[#FFE0B2]"
            }`}
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/40 shadow-sm text-inherit">
              <Icon name="Megaphone" className="size-5" />
            </span>
            <span className="text-[11px] font-bold leading-tight">{isGlobalAlarm ? "Deactivate Alarm" : "Global Alarm Toggle"}</span>
          </button>
          
          <button
            onClick={toggleCloseDarshan}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm transition-all ${
              isDarshanClosed ? "bg-amber-600 text-white border-amber-700 animate-pulse" : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/40 shadow-sm text-inherit">
              <Icon name="DoorClosed" className="size-5" />
            </span>
            <span className="text-[11px] font-bold leading-tight">{isDarshanClosed ? "Open Darshan" : "Close Darshan Override"}</span>
          </button>

          <button
            onClick={toggleEmergencyMode}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm transition-all ${
              isEmergencyMode ? "bg-red-700 text-white border-red-800 animate-pulse" : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/40 shadow-sm text-inherit">
              <Icon name="Siren" className="size-5" />
            </span>
            <span className="text-[11px] font-bold leading-tight">{isEmergencyMode ? "Deactivate Emergency" : "Emergency Mode Toggle"}</span>
          </button>

          <button
            onClick={() => navigate("notifications-admin")}
            className="flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm bg-[#FFF3E0] text-[#D97706] hover:bg-[#FFE0B2] border-[#FFB74D]/30"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/60 shadow-sm">
              <Icon name="Bell" className="size-5" />
            </span>
            <span className="text-[11px] font-bold leading-tight">Broadcast Alerts</span>
          </button>
        </div>
      </section>

      {/* AI Smart Insights */}
      <section>
        <AdminSectionTitle
          title="Predictive AI Insights"
          icon="Sparkles"
          action={<span className="text-[10px] font-bold text-[#D97706] bg-[#FFF3E0] px-2.5 py-0.5 rounded-full">SMART MONITOR</span>}
        />
        <div className="space-y-2">
          {d.aiInsights.map((insight) => {
            const colors = {
              warning: "border-amber-200 bg-amber-50/50",
              info: "border-blue-200 bg-blue-50/50",
              success: "border-green-200 bg-green-50/50",
            }
            const iconColors = {
              warning: "text-amber-600 bg-amber-100",
              info: "text-blue-600 bg-blue-100",
              success: "text-green-600 bg-green-100",
            }
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-3 rounded-2xl border p-4 ${colors[insight.severity]}`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconColors[insight.severity]}`}>
                  <Icon name={insight.icon} className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{insight.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">AI Prediction model · Just now</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* System Health */}
      <section>
        <AdminSectionTitle title="Network Services Status" icon="Shield" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.entries(d.systemHealth).map(([key, status]) => (
            <div key={key} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm">
              <LiveDot color={status === "operational" ? "bg-green-500" : "bg-red-500"} />
              <div>
                <p className="text-[11px] font-bold text-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                <p className={`text-[10px] font-semibold ${status === "operational" ? "text-green-600" : "text-red-600"}`}>
                  {status === "operational" ? "Online" : "Down"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Activity Feed */}
      <section>
        <AdminSectionTitle
          title="Operations Activity Log Feed"
          icon="Activity"
          action={
            <span className="text-[11px] font-semibold text-muted-foreground">
              Today · {activityLogs.length} events logged
            </span>
          }
        />
        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm max-h-[350px] overflow-y-auto divide-y divide-border/60">
          {activityLogs.map((entry) => (
            <ActivityItem
              key={entry.id}
              time={entry.time}
              action={entry.action}
              department={entry.department}
              actor={entry.actor}
              icon={entry.icon}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
