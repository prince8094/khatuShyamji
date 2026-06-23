export type ScreenKey =
  | "home"
  | "book"
  | "passenger-details"
  | "services"
  | "bookings"
  | "qr"
  | "crowd"
  | "traffic"
  | "reach"
  | "offline"
  | "temple"
  | "emergency"
  | "notifications"
  | "profile"

export const user = {
  name: "Mohan Sharma",
  phone: "+91 98290 12345",
  initials: "MS",
}

export type Booking = {
  id: string
  date: string
  day: string
  visitors: number
  status: "upcoming" | "completed" | "cancelled"
  name: string
}

export const bookings: Booking[] = [
  { id: "KSJ-2026-08841", date: "28 Jun 2026", day: "Sunday", visitors: 4, status: "upcoming", name: "Mohan Sharma" },
  { id: "KSJ-2026-08120", date: "12 Jun 2026", day: "Friday", visitors: 2, status: "completed", name: "Mohan Sharma" },
  { id: "KSJ-2026-07765", date: "02 Jun 2026", day: "Monday", visitors: 6, status: "completed", name: "Mohan Sharma" },
  { id: "KSJ-2026-07001", date: "21 May 2026", day: "Thursday", visitors: 3, status: "cancelled", name: "Mohan Sharma" },
]

export const liveStatus = {
  crowd: { label: "Crowd Level", value: "Moderate", hint: "~ 6,400 devotees", tone: "warning" as const },
  traffic: { label: "Traffic Status", value: "Smooth", hint: "NH-148 clear", tone: "success" as const },
  parking: { label: "Parking", value: "Available", hint: "Lot B · 320 left", tone: "success" as const },
  darshan: { label: "Darshan", value: "Open", hint: "Wait ~ 35 min", tone: "success" as const },
}

export const services = [
  { key: "hotel", label: "Hotel Booking", hindi: "होटल", icon: "BedDouble", desc: "Stays near the temple", meta: "120+ options" },
  { key: "transport", label: "Transport", hindi: "ट्रांसपोर्ट", icon: "CarFront", desc: "Cabs & private cars", meta: "24×7" },
  { key: "restaurant", label: "Restaurant", hindi: "भोजन", icon: "UtensilsCrossed", desc: "Pure veg bhojan", meta: "Sattvik" },
  { key: "bus", label: "Shyam Bus", hindi: "बस सेवा", icon: "BusFront", desc: "Shuttle to Khatu Dham", meta: "Every 15 min" },
  { key: "prasad", label: "Prasad", hindi: "प्रसाद", icon: "ShoppingBag", desc: "Order blessed prasad", meta: "Home delivery" },
  { key: "donation", label: "Donation", hindi: "दान", icon: "HandCoins", desc: "Support the seva", meta: "80G receipt" },
  { key: "puja", label: "Puja Booking", hindi: "पूजा", icon: "Flame", desc: "Book a special puja", meta: "Daily slots" },
  { key: "seva", label: "Seva Booking", hindi: "सेवा", icon: "HeartHandshake", desc: "Offer your seva", meta: "Volunteer" },
  { key: "offerings", label: "Offerings", hindi: "अर्पण", icon: "Flower2", desc: "Flowers & chola", meta: "Fresh daily" },
  { key: "group", label: "Group Booking", hindi: "समूह", icon: "Users", desc: "For 10+ devotees", meta: "Priority" },
]

export const drawerItems: { key: ScreenKey; label: string; hindi: string; icon: string }[] = [
  { key: "home", label: "Home", hindi: "होम", icon: "Home" },
  { key: "book", label: "Book Darshan", hindi: "दर्शन बुकिंग", icon: "CalendarCheck" },
  { key: "bookings", label: "My Bookings", hindi: "मेरी बुकिंग", icon: "Ticket" },
  { key: "qr", label: "QR Pass", hindi: "क्यूआर पास", icon: "QrCode" },
  { key: "crowd", label: "Live Crowd Status", hindi: "भीड़ स्थिति", icon: "Users" },
  { key: "traffic", label: "Traffic Updates", hindi: "ट्रैफिक", icon: "TrafficCone" },
  { key: "reach", label: "How to Reach", hindi: "कैसे पहुंचें", icon: "MapPin" },
  { key: "offline", label: "Offline Centers", hindi: "ऑफलाइन केंद्र", icon: "Building2" },
  { key: "temple", label: "Temple Information", hindi: "मंदिर जानकारी", icon: "Landmark" },
  { key: "emergency", label: "Emergency Help", hindi: "आपातकालीन", icon: "Siren" },
  { key: "notifications", label: "Notifications", hindi: "सूचनाएं", icon: "Bell" },
  { key: "profile", label: "Profile", hindi: "प्रोफ़ाइल", icon: "User" },
]

export const offlineCenters = [
  { name: "Khatu Main Counter", area: "Near Temple Gate 1, Khatu", hours: "5:00 AM – 10:00 PM", phone: "01576-230011" },
  { name: "Reengus Railway Center", area: "Reengus Junction, Platform 1", hours: "6:00 AM – 9:00 PM", phone: "01576-230244" },
  { name: "Sikar City Office", area: "Station Road, Sikar", hours: "9:00 AM – 7:00 PM", phone: "01572-240900" },
  { name: "Jaipur Booking Desk", area: "Sindhi Camp Bus Stand, Jaipur", hours: "8:00 AM – 8:00 PM", phone: "0141-2200345" },
]

export const notifications = [
  { title: "Darshan confirmed", body: "Your booking KSJ-2026-08841 for 28 Jun is confirmed.", time: "2h ago", tone: "success" as const, icon: "CalendarCheck" },
  { title: "Heavy rush expected", body: "Ekadashi tomorrow — please arrive before 7 AM.", time: "6h ago", tone: "warning" as const, icon: "TriangleAlert" },
  { title: "Parking Lot A full", body: "Use Lot B near Gate 3. Free shuttle available.", time: "1d ago", tone: "warning" as const, icon: "CarFront" },
  { title: "Prasad order ready", body: "Your prasad packet can be collected at counter 4.", time: "2d ago", tone: "success" as const, icon: "ShoppingBag" },
]

export const aartiTimings = [
  { name: "Mangla Aarti", hindi: "मंगला आरती", time: "4:30 AM" },
  { name: "Shringaar", hindi: "श्रृंगार", time: "7:00 AM" },
  { name: "Bhog Aarti", hindi: "भोग आरती", time: "12:30 PM" },
  { name: "Sandhya Aarti", hindi: "संध्या आरती", time: "7:30 PM" },
]

export const travelModes = [
  { mode: "By Road", icon: "CarFront", detail: "Khatu is 80 km from Jaipur via NH-148D. Well-connected by taxi & private cars." },
  { mode: "By Train", icon: "TrainFront", detail: "Nearest station: Reengus Junction (17 km). Ample taxis & autos available." },
  { mode: "By Bus", icon: "BusFront", detail: "Regular RSRTC & Shyam buses from Jaipur, Sikar & Delhi to Khatu Dham." },
  { mode: "Parking", icon: "SquareParking", detail: "3 large lots (A, B, C) with free shuttle service to the main temple gate." },
]
