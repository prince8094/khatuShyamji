"use client"

import { useState, useMemo, useEffect } from "react"
import { Icon } from "@/components/shared"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import type { ScreenKey } from "@/lib/data"
import { motion, AnimatePresence } from "framer-motion"
import { devoteeApi } from "@/lib/api-client"

interface Opportunity {
  id: string
  role: string
  roleHi: string
  icon: string
  desc: string
  descHi: string
  duration: string
  durationHi: string
  status: "Open" | "Closed"
}

export function SevaBookingScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
  const { lang, t } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [success, setSuccess] = useState(false)
  const [opportunitiesList, setOpportunitiesList] = useState<Opportunity[]>([])

  const [activeTab, setActiveTab] = useState<"roles" | "history">("roles")
  const [myVolunteerApps, setMyVolunteerApps] = useState<any[]>([])
  const [loadingApps, setLoadingApps] = useState(false)

  const loadMyApplications = async () => {
    setLoadingApps(true)
    try {
      const apps = await devoteeApi.getVolunteerApplications()
      if (apps) {
        setMyVolunteerApps(apps)
      }
    } catch (err) {
      console.error("Failed to load volunteer applications", err)
    } finally {
      setLoadingApps(false)
    }
  }

  useEffect(() => {
    if (activeTab === "history") {
      loadMyApplications()
    }
  }, [activeTab])

  useEffect(() => {
    devoteeApi.getTempleInfo()
      .then((res: any) => {
        if (Array.isArray(res)) {
          const rec = res.find(r => r.section_key === "volunteer_opportunities")
          if (rec && Array.isArray(rec.content)) {
            setOpportunitiesList(rec.content)
          }
        }
      })
      .catch((err) => console.error("Failed to load volunteer opportunities", err))
  }, [])

  // Form State
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [city, setCity] = useState("")
  const [preferredRole, setPreferredRole] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("")
  const [experience, setExperience] = useState("")
  const [reason, setReason] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calendar States & Constants
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(5) // Start in June
  const calendarYear = 2026

  const todayDay = 30
  const todayMonth = 5 // June (0-indexed)
  const todayYear = 2026

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

  const days = useMemo(() => {
    const first = new Date(calendarYear, calendarMonth, 1).getDay()
    const total = new Date(calendarYear, calendarMonth + 1, 0).getDate()
    const cells: (number | null)[] = Array.from({ length: first }, () => null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
  }, [calendarMonth])

  const handleSelectDate = (day: number) => {
    const formattedDate = `${day.toString().padStart(2, "0")}/${(calendarMonth + 1).toString().padStart(2, "0")}/${calendarYear}`
    setPreferredDate(formattedDate)
    setShowCalendar(false)
    setErrors((prev) => {
      const next = { ...prev }
      delete next.preferredDate
      return next
    })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.fullName = lang === "hi" ? "पूरा नाम आवश्यक है" : "Full Name is required"
    
    if (!email.trim()) {
      newErrors.email = lang === "hi" ? "ईमेल आवश्यक है" : "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = lang === "hi" ? "अमान्य ईमेल प्रारूप" : "Invalid email format"
    }

    if (!mobile.trim()) {
      newErrors.mobile = lang === "hi" ? "मोबाइल नंबर आवश्यक है" : "Mobile number is required"
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = lang === "hi" ? "मोबाइल नंबर 10 अंकों का होना चाहिए" : "Mobile number must be 10 digits"
    }

    if (!age.trim()) {
      newErrors.age = lang === "hi" ? "उम्र आवश्यक है" : "Age is required"
    } else {
      const parsedAge = parseInt(age, 10)
      if (isNaN(parsedAge) || parsedAge < 16) {
        newErrors.age = lang === "hi" ? "स्वयंसेवा के लिए न्यूनतम आयु 16 वर्ष है" : "Minimum age for volunteering is 16"
      }
    }

    if (!gender) newErrors.gender = lang === "hi" ? "लिंग चुनें" : "Select gender"
    if (!city.trim()) newErrors.city = lang === "hi" ? "शहर आवश्यक है" : "City is required"
    if (!preferredRole) newErrors.preferredRole = lang === "hi" ? "भूमिका चुनें" : "Select role"
    if (!preferredDate) newErrors.preferredDate = lang === "hi" ? "तारीख चुनें" : "Select date"
    if (!preferredTimeSlot) newErrors.preferredTimeSlot = lang === "hi" ? "समय स्लॉट चुनें" : "Select time slot"
    if (!reason.trim()) newErrors.reason = lang === "hi" ? "स्वयंसेवा का कारण आवश्यक है" : "Reason for volunteering is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      setTimeout(() => {
        const el = document.getElementById(firstErrorField)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          el.focus()
        }
      }, 50)
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (validate()) {
      setIsSubmitting(true)

      const activeUserStr = localStorage.getItem("current_user")
      let profileId = null
      if (activeUserStr) {
        try {
          profileId = JSON.parse(activeUserStr).id
        } catch (err) {}
      }

      if (!profileId) {
        profileId = "00000000-0000-0000-0000-000000000000"
      }

      const [day, month, year] = preferredDate.split("/")
      const formattedDateDb = `${year}-${month}-${day}`

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
          await devoteeApi.applyVolunteer({
            full_name: fullName,
            email: email,
            mobile: mobile,
            age: parseInt(age) || 18,
            gender: gender,
            city: city,
            preferred_role: preferredRole,
            preferred_date: formattedDateDb,
            preferred_time_slot: preferredTimeSlot,
            experience: experience || null,
            reason: reason,
            emergency_contact: emergencyContact || null
          })
        }

        setSuccess(true)
        loadMyApplications()
        setFullName("")
        setEmail("")
        setMobile("")
        setAge("")
        setGender("")
        setCity("")
        setPreferredRole("")
        setPreferredDate("")
        setPreferredTimeSlot("")
        setExperience("")
        setReason("")
        setEmergencyContact("")
        
        setTimeout(() => {
          setSuccess(false)
          setShowModal(false)
        }, 3000)
      } catch (err: any) {
        setSubmitError(err.message || (lang === "hi" ? "पंजीकरण विफल रहा।" : "Registration failed."))
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#800000]">
          {lang === "hi" ? "खाटू धाम सेवा" : "Khatu Dham Seva"}
        </p>
        <h1 className="font-heading text-2xl font-extrabold text-[#800000] mt-1">
          {lang === "hi" ? "स्वयंसेवक सेवा" : "Volunteering Services"}
        </h1>
        <p className="text-sm text-[#8a5a22] italic mt-1.5 leading-relaxed font-medium">
          {lang === "hi"
            ? "भक्ति के साथ सेवा करें, मंदिर में योगदान दें और साथी भक्तों की मदद करें।"
            : "Serve with devotion, contribute towards the temple and help fellow devotees."}
        </p>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-[#FFF8F0] to-[#FFF0E0] p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#800000]/10 text-[#800000] shadow-sm">
              <Icon name="HeartHandshake" className="size-6" />
            </span>
            <h2 className="font-heading text-lg font-bold text-[#800000]">
              {lang === "hi" ? "बाबा श्याम की सेवा में योगदान दें" : "Join Baba Shyam's Divine Service"}
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {lang === "hi"
              ? "हमारे स्वयंसेवक कार्यक्रम में शामिल हों और बाबा श्याम की दिव्य सेवा का हिस्सा बनें। भक्तों को प्रबंधित करने, मंदिर की गतिविधियों में सहायता करने, आगंतुकों का मार्गदर्शन करने, स्वच्छता अभियानों का समर्थन करने और हर तीर्थयात्री के अनुभव को सुचारू और यादगार बनाने में योगदान दें।"
              : "Join our volunteering program and become a part of Baba Shyam's divine service. Help manage devotees, assist in temple activities, guide visitors, support cleanliness drives, and contribute to making every pilgrim's experience smooth and memorable."}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#800000] to-[#a02020] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="UserPlus" className="size-4" />
            {lang === "hi" ? "स्वयंसेवक के रूप में शामिल हों" : "Join as Volunteer"}
          </button>
        </div>
        <div className="hidden md:flex size-36 shrink-0 items-center justify-center rounded-full bg-[#800000]/5 border border-[#800000]/10">
          <Icon name="Heart" className="size-20 text-[#800000]/30 animate-pulse" />
        </div>
      </section>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-orange-50/50 border border-orange-100 p-1 gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "roles"
              ? "bg-gradient-to-r from-[#800000] to-[#a02020] text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="HeartHandshake" className="size-4" />
          {lang === "hi" ? "उपलब्ध भूमिकाएं" : "Available Roles"}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "history"
              ? "bg-gradient-to-r from-[#800000] to-[#a02020] text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="ClipboardList" className="size-4" />
          {lang === "hi" ? "आवेदन इतिहास" : "Application History"}
        </button>
      </div>

      {activeTab === "roles" && (
        <>
          {/* Volunteer Opportunities Title */}
          <div className="pt-2 border-t border-border">
            <h3 className="font-heading text-base font-bold text-[#800000]">
              {lang === "hi" ? "उपलब्ध स्वयंसेवा के अवसर" : "Available Volunteering Opportunities"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "hi"
                ? "विविध विभागों में अपनी रुचि के अनुसार सेवा का चयन करें"
                : "Select a volunteer role matching your skills and availability"}
            </p>
          </div>

          {/* Volunteer Opportunities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {opportunitiesList.map((opp) => {
              const isOpen = opp.status === "Open"
              return (
                <div
                  key={opp.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-[#800000]/30 hover:shadow-md transition duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#800000]/10 text-[#800000]">
                          <Icon name={opp.icon} className="size-5" />
                        </span>
                        <div>
                          <h4 className="font-heading text-sm font-extrabold text-[#800000]">
                            {lang === "hi" ? opp.roleHi : opp.role}
                          </h4>
                          <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                            <Icon name="Clock" className="size-3 text-[#8a5a22]" />
                            {lang === "hi" ? `शिफ्ट: ${opp.durationHi}` : `Shift: ${opp.duration}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${
                          isOpen
                            ? "bg-green-500/10 border-green-500/20 text-green-700"
                            : "bg-red-500/10 border-red-500/20 text-red-700"
                        }`}
                      >
                        {isOpen ? (lang === "hi" ? "खुला है" : "Open") : (lang === "hi" ? "बंद है" : "Closed")}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground pt-1">
                      {lang === "hi" ? opp.descHi : opp.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Guidelines / Info Card */}
          <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#FFF8F0] p-4 shadow-inner space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="BookOpen" className="size-5 text-[#800000]" />
              <h4 className="font-heading text-sm font-bold text-[#800000]">
                {lang === "hi" ? "स्वयंसेवक सेवा निर्देश" : "Volunteer Guidelines & Instructions"}
              </h4>
            </div>
            <ul className="list-disc list-inside text-xs space-y-2 text-[#8a5a22] font-medium pl-1 leading-relaxed">
              <li>{lang === "hi" ? "स्वयंसेवकों को अपनी शिफ्ट के समय पर रिपोर्ट करना चाहिए।" : "Volunteers must report on time for their scheduled shifts."}</li>
              <li>{lang === "hi" ? "साथ में एक वैध पहचान पत्र (आधार, वोटर कार्ड आदि) रखें।" : "Carry a valid government-issued ID proof (e.g. Aadhaar Card)."}</li>
              <li>{lang === "hi" ? "शालीन, सभ्य और आरामदायक पोशाक पहनें।" : "Wear decent, respectful, and comfortable clothing suitable for temple services."}</li>
              <li>{lang === "hi" ? "मंदिर प्रशासन और सुरक्षा अधिकारियों के निर्देशों का कड़ाई से पालन करें।" : "Strictly follow temple administration instructions and security protocols."}</li>
              <li>{lang === "hi" ? "सभी भक्तों के साथ विनम्र, आदरपूर्ण और सेवाभावी व्यवहार करें।" : "Behave respectfully, politely, and helpfully with all visiting devotees."}</li>
            </ul>
          </section>
        </>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl bg-[#FFF8F0] border border-[#D4AF37]/30 px-4 py-3">
            <Icon name="Info" className="size-4 text-[#800000] shrink-0" />
            <p className="text-xs text-[#8a5a22] font-medium">
              {lang === "hi"
                ? "आपके द्वारा सबमिट किए गए स्वयंसेवक आवेदनों की स्थिति देखें।"
                : "Track the active review status of your volunteer application profiles."}
            </p>
          </div>

          {loadingApps ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              {lang === "hi" ? "आवेदनों को लोड किया जा रहा है..." : "Loading applications..."}
            </p>
          ) : myVolunteerApps.length > 0 ? (
            myVolunteerApps.map((app) => {
              const statusColors: Record<string, string> = {
                pending: "bg-amber-50 border-amber-200 text-amber-700",
                approved: "bg-green-50 border-green-200 text-green-700",
                rejected: "bg-red-50 border-red-200 text-red-700",
              }
              const color = statusColors[app.status] || "bg-muted border-border text-muted-foreground"

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        {app.preferred_role.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Icon name="Calendar" className="size-3 text-primary" />
                        {new Date(app.preferred_date).toLocaleDateString([], { dateStyle: 'medium' })}
                        <span className="text-muted-foreground/30">|</span>
                        <Icon name="Clock" className="size-3 text-primary" />
                        {app.preferred_time_slot.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border capitalize ${color}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                    <div>Applicant: {app.full_name}</div>
                    <div>City: {app.city}</div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <p className="text-center text-xs text-muted-foreground py-8 italic border border-dashed rounded-2xl">
              {lang === "hi"
                ? "आपने कोई स्वयंसेवक आवेदन जमा नहीं किया है।"
                : "You haven't submitted any volunteer applications yet."}
            </p>
          )}
        </div>
      )}

      {/* Registration Modal Dialog */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-3xl border border-primary/20 bg-card p-6 shadow-2xl space-y-4 no-scrollbar"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-full hover:bg-secondary transition active:scale-90 text-muted-foreground"
              >
                <Icon name="X" className="size-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-[#800000]">
                  {lang === "hi" ? "स्वयंसेवक पंजीकरण" : "Volunteer Registration"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "hi" ? "बाबा श्याम के चरणों में सेवा के लिए अपना विवरण भरें" : "Submit your details to register as a temple volunteer"}
                </p>
              </div>

              {submitError && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
                  <Icon name="AlertCircle" className="size-5 text-red-600 shrink-0" />
                  <p className="text-xs font-semibold text-red-700">{submitError}</p>
                </div>
              )}

              {success ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="grid size-16 place-items-center rounded-full bg-green-500/10 text-green-600 border border-green-500/30">
                    <Icon name="CheckCircle" className="size-8" />
                  </div>
                  <h4 className="font-heading text-base font-bold text-green-700 text-center">
                    {lang === "hi" ? "पंजीकरण सफलतापूर्वक जमा हुआ" : "Successfully Registered"}
                  </h4>
                  <p className="text-xs text-center text-muted-foreground max-w-xs leading-relaxed">
                    {lang === "hi"
                      ? "स्वयंसेवक के रूप में पंजीकरण करने के लिए धन्यवाद। आपका आवेदन सफलतापूर्वक जमा कर दिया गया है।"
                      : "Thank you for registering as a volunteer. Your application has been submitted successfully."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  {/* Full Name */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                      {lang === "hi" ? "पूरा नाम" : "Full Name"} *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      disabled={isSubmitting}
                      type="text"
                      placeholder={lang === "hi" ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={errors.fullName ? "!border-red-400 focus:box-shadow-none" : ""}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Email & Mobile group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                        {lang === "hi" ? "ईमेल पता" : "Email Address"} *
                      </label>
                      <input
                        id="email"
                        name="email"
                        disabled={isSubmitting}
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? "!border-red-400" : ""}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                        {lang === "hi" ? "मोबाइल नंबर" : "Mobile Number"} *
                      </label>
                      <input
                        id="mobile"
                        name="mobile"
                        disabled={isSubmitting}
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                        className={errors.mobile ? "!border-red-400" : ""}
                      />
                      {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
                    </div>
                  </div>

                  {/* Age & Gender group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                        {lang === "hi" ? "आयु" : "Age"} *
                      </label>
                      <input
                        id="age"
                        name="age"
                        disabled={isSubmitting}
                        type="number"
                        placeholder="e.g. 25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className={errors.age ? "!border-red-400" : ""}
                      />
                      {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                        {lang === "hi" ? "लिंग" : "Gender"} *
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        disabled={isSubmitting}
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={errors.gender ? "!border-red-400" : ""}
                      >
                        <option value="">{lang === "hi" ? "चुनें" : "Select"}</option>
                        <option value="male">{lang === "hi" ? "पुरुष" : "Male"}</option>
                        <option value="female">{lang === "hi" ? "महिला" : "Female"}</option>
                        <option value="other">{lang === "hi" ? "अन्य" : "Other"}</option>
                      </select>
                      {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                      {lang === "hi" ? "शहर / निवास स्थान" : "City / Hometown"} *
                    </label>
                    <input
                      id="city"
                      name="city"
                      disabled={isSubmitting}
                      type="text"
                      placeholder={lang === "hi" ? "अपने शहर का नाम लिखें" : "Enter your city"}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={errors.city ? "!border-red-400" : ""}
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </div>

                  {/* Preferred Volunteer Role */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                      {lang === "hi" ? "पसंदीदा स्वयंसेवा भूमिका" : "Preferred Volunteer Role"} *
                    </label>
                    <select
                      id="preferredRole"
                      name="preferredRole"
                      disabled={isSubmitting}
                      value={preferredRole}
                      onChange={(e) => setPreferredRole(e.target.value)}
                      className={errors.preferredRole ? "!border-red-400" : ""}
                    >
                      <option value="">{lang === "hi" ? "चुनें" : "Select Opportunity"}</option>
                      {opportunitiesList
                        .filter((o) => o.status === "Open")
                        .map((opp) => (
                          <option key={opp.id} value={opp.id}>
                            {lang === "hi" ? opp.roleHi : opp.role}
                          </option>
                        ))}
                    </select>
                    {errors.preferredRole && <p className="mt-1 text-xs text-red-500">{errors.preferredRole}</p>}
                  </div>

                  {/* Preferred Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                        {lang === "hi" ? "पसंदीदा तारीख" : "Preferred Date"} *
                      </label>
                      <button
                        id="preferredDate"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={cn(
                          "w-full rounded-2xl border bg-card px-4 py-2.5 text-left text-sm font-semibold transition flex items-center justify-between",
                          errors.preferredDate ? "border-red-400" : "border-muted",
                          preferredDate ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <span>
                          {preferredDate 
                            ? preferredDate 
                            : (lang === "hi" ? "तारीख चुनें" : "Select Date")}
                        </span>
                        <Icon name="Calendar" className="size-4 text-primary" />
                      </button>
                      {errors.preferredDate && <p className="mt-1 text-xs text-red-500">{errors.preferredDate}</p>}

                      <AnimatePresence>
                        {showCalendar && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-2 rounded-2xl border border-[#D4AF37]/30 bg-white p-3 shadow-inner space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-[#8a5a22]">
                                {lang === "hi" ? "कैलेंडर" : "Calendar"}
                              </span>
                              <div className="flex items-center gap-1.5 rounded-full border border-[#E8D5B7] bg-[#FFF8F0] px-2 py-0.5 shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => setCalendarMonth((m) => Math.max(5, m - 1))}
                                  className="grid size-6 place-items-center rounded-full text-[#D97706] hover:bg-white disabled:opacity-30"
                                  disabled={calendarMonth <= 5}
                                >
                                  <Icon name="ChevronLeft" className="size-3.5" />
                                </button>
                                <span className="font-heading text-[11px] font-bold text-[#1A120B] w-20 text-center select-none">
                                  {MONTHS[calendarMonth]} {calendarYear}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCalendarMonth((m) => Math.min(7, m + 1))}
                                  className="grid size-6 place-items-center rounded-full text-[#D97706] hover:bg-white disabled:opacity-30"
                                  disabled={calendarMonth >= 7}
                                >
                                  <Icon name="ChevronRight" className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-7 text-center mb-1 border-b border-[#E8D5B7] pb-1">
                              {WEEKDAYS.map((d, i) => (
                                <span key={i} className="text-[9px] font-bold text-[#6b5440] uppercase">
                                  {d}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                              {days.map((d, i) => {
                                if (d === null) return <span key={i} />
                                
                                let isPast = false
                                if (calendarYear < todayYear) {
                                  isPast = true
                                } else if (calendarYear === todayYear) {
                                  if (calendarMonth < todayMonth) {
                                    isPast = true
                                  } else if (calendarMonth === todayMonth) {
                                    isPast = d < todayDay
                                  }
                                }

                                const formattedCheck = `${d.toString().padStart(2, "0")}/${(calendarMonth + 1).toString().padStart(2, "0")}/${calendarYear}`
                                const isSel = preferredDate === formattedCheck

                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => handleSelectDate(d)}
                                    className={cn(
                                      "relative grid aspect-square place-items-center rounded-xl font-heading text-xs font-bold transition-all duration-200",
                                      isSel && "bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white shadow-sm scale-105 z-10",
                                      !isSel && !isPast && "bg-transparent text-[#1A120B] border border-transparent hover:border-[#D4AF37]/40 hover:bg-[#FFF8F0]",
                                      isPast && "text-[#6b5440]/30 cursor-not-allowed"
                                    )}
                                  >
                                    {d}
                                    {d === todayDay && calendarMonth === todayMonth && !isSel && (
                                      <span className="absolute bottom-1.5 size-1 rounded-full bg-[#D4AF37]" />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                        {lang === "hi" ? "समय स्लॉट" : "Preferred Time Slot"} *
                      </label>
                      <select
                        id="preferredTimeSlot"
                        name="preferredTimeSlot"
                        disabled={isSubmitting}
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className={errors.preferredTimeSlot ? "!border-red-400" : ""}
                      >
                        <option value="">{lang === "hi" ? "चुनें" : "Select Shift"}</option>
                        <option value="morning">{lang === "hi" ? "सुबह (6:00 AM - 12:00 PM)" : "Morning (6:00 AM - 12:00 PM)"}</option>
                        <option value="afternoon">{lang === "hi" ? "दोपहर (12:00 PM - 6:00 PM)" : "Afternoon (12:00 PM - 6:00 PM)"}</option>
                        <option value="evening">{lang === "hi" ? "शाम (6:00 PM - 11:00 PM)" : "Evening (6:00 PM - 11:00 PM)"}</option>
                      </select>
                      {errors.preferredTimeSlot && <p className="mt-1 text-xs text-red-500">{errors.preferredTimeSlot}</p>}
                    </div>
                  </div>

                  {/* Previous Experience */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                      {lang === "hi" ? "पिछला स्वयंसेवा अनुभव (वैकल्पिक)" : "Previous Volunteer Experience (Optional)"}
                    </label>
                    <input
                      id="experience"
                      name="experience"
                      disabled={isSubmitting}
                      type="text"
                      placeholder={lang === "hi" ? "पूर्व अनुभव विवरण दर्ज करें" : "Enter previous experience details"}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>

                  {/* Reason for Volunteering */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                      {lang === "hi" ? "स्वयंसेवा करने का कारण" : "Reason for Volunteering"} *
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      disabled={isSubmitting}
                      rows={3}
                      placeholder={lang === "hi" ? "आप स्वयंसेवा क्यों करना चाहते हैं?" : "Why do you want to volunteer?"}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className={errors.reason ? "!border-red-400" : ""}
                    />
                    {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#8a5a22] uppercase tracking-wider">
                      {lang === "hi" ? "आपातकालीन संपर्क नंबर (वैकल्पिक)" : "Emergency Contact Number (Optional)"}
                    </label>
                    <input
                      id="emergencyContact"
                      name="emergencyContact"
                      disabled={isSubmitting}
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl bg-gradient-to-r from-[#800000] to-[#a02020] py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          {lang === "hi" ? "जमा किया जा रहा है..." : "Submitting..."}
                        </>
                      ) : (
                        lang === "hi" ? "पंजीकरण जमा करें" : "Submit Registration"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}