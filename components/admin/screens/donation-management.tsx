"use client"

import { motion } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, QuickAction, ActivityItem, LiveDot } from "@/components/admin/admin-shared"
import { recentDonations, type AdminScreenKey } from "@/lib/admin-data"

export function DonationManagementScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const totalAmount = recentDonations.reduce((a, d) => a + d.amount, 0)
  const receiptsPending = recentDonations.filter((d) => !d.receiptGenerated).length

  // Mock analytics bars
  const weeklyData = [
    { day: "Mon", amount: 45000 },
    { day: "Tue", amount: 62000 },
    { day: "Wed", amount: 38000 },
    { day: "Thu", amount: 71000 },
    { day: "Fri", amount: 55000 },
    { day: "Sat", amount: 89000 },
    { day: "Sun", amount: 40300 },
  ]
  const maxWeekly = Math.max(...weeklyData.map((d) => d.amount))

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Donation Management</h1>
            <p className="text-sm text-white/80 mt-1">Donations, receipts & campaigns</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="HandCoins" className="size-6" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Today's Total", value: `₹${(totalAmount / 1000).toFixed(1)}K` },
            { label: "Donations", value: recentDonations.length },
            { label: "Receipts Pending", value: receiptsPending },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="font-heading text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="IndianRupee" label="Today's Revenue" value={`₹${totalAmount.toLocaleString()}`} sub="from all modes" trend="+22%" trendUp />
        <MetricCard icon="Receipt" label="Receipts Pending" value={receiptsPending} sub="need generation" />
      </div>

      {/* Quick Actions */}
      <section>
        <AdminSectionTitle title="Quick Actions" icon="Zap" />
        <div className="grid grid-cols-3 gap-2">
          <QuickAction icon="Plus" label="Add Donation" />
          <QuickAction icon="Receipt" label="Gen. Receipts" variant="success" />
          <QuickAction icon="Megaphone" label="Campaign" />
        </div>
      </section>

      {/* Weekly Analytics */}
      <section>
        <AdminSectionTitle title="Weekly Trend" icon="BarChart3" />
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.amount / maxWeekly) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#EA580C] to-[#FFA726] min-h-[4px]"
                />
                <span className="text-[9px] font-bold text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-[11px] text-muted-foreground">Weekly Total: <span className="font-bold text-foreground">₹{(weeklyData.reduce((a, d) => a + d.amount, 0) / 1000).toFixed(0)}K</span></p>
          </div>
        </div>
      </section>

      {/* Recent Donations */}
      <section>
        <AdminSectionTitle
          title="Recent Donations"
          icon="Coins"
          action={<span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600"><LiveDot color="bg-green-500" /> Live</span>}
        />
        <div className="space-y-2">
          {recentDonations.map((donation) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-orange-600 shadow-sm shrink-0">
                <Icon name="HandCoins" className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm font-bold text-foreground truncate">{donation.donorName}</p>
                  <p className="font-heading text-sm font-bold text-green-600 shrink-0">₹{donation.amount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{donation.purpose}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[10px] text-muted-foreground">{donation.mode}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[10px] text-muted-foreground">{donation.time}</span>
                </div>
              </div>
              <span className={`grid size-8 place-items-center rounded-lg shrink-0 ${donation.receiptGenerated ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                <Icon name={donation.receiptGenerated ? "CheckCircle" : "Clock"} className="size-4" />
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
