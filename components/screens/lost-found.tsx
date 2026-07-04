"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon, Ornament } from "@/components/shared"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { devoteeApi } from "@/lib/api-client"

export function LostFoundScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { t, tObject } = useLanguage()
  const initialFoundItems: any[] = tObject("screens.lostFound.foundItemsList") || []
  
  const [activeTab, setActiveTab] = useState<"found" | "report" | "my-reports">("found")
  const [submitted, setSubmitted] = useState(false)
  const getTodayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  const [form, setForm] = useState({
    itemName: "",
    description: "",
    date: getTodayStr(),
    location: "",
    phone: "",
    imageName: "",
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Database states
  const [foundList, setFoundList] = useState<any[]>(initialFoundItems)
  const [loadingFound, setLoadingFound] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [myReportsList, setMyReportsList] = useState<any[]>([])
  const [loadingMyReports, setLoadingMyReports] = useState(false)

  // Claim Request States
  const [myClaims, setMyClaims] = useState<any[]>([])
  const [claimingItem, setClaimingItem] = useState<any | null>(null)
  const [claimForm, setClaimForm] = useState({
    claimantName: "",
    identityProofType: "Aadhaar Card",
    identityProofNumber: "",
    claimDescription: ""
  })
  const [submittingClaim, setSubmittingClaim] = useState(false)
  const [claimFeedback, setClaimFeedback] = useState("")

  const loadMyReports = async () => {
    const activeUserStr = localStorage.getItem("current_user")
    if (!activeUserStr) return

    setLoadingMyReports(true)
    try {
      const data = await devoteeApi.getMyLostReports()
      if (data) {
        setMyReportsList(data)
      }
    } catch (err) {
      console.error("Failed to load my lost reports", err)
    } finally {
      setLoadingMyReports(false)
    }
  }

  const loadMyClaims = async () => {
    try {
      const data = await devoteeApi.getMyClaims()
      if (data) {
        setMyClaims(data)
      }
    } catch (err) {
      console.error("Failed to load my claims list", err)
    }
  }

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!claimingItem) return

    setSubmittingClaim(true)
    setClaimFeedback("")
    try {
      await devoteeApi.claimFoundItem({
        found_item_id: parseInt(claimingItem.id),
        claimant_name: claimForm.claimantName,
        identity_proof_type: claimForm.identityProofType,
        identity_proof_number: claimForm.identityProofNumber,
        claim_description: claimForm.claimDescription
      })
      setClaimFeedback("Claim request submitted successfully!")
      loadMyClaims()
      // Refresh found list to show update status
      const updatedFound = await devoteeApi.getFoundItems()
      if (updatedFound) {
        setFoundList(updatedFound.map((item: any) => ({
          id: String(item.id),
          item: item.item_name,
          desc: item.description,
          location: item.location_found,
          date: item.date_found,
          color: item.item_color || "bg-amber-50 text-amber-500 border-amber-100",
          icon: item.category_icon || "PackageSearch",
          status: item.status,
          imageUrl: item.image_url,
          category: item.category,
          remarks: item.remarks,
          foundBy: item.found_by,
          storageLocation: item.storage_location,
          time: item.time_found
        })))
      }
      setTimeout(() => {
        setClaimingItem(null)
        setClaimForm({ claimantName: "", identityProofType: "Aadhaar Card", identityProofNumber: "", claimDescription: "" })
        setClaimFeedback("")
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setClaimFeedback("Failed to submit claim request. Please try again.")
    } finally {
      setSubmittingClaim(false)
    }
  }

  useEffect(() => {
    if (activeTab === "my-reports") {
      loadMyReports()
      loadMyClaims()
    }
  }, [activeTab])

  // Fetch live found items on mount
  useEffect(() => {
    const loadFoundItems = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) return

      setLoadingFound(true)
      try {
        const data = await devoteeApi.getFoundItems()

        if (data && data.length > 0) {
          setFoundList(data.map((item: any) => ({
            id: String(item.id),
            item: item.item_name,
            desc: item.description,
            location: item.location_found,
            date: item.date_found,
            color: item.item_color || "bg-amber-50 text-amber-500 border-amber-100",
            icon: item.category_icon || "PackageSearch",
            status: item.status,
            imageUrl: item.image_url,
            category: item.category,
            remarks: item.remarks,
            foundBy: item.found_by,
            storageLocation: item.storage_location,
            time: item.time_found
          })))
        }
      } catch (err) {
        console.error("Failed to load found items", err)
      } finally {
        setLoadingFound(false)
      }
    }

    loadFoundItems()
  }, [])

  // Filter list by search term
  const filteredFound = foundList.filter(item => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      item.item.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term)
    )
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setForm(prev => ({ ...prev, imageName: file.name }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const activeUserStr = localStorage.getItem("current_user")
    let profileId = null
    if (activeUserStr) {
      try {
        profileId = JSON.parse(activeUserStr).id
      } catch (err) {}
    }

    // Default valid fallback profile ID if user is not signed in
    if (!profileId) {
      profileId = "00000000-0000-0000-0000-000000000000"
    }

    const caseNumber = `LF-2026-${Math.floor(Math.random() * 90000 + 10000)}`
    const dateVal = form.date || new Date().toISOString().split("T")[0]
    const photoUrl = imagePreview || ""

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        await devoteeApi.reportLostItem({
          item_name: form.itemName,
          color_description: form.description,
          location_lost: form.location || "Temple Complex",
          date_lost: dateVal,
          contact_phone: form.phone,
          image_url: photoUrl
        })
      }

       setSubmitted(true)
       loadMyReports()
      setForm({ itemName: "", description: "", date: getTodayStr(), location: "", phone: "", imageName: "" })
      setImagePreview(null)
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error("Failed to insert lost report", err)
      alert("Failed to submit report. Please try again.")
    }
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">{t("screens.lostFound.lostFound")}</h1>
            <p className="text-sm text-white/80 mt-1">{t("screens.lostFound.reunitingDevoteesWithTheirBelongings")}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="PackageSearch" className="size-6" />
          </span>
        </div>
        {/* Helpline */}
        <a href="tel:01576-230011" className="relative mt-4 flex items-center gap-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/15 px-4 py-2.5">
          <Icon name="Phone" className="size-4 text-white" />
          <div>
            <p className="text-[10px] text-white/70 uppercase tracking-wider">{t("screens.lostFound.lostFoundHelpline")}</p>
            <p className="text-sm font-bold text-white">01576-230011</p>
          </div>
        </a>
      </section>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-secondary/60 p-1.5 gap-1 shadow-inner">
        <button
          onClick={() => setActiveTab("found")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "found"
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="Search" className="size-4" />
          {t("screens.lostFound.foundItems")}
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "report"
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="TriangleAlert" className="size-4" />
          {t("screens.lostFound.reportLost")}
        </button>
        <button
          onClick={() => setActiveTab("my-reports")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "my-reports"
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="ClipboardList" className="size-4" />
          My Reports
        </button>
      </div>

      {/* Found Items List */}
      {activeTab === "found" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
            <Icon name="Info" className="size-4 text-green-600 shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              {t("screens.lostFound.itemsFoundInTheLast7DaysVisitTheLostFou")}
            </p>
          </div>

          {/* Real-time Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search found inventory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-xs font-semibold focus:border-primary focus:outline-none"
            />
            <Icon name="Search" className="absolute left-3 top-3 size-4 text-muted-foreground" />
          </div>

          {loadingFound ? (
            <p className="text-center text-xs text-muted-foreground py-6">Loading active found inventory...</p>
          ) : filteredFound.length > 0 ? (
            filteredFound.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.item} className="size-16 rounded-xl object-cover shrink-0 border border-border" />
                  ) : (
                    <span className={`grid size-16 shrink-0 place-items-center rounded-xl ${item.color}`}>
                      <Icon name={item.icon} className="size-8" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="font-heading font-bold text-sm text-foreground truncate">{item.item}</p>
                      <span className="text-[9px] font-bold text-muted-foreground bg-secondary rounded-lg px-2 py-0.5">ID: {item.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.desc}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <Icon name="Tag" className="size-3" /> {item.category || "General"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MapPin" className="size-3" /> {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" className="size-3" /> {item.date} {item.time ? `(${item.time})` : ""}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Status:</span>
                    <span className={`text-[10px] font-bold uppercase rounded-lg px-2 py-0.5 ${
                      item.status === "Found" || item.status === "ready-to-collect"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : item.status === "Claim Requested"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : item.status === "Claim Approved"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : item.status === "Returned"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}>
                      {item.status || "Found"}
                    </span>
                  </div>

                  {(item.status === "Found" || item.status === "ready-to-collect") && (
                    <button
                      onClick={() => setClaimingItem(item)}
                      className="rounded-xl bg-primary text-white text-[11px] px-3.5 py-1.5 font-bold shadow-sm transition hover:bg-primary-dark active:scale-95"
                    >
                      Claim This Item
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-xs text-muted-foreground py-8 italic border border-dashed rounded-2xl">
              No matching items found in the inventory ledger.
            </p>
          )}

          <Ornament />

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("screens.lostFound.lostFoundDesk")}</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Icon name="MapPin" className="size-3.5 text-primary" />{t("screens.lostFound.gate2NearMedicalCamp")}</div>
              <div className="flex items-center gap-2"><Icon name="Clock" className="size-3.5 text-primary" />{t("screens.lostFound.open500Am1000Pm")}</div>
              <div className="flex items-center gap-2"><Icon name="Phone" className="size-3.5 text-primary" />01576-230011</div>
            </div>
          </section>
        </div>
      )}

      {/* Report Lost Item Form */}
      {activeTab === "report" && (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-3xl border border-green-200 bg-green-50 p-6 text-center shadow-sm"
              >
                <span className="grid size-14 place-items-center rounded-full bg-green-100 text-green-600">
                  <Icon name="CheckCircle" className="size-7" />
                </span>
                <h3 className="font-heading text-base font-bold text-green-700">
                  {t("screens.lostFound.reportSubmitted")}
                </h3>
                <p className="text-xs text-green-600 leading-relaxed">
                  {t("screens.lostFound.ourTeamWillContactYouAtYourNumberIfYourI")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
                  <p className="text-xs text-[#6b5440] font-semibold leading-relaxed">
                    Provide clear item identification markers below. Submissions sync directly to security desks.
                  </p>
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.itemName")} *</label>
                  <input
                    type="text"
                    required
                    placeholder={t("screens.lostFound.egBlueWalletGoldRing")}
                    value={form.itemName}
                    onChange={e => setForm({ ...form, itemName: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Description of item */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter color, brand, markings, contents or unique features..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-3 text-sm font-semibold focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.yourPhoneNumber")} *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Location - Optional */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.whereWasItLost")} (Optional)</label>
                  <select
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  >
                    <option value="">{t("screens.lostFound.selectLocation")}</option>
                    {["Main Sanctum", "Queue Complex", "Prasad Counter", "Parking Lot A", "Parking Lot B", "Gate 1", "Gate 2", "Gate 3", "Shyam Kund", "Other"].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* Date - Optional */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">{t("screens.lostFound.dateOfLoss")} (Optional)</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Item Image - Optional */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Item Image (Optional)</label>
                  <div className="relative border-2 border-dashed border-border rounded-2xl p-4 text-center bg-muted/20 hover:bg-muted/40 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-1">
                      <Icon name="Camera" className="size-6 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground font-semibold">
                        {form.imageName ? `Selected: ${form.imageName}` : "Click to select or capture item photo"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Supported: JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="mt-3.5 relative size-24 rounded-xl border overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, imageName: "" }))
                          setImagePreview(null)
                        }}
                        className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/60 text-white"
                      >
                        <Icon name="X" className="size-3" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3.5 font-heading text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                >
                  <Icon name="Send" className="size-4" />
                  {t("screens.lostFound.submitReport")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* My Reports Timeline & List */}
      {activeTab === "my-reports" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
            <Icon name="Info" className="size-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Track the status history of your reported items.
            </p>
          </div>

          {loadingMyReports ? (
            <p className="text-center text-xs text-muted-foreground py-6">Loading your reports...</p>
          ) : myReportsList.length > 0 ? (
            myReportsList.map((item) => {
              // Parse history from additional_details
              let parsed: any = { user_notes: "", history: [] }
              try {
                if (item.additional_details && item.additional_details.startsWith("{") && item.additional_details.endsWith("}")) {
                  parsed = JSON.parse(item.additional_details)
                }
              } catch (e) {}

              // Status pipeline trace stages
              const stages = ["Reported", "Under Review", "Found", "Claimed", "Closed"]
              // Determine active stage
              let activeStage = "Reported"
              if (parsed.history && parsed.history.length > 0) {
                activeStage = parsed.history[parsed.history.length - 1].status
              }

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading font-bold text-sm text-foreground">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.color_description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary rounded-lg px-2 py-1">
                      {item.case_number}
                    </span>
                  </div>

                  {/* Status Timeline Progress Bar */}
                  <div className="pt-2">
                    <div className="relative flex justify-between">
                      {/* Connection Line */}
                      <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-muted z-0" />
                      
                      {stages.map((stage, idx) => {
                        const isCompleted = parsed.history.some((h: any) => h.status === stage)
                        const isActive = activeStage === stage
                        
                        return (
                          <div key={stage} className="relative z-10 flex flex-col items-center">
                            <span className={`size-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              isActive
                                ? "bg-gradient-to-r from-primary to-secondary text-white ring-2 ring-primary/20 animate-pulse"
                                : isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                            }`}>
                              {isCompleted ? "✓" : idx + 1}
                            </span>
                            <span className={`text-[8px] font-bold mt-1 ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {stage}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Timeline Logs List */}
                  {parsed.history && parsed.history.length > 0 && (
                    <div className="border-t border-border/50 pt-2 space-y-1.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Icon name="History" className="size-3" /> Transition Logs
                      </p>
                      <div className="space-y-1 pl-2 border-l border-border/80">
                        {parsed.history.map((h: any, logIdx: number) => (
                          <div key={logIdx} className="text-[10px] flex justify-between text-muted-foreground">
                            <span className="font-semibold text-foreground">· {h.status}</span>
                            <span>{new Date(h.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })
          ) : (
            <p className="text-center text-xs text-muted-foreground py-8 italic border border-dashed rounded-2xl">
              You haven't reported any lost items.
            </p>
          )}

          {/* My Claims Section */}
          <div className="pt-6 border-t border-border/80 mt-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
              <Icon name="FileCheck" className="size-4 text-primary" />
              My Claim Requests
            </h3>
            {myClaims.length > 0 ? (
              <div className="space-y-3">
                {myClaims.map((claim) => (
                  <div key={claim.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-heading font-bold text-xs text-foreground">
                          Claimed Item: {claim.found_items?.item_name || "Found Item"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Category: {claim.found_items?.category || "General"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Found Date: {claim.found_items?.date_found}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase rounded-lg px-2 py-1 ${
                        claim.status === "approved" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : claim.status === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    <div className="border-t border-border/40 pt-2 text-[10px] text-muted-foreground space-y-1">
                      <p><strong>Claimant Name:</strong> {claim.claimant_name}</p>
                      <p><strong>Identity Proof:</strong> {claim.identity_proof_type} ({claim.identity_proof_number})</p>
                      <p><strong>Claim Details:</strong> {claim.claim_description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-8 italic border border-dashed rounded-2xl">
                No claim requests submitted.
              </p>
            )}
          </div>

          <Ornament />
        </div>
      )}

      {/* Claim Request Modal */}
      <AnimatePresence>
        {claimingItem && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-card border border-border p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground">Submit Claim Request</h3>
                  <p className="text-xs text-muted-foreground">Item: {claimingItem.item}</p>
                </div>
                <button
                  onClick={() => setClaimingItem(null)}
                  className="grid size-8 place-items-center rounded-full bg-muted/65 hover:bg-muted text-foreground transition"
                >
                  <Icon name="X" className="size-4" />
                </button>
              </div>

              {claimFeedback ? (
                <div className={`rounded-2xl p-4 text-center text-xs font-bold ${
                  claimFeedback.includes("successfully") 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {claimFeedback}
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={claimForm.claimantName}
                      onChange={(e) => setClaimForm(prev => ({ ...prev, claimantName: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">ID Proof Type *</label>
                      <select
                        value={claimForm.identityProofType}
                        onChange={(e) => setClaimForm(prev => ({ ...prev, identityProofType: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">ID Proof Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="Last 4 digits or Full No."
                        value={claimForm.identityProofNumber}
                        onChange={(e) => setClaimForm(prev => ({ ...prev, identityProofNumber: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Describe the Item / Proof of Ownership *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe unique identifiers, contents, or purchase proof to verify it belongs to you."
                      value={claimForm.claimDescription}
                      onChange={(e) => setClaimForm(prev => ({ ...prev, claimDescription: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {submittingClaim ? "Submitting..." : "Submit Claim Request"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}