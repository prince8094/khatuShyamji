import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, MetricCard, LiveDot, ActivityItem } from "@/components/admin/admin-shared"
import { type AdminScreenKey } from "@/lib/admin-data"
import { adminApi } from "@/lib/api-client"

interface ExtendedDonation {
  id: string
  donorName: string
  amount: number
  date: string
  purpose: string
  receiptGenerated: boolean
  status: "successful" | "pending" | "failed"
  email: string
  phone: string
  panNumber: string
  txnId: string
}

export function DonationManagementScreen({ navigate }: { navigate: (s: AdminScreenKey) => void }) {
  const [donations, setDonations] = useState<ExtendedDonation[]>([])

  useEffect(() => {
    adminApi.getDonations()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setDonations(res.map((d: any, index: number) => ({
            id: d.id || `DN-${index + 1}`,
            donorName: d.donor_name || "Devotee Contribution",
            amount: Number(d.amount),
            date: new Date(d.created_at || d.donated_at).toLocaleDateString("en-IN"),
            purpose: d.donation_type ? (d.donation_type.charAt(0).toUpperCase() + d.donation_type.slice(1)) : "General",
            receiptGenerated: true,
            status: d.status || "successful",
            email: d.email || "devotee@example.com",
            phone: d.phone || "+91 8094504520",
            panNumber: d.pan_card || "PAN-NOT-PROVIDED",
            txnId: d.transaction_id || `TXN-${d.id?.substring(0, 8) || "N/A"}`
          })))
        }
      })
      .catch((err) => {
        console.error("Failed to load donations in admin", err)
      })
  }, [])

  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "successful" | "pending" | "failed">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState("")

  // Calculations
  const successfulTxns = donations.filter(d => d.status === "successful")
  const pendingTxns = donations.filter(d => d.status === "pending")
  const failedTxns = donations.filter(d => d.status === "failed")
  
  const totalAmount = successfulTxns.reduce((a, d) => a + d.amount, 0)
  const receiptsPending = successfulTxns.filter(d => !d.receiptGenerated).length

  // Filter list
  const filteredDonations = donations.filter(d => {
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    const matchesSearch =
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.txnId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Simulated download trigger
  const handleDownloadReceipt = (donation: ExtendedDonation) => {
    setDownloadingId(donation.id)
    setTimeout(() => {
      setDownloadingId(null)
      setToastMsg(`Receipt generated for ${donation.donorName} (${donation.id}) and saved to downloads!`)
      setTimeout(() => setToastMsg(""), 4000)
    }, 1500)
  }

  // Weekly Trend Chart Data
  const weeklyData = [
    { day: "Mon", amount: 45000 },
    { day: "Tue", amount: 62000 },
    { day: "Wed", amount: 38000 },
    { day: "Thu", amount: 71000 },
    { day: "Fri", amount: 55000 },
    { day: "Sat", amount: 89000 },
    { day: "Sun", amount: totalAmount },
  ]
  const maxWeekly = Math.max(...weeklyData.map(d => d.amount))

  const selectedTxn = donations.find(d => d.id === selectedTxnId)

  return (
    <div className="space-y-5 pb-6">
      {/* Header operations banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Donation Audit Center</h1>
            <p className="text-xs text-white/80 mt-1">Chronological payment ledgers & tax receipt generation</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="HandCoins" className="size-6 text-white" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Successful Total", value: `₹${(totalAmount / 1000).toFixed(1)}K` },
            { label: "Ledger Entries", value: donations.length },
            { label: "Receipts Issued", value: donations.filter(d => d.receiptGenerated).length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-black/20 backdrop-blur-sm px-3 py-2.5 text-center border border-white/5">
              <p className="text-[10px] text-white/70 uppercase tracking-wide font-semibold">{s.label}</p>
              <p className="font-heading text-lg font-extrabold text-white mt-0.5">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-3 shadow-lg text-xs font-bold"
          >
            <Icon name="CheckCircle" className="size-4 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="IndianRupee" label="Audited Total Funds" value={`₹${totalAmount.toLocaleString()}`} sub="UPI, Bank, Cash flows verified" />
        <MetricCard icon="AlertCircle" label="Failed Transactions" value={failedTxns.length} sub="aborted by gateway" />
      </div>

      {/* Filters ledger card list */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-card border border-border rounded-2xl p-3 shadow-sm">
        <div className="flex gap-1 bg-secondary/80 p-1 rounded-xl shrink-0">
          {(["all", "successful", "pending", "failed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold capitalize transition-all ${
                statusFilter === f ? "bg-[#EA580C] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All Ledgers" : f}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Icon name="Search" className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Donor, Txn ID, Receipt number…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 pl-9 pr-4 py-2 text-xs font-bold focus:border-[#EA580C] focus:outline-none"
          />
        </div>
      </div>

      {/* Ledger lists grid */}
      <section>
        <AdminSectionTitle
          title="Chronological Audit Ledgers"
          icon="Coins"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
              <LiveDot color="bg-green-500" /> Realtime Audit Trail
            </span>
          }
        />
        <div className="space-y-3">
          {filteredDonations.map((donation) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-xl shadow-sm ${
                    donation.status === "successful" ? "bg-green-50 text-green-600" :
                    donation.status === "pending" ? "bg-amber-50 text-amber-600 animate-pulse" :
                    "bg-red-50 text-red-600"
                  }`}>
                    <Icon name="HandCoins" className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-sm font-bold text-foreground">{donation.donorName}</p>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-muted-foreground">{donation.id}</span>
                      <span className="text-[9px] font-bold text-muted-foreground">{donation.mode}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span>Purpose: <span className="font-semibold">{donation.purpose}</span></span>
                      <span className="size-1 rounded-full bg-muted-foreground/30" />
                      <span>{donation.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <p className="font-heading text-sm font-extrabold text-foreground">₹{donation.amount.toLocaleString()}</p>
                  
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                    donation.status === "successful" ? "bg-green-50 text-green-700 border-green-200" :
                    donation.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    <span className={`size-1 rounded-full ${
                      donation.status === "successful" ? "bg-green-500" :
                      donation.status === "pending" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    {donation.status}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3.5 flex gap-2 border-t border-border/40 pt-3">
                <button
                  onClick={() => setSelectedTxnId(donation.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground hover:bg-muted/40 transition hover:shadow-sm"
                >
                  <Icon name="Search" className="size-3.5 text-muted-foreground" /> View Audit Trail
                </button>
                {donation.status === "successful" && (
                  <button
                    onClick={() => handleDownloadReceipt(donation)}
                    disabled={downloadingId === donation.id}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 py-2 text-xs font-bold text-white shadow-sm transition active:scale-[0.98]"
                  >
                    <Icon name={downloadingId === donation.id ? "Loader2" : "Download"} className={`size-3.5 ${downloadingId === donation.id ? "animate-spin" : ""}`} />
                    {downloadingId === donation.id ? "Issuing..." : "Download Tax Receipt"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Weekly Trend Chart */}
      <section>
        <AdminSectionTitle title="Weekly Donations Volume Chart" icon="BarChart3" />
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
          <div className="mt-3 text-center border-t border-border/40 pt-2 text-xs font-medium text-muted-foreground">
            Weekly Saturation Total: <span className="font-bold text-foreground">₹{(weeklyData.reduce((a, d) => a + d.amount, 0) / 1000).toFixed(0)}K</span>
          </div>
        </div>
      </section>

      {/* Audit Detail Modal */}
      <AnimatePresence>
        {selectedTxnId && selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">Audit Trail Details</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Payment verification metadata records</p>
                </div>
                <button onClick={() => setSelectedTxnId(null)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" className="size-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Gateway Txn ID:</span>
                  <span className="font-mono font-bold text-foreground">{selectedTxn.txnId}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Devotee Receipt ID:</span>
                  <span className="font-mono font-bold text-foreground">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Donor Name:</span>
                  <span className="font-bold text-foreground">{selectedTxn.donorName}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">PAN Number (80G Tax):</span>
                  <span className="font-mono font-bold text-foreground">{selectedTxn.panNumber}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Payment Mode:</span>
                  <span className="font-bold text-foreground">{selectedTxn.mode}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Verification State:</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                    selectedTxn.status === "successful" ? "bg-green-50 text-green-700 border-green-200" :
                    selectedTxn.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {selectedTxn.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Audited Date & Time:</span>
                  <span className="font-bold text-foreground">Today, {selectedTxn.time}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Contact Email:</span>
                  <span className="font-bold text-foreground">{selectedTxn.email}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-semibold">Contact Phone:</span>
                  <span className="font-bold text-foreground">{selectedTxn.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Amount Transferred:</span>
                  <span className="font-heading text-sm font-extrabold text-green-600">₹{selectedTxn.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-border">
                {selectedTxn.status === "successful" && (
                  <button
                    onClick={() => handleDownloadReceipt(selectedTxn)}
                    className="rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    Download Tax Receipt
                  </button>
                )}
                <button
                  onClick={() => setSelectedTxnId(null)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-muted/50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
