"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import {
  StatusWidget,
  AdminSectionTitle,
  QuickAction,
  ActivityItem,
  LiveDot,
  AlertBanner,
  MetricCard,
  ProgressBar,
} from "@/components/admin/admin-shared"
import { commandCenterData, activityFeed, type AdminScreenKey } from "@/lib/admin-data"

export function CommandCenterScreen({
  navigate,
}: {
  navigate: (s: AdminScreenKey) => void
}) {
  const [showAlert, setShowAlert] = useState(true)
  const [liveTime, setLiveTime] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setLiveTime(
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const d = commandCenterData
  const parkingPct = Math.round((d.parking.occupied / d.parking.totalCapacity) * 100)

  return (
    <div className="space-y-5 pb-6">
      {/* Emergency Alert Banner */}
      {showAlert && d.emergencyAlerts === 0 && (
        <AlertBanner
          type="info"
          message="All systems operational. No active emergencies."
          onDismiss={() => setShowAlert(false)}
        />
      )}

      {/* Festival Mode Banner */}
      {d.festivalMode && (
        <AlertBanner
          type="warning"
          message="🎊 Festival Mode Active — Extended darshan hours & extra security deployed"
        />
      )}

      {/* Live Clock Bar */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-2">
          <LiveDot color="bg-white" />
          <span className="text-sm font-bold">LIVE</span>
          <span className="text-xs text-white/80 ml-1">Temple Operations Command Center</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Clock" className="size-4 text-white/80" />
          <span className="font-mono text-sm font-bold tabular-nums">{liveTime}</span>
        </div>
      </div>

      {/* Live Status Grid */}
      <section>
        <AdminSectionTitle title="Live Overview" icon="Activity" action={
          <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1.5">
            <LiveDot color="bg-green-500" size="sm" /> Real-time
          </span>
        } />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatusWidget
            icon="Users"
            label="Live Crowd"
            value={d.liveCrowd.value.toLocaleString()}
            sub={d.liveCrowd.trend + " vs yesterday"}
            status={d.liveCrowd.status}
            onClick={() => navigate("command-center")}
          />
          <StatusWidget
            icon="Clock"
            label="Wait Time"
            value={`${d.waitTime.value} ${d.waitTime.unit}`}
            sub={d.waitTime.trend + " from last hour"}
            status={d.waitTime.status}
          />
          <StatusWidget
            icon="TrafficCone"
            label="Traffic"
            value={d.traffic.value}
            sub={d.traffic.route}
            status={d.traffic.status}
            onClick={() => navigate("traffic-ops")}
          />
          <StatusWidget
            icon="SquareParking"
            label="Parking"
            value={`${d.parking.available} free`}
            sub={`${parkingPct}% occupied · ${d.parking.totalCapacity} total`}
            status={parkingPct > 85 ? "warning" : "normal"}
            onClick={() => navigate("parking-management")}
          />
          <StatusWidget
            icon="BedDouble"
            label="Hotels"
            value={`${d.hotels.available} rooms`}
            sub={`${d.hotels.occupied} occupied / ${d.hotels.totalRooms} total`}
            status="normal"
            onClick={() => navigate("accommodation")}
          />
          <StatusWidget
            icon="DoorOpen"
            label="Darshan"
            value={d.darshan.status}
            sub={`Queue: ${d.darshan.queueLength} · Next aarti: ${d.darshan.nextAarti}`}
            status="normal"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <AdminSectionTitle title="Quick Actions" icon="Zap" />
        <div className="grid grid-cols-4 gap-2">
          <QuickAction icon="Megaphone" label="Global Alert" onClick={() => navigate("notifications-admin")} />
          <QuickAction icon="DoorClosed" label="Close Darshan" variant="danger" />
          <QuickAction icon="Siren" label="Emergency Mode" variant="danger" onClick={() => navigate("emergency-ops")} />
          <QuickAction icon="Bell" label="Broadcast" onClick={() => navigate("notifications-admin")} />
        </div>
      </section>

      {/* AI Insights */}
      <section>
        <AdminSectionTitle
          title="AI Insights"
          icon="Sparkles"
          action={<span className="text-[10px] font-bold text-[#D97706] bg-[#FFF3E0] px-2 py-0.5 rounded-full">SMART</span>}
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
                  <p className="text-[10px] text-muted-foreground mt-1">AI Analysis · Just now</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Weather */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-sky-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
              <Icon name="CloudSun" className="size-6" />
            </span>
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">{d.weather.temp}°C</p>
              <p className="text-xs text-muted-foreground">{d.weather.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Humidity: {d.weather.humidity}%</p>
            <p className="text-xs font-medium text-blue-600 mt-0.5">{d.weather.forecast}</p>
          </div>
        </div>
      </section>

      {/* System Health */}
      <section>
        <AdminSectionTitle title="System Health" icon="Shield" />
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
          title="Live Activity Feed"
          icon="Activity"
          action={
            <span className="text-[11px] font-semibold text-muted-foreground">
              Today · {activityFeed.length} events
            </span>
          }
        />
        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm">
          {activityFeed.map((entry) => (
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
