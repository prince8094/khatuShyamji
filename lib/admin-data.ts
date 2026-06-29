// ────────────────────────────────────────────────────────────────────────────
// Admin Portal – Types, mock data & constants
// ────────────────────────────────────────────────────────────────────────────

// ─── Screen Keys ────────────────────────────────────────────────────────────
export type AdminScreenKey =
  | "admin-login"
  | "role-hub"
  | "command-center"
  | "accommodation"
  | "parking-management"
  | "traffic-ops"
  | "lost-found-admin"
  | "seva-management"
  | "temple-info-admin"
  | "donation-management"
  | "emergency-ops"
  | "notifications-admin"
  | "admin-management"
  | "approval-queue"

// ─── Roles ──────────────────────────────────────────────────────────────────
export type AdminRoleKey =
  | "super-admin"
  | "accommodation"
  | "parking"
  | "traffic"
  | "lost-found"
  | "seva"
  | "temple-info"
  | "donation"
  | "emergency"

export type AdminRole = {
  key: AdminRoleKey
  name: string
  description: string
  icon: string
  screen: AdminScreenKey
  color: string       // gradient classes or hex
  liveCount?: number  // live stat to show on card
  liveLabel?: string
  notifications: number
}

export const adminRoles: AdminRole[] = [
  {
    key: "super-admin",
    name: "Temple Operations Command Center",
    description: "Full operational oversight & system control",
    icon: "Shield",
    screen: "command-center",
    color: "from-[#D97706] to-[#B45309]",
    liveCount: 6420,
    liveLabel: "Live Devotees",
    notifications: 5,
  },
  {
    key: "accommodation",
    name: "Accommodation Management",
    description: "Manage hotels, rooms & bookings",
    icon: "BedDouble",
    screen: "accommodation",
    color: "from-[#2563EB] to-[#1D4ED8]",
    liveCount: 847,
    liveLabel: "Rooms Occupied",
    notifications: 3,
  },
  {
    key: "parking",
    name: "Parking Management",
    description: "Parking blocks, capacity & shuttle ops",
    icon: "SquareParking",
    screen: "parking-management",
    color: "from-[#059669] to-[#047857]",
    liveCount: 1240,
    liveLabel: "Vehicles Parked",
    notifications: 2,
  },
  {
    key: "traffic",
    name: "Traffic Operations",
    description: "Route monitoring & traffic alerts",
    icon: "TrafficCone",
    screen: "traffic-ops",
    color: "from-[#DC2626] to-[#B91C1C]",
    liveCount: 3,
    liveLabel: "Active Alerts",
    notifications: 1,
  },
  {
    key: "lost-found",
    name: "Lost & Found",
    description: "Item recovery & devotee assistance",
    icon: "PackageSearch",
    screen: "lost-found-admin",
    color: "from-[#7C3AED] to-[#6D28D9]",
    liveCount: 12,
    liveLabel: "Open Cases",
    notifications: 4,
  },
  {
    key: "seva",
    name: "Seva Management",
    description: "Puja bookings, slots & schedule",
    icon: "Heart",
    screen: "seva-management",
    color: "from-[#DB2777] to-[#BE185D]",
    liveCount: 34,
    liveLabel: "Today's Sevas",
    notifications: 2,
  },
  {
    key: "temple-info",
    name: "Temple Information",
    description: "Content, timings & guidelines",
    icon: "Landmark",
    screen: "temple-info-admin",
    color: "from-[#D4AF37] to-[#B8960C]",
    liveCount: 4,
    liveLabel: "Pending Updates",
    notifications: 1,
  },
  {
    key: "donation",
    name: "Donation Management",
    description: "Donations, receipts & campaigns",
    icon: "HandCoins",
    screen: "donation-management",
    color: "from-[#EA580C] to-[#C2410C]",
    liveCount: 156,
    liveLabel: "Today's Donations",
    notifications: 0,
  },
  {
    key: "emergency",
    name: "Emergency Operations",
    description: "Alerts, incidents & crowd control",
    icon: "Siren",
    screen: "emergency-ops",
    color: "from-[#DC2626] to-[#991B1B]",
    liveCount: 0,
    liveLabel: "Active Incidents",
    notifications: 0,
  },
]

// ─── Admin Users ────────────────────────────────────────────────────────────
export type AdminUser = {
  id: string
  name: string
  phone: string
  email: string
  initials: string
  roles: AdminRoleKey[]
  isActive: boolean
  lastLogin: string
}

export const adminUsers: AdminUser[] = [
  {
    id: "ADM-001",
    name: "Nand Kumar",
    phone: "+91 98290 10001",
    email: "nand@khatushyamji.org",
    initials: "NK",
    roles: ["super-admin", "accommodation", "parking", "traffic", "lost-found", "seva", "temple-info", "donation", "emergency"],
    isActive: true,
    lastLogin: "29 Jun 2026, 11:45 AM",
  },
  {
    id: "ADM-002",
    name: "Deepika Verma",
    phone: "+91 98290 10002",
    email: "deepika@khatushyamji.org",
    initials: "DV",
    roles: ["accommodation"],
    isActive: true,
    lastLogin: "29 Jun 2026, 09:20 AM",
  },
  {
    id: "ADM-003",
    name: "Ankita Singh Somwanshi",
    phone: "+91 98290 10003",
    email: "ankita@khatushyamji.org",
    initials: "AS",
    roles: ["parking"],
    isActive: true,
    lastLogin: "29 Jun 2026, 10:15 AM",
  },
  {
    id: "ADM-004",
    name: "Prince Gupta",
    phone: "+91 98290 10004",
    email: "prince@khatushyamji.org",
    initials: "PG",
    roles: ["traffic", "emergency"],
    isActive: true,
    lastLogin: "28 Jun 2026, 08:30 PM",
  },
  {
    id: "ADM-005",
    name: "Diya Goyal",
    phone: "+91 98290 10005",
    email: "diya@khatushyamji.org",
    initials: "DG",
    roles: ["lost-found"],
    isActive: true,
    lastLogin: "29 Jun 2026, 07:00 AM",
  },
  {
    id: "ADM-006",
    name: "Shahanaj Khan",
    phone: "+91 98290 10006",
    email: "shahanaj@khatushyamji.org",
    initials: "SK",
    roles: ["seva", "donation"],
    isActive: false,
    lastLogin: "25 Jun 2026, 03:00 PM",
  },
]

// ─── Hotels (Accommodation) ────────────────────────────────────────────────
export type Hotel = {
  id: string
  name: string
  stars: number
  totalRooms: number
  occupied: number
  available: number
  priceRange: string
  assignedAdmin: string
  status: "active" | "maintenance" | "closed"
  todayCheckIns: number
  todayCheckOuts: number
  rating: number
}

export const hotels: Hotel[] = [
  { id: "HTL-001", name: "Shyam Palace", stars: 4, totalRooms: 120, occupied: 98, available: 22, priceRange: "₹2,500 – ₹6,000", assignedAdmin: "Priya Sharma", status: "active", todayCheckIns: 15, todayCheckOuts: 8, rating: 4.5 },
  { id: "HTL-002", name: "Khatu Dham Residency", stars: 3, totalRooms: 80, occupied: 72, available: 8, priceRange: "₹1,200 – ₹3,500", assignedAdmin: "Priya Sharma", status: "active", todayCheckIns: 12, todayCheckOuts: 5, rating: 4.2 },
  { id: "HTL-003", name: "Bhakti Niwas", stars: 3, totalRooms: 60, occupied: 45, available: 15, priceRange: "₹800 – ₹2,000", assignedAdmin: "Priya Sharma", status: "active", todayCheckIns: 8, todayCheckOuts: 10, rating: 4.0 },
  { id: "HTL-004", name: "Shree Krishna Guest House", stars: 2, totalRooms: 40, occupied: 30, available: 10, priceRange: "₹500 – ₹1,500", assignedAdmin: "Priya Sharma", status: "active", todayCheckIns: 6, todayCheckOuts: 4, rating: 3.8 },
  { id: "HTL-005", name: "Temple View Inn", stars: 3, totalRooms: 50, occupied: 0, available: 50, priceRange: "₹1,000 – ₹2,800", assignedAdmin: "Priya Sharma", status: "maintenance", todayCheckIns: 0, todayCheckOuts: 0, rating: 4.1 },
]

// ─── Parking Blocks ─────────────────────────────────────────────────────────
export type ParkingBlock = {
  id: string
  name: string
  totalCapacity: number
  occupied: number
  available: number
  status: "open" | "full" | "closed"
  assignedAdmin: string
  vehicleTypes: string[]
  revenueToday: number
  shuttleActive: boolean
}

export const parkingBlocks: ParkingBlock[] = [
  { id: "PKG-A", name: "Parking Block A", totalCapacity: 500, occupied: 420, available: 80, status: "open", assignedAdmin: "Vikram Singh", vehicleTypes: ["Car", "SUV"], revenueToday: 42000, shuttleActive: true },
  { id: "PKG-B", name: "Parking Block B", totalCapacity: 400, occupied: 320, available: 80, status: "open", assignedAdmin: "Vikram Singh", vehicleTypes: ["Car", "SUV", "Bus"], revenueToday: 38000, shuttleActive: true },
  { id: "PKG-C", name: "Parking Block C", totalCapacity: 300, occupied: 300, available: 0, status: "full", assignedAdmin: "Vikram Singh", vehicleTypes: ["Two-Wheeler"], revenueToday: 15000, shuttleActive: false },
  { id: "PKG-D", name: "Overflow Lot D", totalCapacity: 600, occupied: 200, available: 400, status: "open", assignedAdmin: "Vikram Singh", vehicleTypes: ["Car", "SUV", "Bus", "Two-Wheeler"], revenueToday: 12000, shuttleActive: true },
]

// ─── Traffic Alerts ─────────────────────────────────────────────────────────
export type TrafficAlert = {
  id: string
  route: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  source: "AI" | "Google Maps" | "IoT" | "Manual"
  publishedAt: string
  publishedBy: string
  isActive: boolean
}

export const trafficAlerts: TrafficAlert[] = [
  { id: "TRF-001", route: "NH-148D (Jaipur → Khatu)", severity: "medium", message: "Heavy traffic near Reengus junction. Expect 30 min delay.", source: "Google Maps", publishedAt: "11:30 AM", publishedBy: "Anita Devi", isActive: true },
  { id: "TRF-002", route: "Sikar Road", severity: "low", message: "Minor congestion near Sikar bypass. Clearing up.", source: "AI", publishedAt: "10:45 AM", publishedBy: "System AI", isActive: true },
  { id: "TRF-003", route: "Temple Approach Road", severity: "high", message: "Road closed for VIP movement. Use Gate 3 approach.", source: "Manual", publishedAt: "09:15 AM", publishedBy: "Anita Devi", isActive: true },
  { id: "TRF-004", route: "NH-148D (Delhi → Khatu)", severity: "low", message: "All clear. Smooth traffic flow.", source: "IoT", publishedAt: "08:00 AM", publishedBy: "System IoT", isActive: false },
]

// ─── Lost & Found Cases ─────────────────────────────────────────────────────
export type LostFoundCase = {
  id: string
  itemName: string
  description: string
  location: string
  reportedAt: string
  reportedBy: string
  phone: string
  status: "registered" | "searching" | "possible-match" | "verification" | "ready-to-collect" | "collected"
  assignedTo: string
  matchedFoundItem?: string
  icon: string
}

export const lostFoundCases: LostFoundCase[] = [
  { id: "LF-2026-001", itemName: "Gold Ring", description: "22K gold ring with emerald stone", location: "Main Sanctum", reportedAt: "29 Jun, 09:30 AM", reportedBy: "Ramesh Gupta", phone: "+91 98765 43210", status: "possible-match", assignedTo: "Mahesh Choudhary", matchedFoundItem: "FND-045", icon: "CircleDot" },
  { id: "LF-2026-002", itemName: "Blue Wallet", description: "Navy blue leather wallet with Aadhar card", location: "Parking Lot A", reportedAt: "29 Jun, 08:15 AM", reportedBy: "Suresh Patel", phone: "+91 98765 43211", status: "searching", assignedTo: "Mahesh Choudhary", icon: "Wallet" },
  { id: "LF-2026-003", itemName: "Child's Shoes", description: "Red Bata shoes, size 8, child's", location: "Queue Complex", reportedAt: "28 Jun, 04:45 PM", reportedBy: "Meena Devi", phone: "+91 98765 43212", status: "ready-to-collect", assignedTo: "Mahesh Choudhary", icon: "Footprints" },
  { id: "LF-2026-004", itemName: "Mobile Phone", description: "Samsung Galaxy A54, black color with cracked screen guard", location: "Prasad Counter", reportedAt: "28 Jun, 02:30 PM", reportedBy: "Karan Singh", phone: "+91 98765 43213", status: "registered", assignedTo: "Mahesh Choudhary", icon: "Smartphone" },
  { id: "LF-2026-005", itemName: "Prayer Beads", description: "Rudraksha mala, 108 beads, with silver clasp", location: "Gate 2", reportedAt: "28 Jun, 11:00 AM", reportedBy: "Lakshmi Bai", phone: "+91 98765 43214", status: "collected", assignedTo: "Mahesh Choudhary", icon: "Heart" },
  { id: "LF-2026-006", itemName: "Handbag", description: "Brown leather handbag with documents inside", location: "Shyam Kund", reportedAt: "27 Jun, 03:20 PM", reportedBy: "Kavita Sharma", phone: "+91 98765 43215", status: "verification", assignedTo: "Mahesh Choudhary", matchedFoundItem: "FND-042", icon: "ShoppingBag" },
]

// ─── Seva Bookings ──────────────────────────────────────────────────────────
export type SevaBooking = {
  id: string
  sevaName: string
  devoteeName: string
  date: string
  timeSlot: string
  amount: number
  status: "confirmed" | "pending" | "completed" | "cancelled"
  phone: string
}

export const sevaBookings: SevaBooking[] = [
  { id: "SEV-001", sevaName: "Abhishek Puja", devoteeName: "Nand Kumar", date: "29 Jun 2026", timeSlot: "6:00 AM", amount: 1100, status: "confirmed", phone: "+91 98290 12345" },
  { id: "SEV-002", sevaName: "Bhog Seva", devoteeName: "Radha Sharma", date: "29 Jun 2026", timeSlot: "12:00 PM", amount: 2100, status: "confirmed", phone: "+91 98290 12346" },
  { id: "SEV-003", sevaName: "Aarti Seva", devoteeName: "Gopal Das", date: "29 Jun 2026", timeSlot: "7:30 PM", amount: 501, status: "pending", phone: "+91 98290 12347" },
  { id: "SEV-004", sevaName: "Shringar Seva", devoteeName: "Meera Gupta", date: "29 Jun 2026", timeSlot: "7:00 AM", amount: 5100, status: "completed", phone: "+91 98290 12348" },
  { id: "SEV-005", sevaName: "Prasad Distribution", devoteeName: "Hari Om", date: "29 Jun 2026", timeSlot: "1:00 PM", amount: 3100, status: "confirmed", phone: "+91 98290 12349" },
]

// ─── Donations ──────────────────────────────────────────────────────────────
export type Donation = {
  id: string
  donorName: string
  amount: number
  mode: "UPI" | "Card" | "Cash" | "Bank Transfer"
  purpose: string
  time: string
  receiptGenerated: boolean
}

export const recentDonations: Donation[] = [
  { id: "DON-001", donorName: "Shyam Sundar", amount: 11000, mode: "UPI", purpose: "Temple Maintenance", time: "11:45 AM", receiptGenerated: true },
  { id: "DON-002", donorName: "Gayatri Devi", amount: 5100, mode: "Cash", purpose: "Anna Daan", time: "11:20 AM", receiptGenerated: true },
  { id: "DON-003", donorName: "Raghav Mehta", amount: 21000, mode: "Bank Transfer", purpose: "General Donation", time: "10:55 AM", receiptGenerated: false },
  { id: "DON-004", donorName: "Anonymous", amount: 1100, mode: "UPI", purpose: "Go Seva", time: "10:30 AM", receiptGenerated: true },
  { id: "DON-005", donorName: "Kamla Bai", amount: 2100, mode: "Cash", purpose: "Temple Decoration", time: "09:45 AM", receiptGenerated: true },
]

// ─── Activity Timeline ──────────────────────────────────────────────────────
export type ActivityEntry = {
  id: string
  time: string
  action: string
  department: AdminRoleKey
  actor: string
  icon: string
}

export const activityFeed: ActivityEntry[] = [
  { id: "ACT-01", time: "12:10 PM", action: "Lost item matched — Gold Ring (LF-2026-001)", department: "lost-found", actor: "Mahesh C.", icon: "PackageSearch" },
  { id: "ACT-02", time: "11:45 AM", action: "Donation received — ₹11,000 via UPI", department: "donation", actor: "System", icon: "HandCoins" },
  { id: "ACT-03", time: "11:30 AM", action: "Traffic alert published — NH-148D congestion", department: "traffic", actor: "Anita D.", icon: "TrafficCone" },
  { id: "ACT-04", time: "11:15 AM", action: "Parking Block C marked FULL", department: "parking", actor: "Vikram S.", icon: "SquareParking" },
  { id: "ACT-05", time: "10:45 AM", action: "Hotel Shyam Palace — 15 new check-ins", department: "accommodation", actor: "Priya S.", icon: "BedDouble" },
  { id: "ACT-06", time: "10:30 AM", action: "Seva completed — Shringar Seva by Meera Gupta", department: "seva", actor: "System", icon: "Heart" },
  { id: "ACT-07", time: "10:15 AM", action: "Temple timings updated for monsoon season", department: "temple-info", actor: "Rajesh K.", icon: "Landmark" },
  { id: "ACT-08", time: "09:30 AM", action: "Emergency drill conducted — all clear", department: "emergency", actor: "Anita D.", icon: "Siren" },
  { id: "ACT-09", time: "09:15 AM", action: "Global announcement — Ekadashi schedule", department: "super-admin", actor: "Rajesh K.", icon: "Megaphone" },
  { id: "ACT-10", time: "08:00 AM", action: "System health check — all services green", department: "super-admin", actor: "System", icon: "Shield" },
]

// ─── Approval Queue ─────────────────────────────────────────────────────────
export type ApprovalItem = {
  id: string
  type: "hotel-update" | "temple-info" | "announcement" | "service-listing" | "parking-info"
  title: string
  submittedBy: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  department: AdminRoleKey
  description: string
}

export const approvalQueue: ApprovalItem[] = [
  { id: "APR-001", type: "hotel-update", title: "Shyam Palace — New room photos", submittedBy: "Priya Sharma", submittedAt: "29 Jun, 10:30 AM", status: "pending", department: "accommodation", description: "Updated 12 room photos for deluxe category" },
  { id: "APR-002", type: "temple-info", title: "Monsoon darshan timings", submittedBy: "Rajesh Kumar", submittedAt: "29 Jun, 09:00 AM", status: "pending", department: "temple-info", description: "Updated morning aarti to 5:00 AM due to sunrise change" },
  { id: "APR-003", type: "announcement", title: "Ekadashi special arrangements", submittedBy: "Rajesh Kumar", submittedAt: "28 Jun, 04:00 PM", status: "approved", department: "super-admin", description: "Extra counters and extended darshan hours for Ekadashi" },
  { id: "APR-004", type: "service-listing", title: "New transport operator added", submittedBy: "Vikram Singh", submittedAt: "28 Jun, 02:00 PM", status: "rejected", department: "parking", description: "Shyam Travels — new bus service from Delhi" },
]

// ─── Command Center Live Data ───────────────────────────────────────────────
export const commandCenterData = {
  liveCrowd: { value: 6420, trend: "+12%", status: "moderate" as const },
  waitTime: { value: 35, unit: "min", trend: "-5 min", status: "normal" as const },
  traffic: { value: "Moderate", route: "NH-148D", status: "warning" as const },
  parking: { totalCapacity: 1800, occupied: 1240, available: 560, status: "normal" as const },
  hotels: { totalRooms: 350, occupied: 245, available: 105, status: "normal" as const },
  darshan: { status: "Open", queueLength: 320, gateActive: "Gate 1, 2, 3", nextAarti: "12:30 PM" },
  weather: { temp: 34, condition: "Partly Cloudy", humidity: 65, forecast: "Light rain expected evening" },
  festivalMode: false,
  emergencyAlerts: 0,
  systemHealth: {
    api: "operational" as const,
    cameras: "operational" as const,
    iotSensors: "operational" as const,
    paymentGateway: "operational" as const,
    notifications: "operational" as const,
  },
  aiInsights: [
    { id: "AI-1", message: "Expected crowd surge in 2 hours based on traffic inflow pattern", severity: "warning" as const, icon: "TrendingUp" },
    { id: "AI-2", message: "Parking Lot A reaching 84% — consider directing to Overflow Lot D", severity: "info" as const, icon: "SquareParking" },
    { id: "AI-3", message: "Wait time trending down — optimal darshan window for next 45 minutes", severity: "success" as const, icon: "Clock" },
  ],
}

// ─── Department Colors (for timeline, badges, etc.) ─────────────────────────
export const deptColors: Record<AdminRoleKey, { bg: string; text: string; border: string }> = {
  "super-admin": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  accommodation: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  parking: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  traffic: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "lost-found": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  seva: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  "temple-info": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  donation: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  emergency: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
}

// ─── Lost & Found Status Steps ──────────────────────────────────────────────
export const lostFoundStatuses = [
  { key: "registered", label: "Registered", icon: "ClipboardList" },
  { key: "searching", label: "Searching", icon: "Search" },
  { key: "possible-match", label: "Possible Match", icon: "GitCompare" },
  { key: "verification", label: "Verification", icon: "ShieldCheck" },
  { key: "ready-to-collect", label: "Ready to Collect", icon: "PackageCheck" },
  { key: "collected", label: "Collected", icon: "CheckCircle" },
] as const

// ─── Emergency Types ────────────────────────────────────────────────────────
export const emergencyTypes = [
  { key: "medical", label: "Medical Emergency", icon: "Heart", color: "bg-red-500" },
  { key: "fire", label: "Fire", icon: "Flame", color: "bg-orange-500" },
  { key: "security", label: "Security Threat", icon: "ShieldAlert", color: "bg-yellow-500" },
  { key: "weather", label: "Severe Weather", icon: "CloudLightning", color: "bg-blue-500" },
  { key: "stampede", label: "Crowd Control", icon: "Users", color: "bg-purple-500" },
] as const
