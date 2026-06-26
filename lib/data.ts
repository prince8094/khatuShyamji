export type ScreenKey =
  | "welcome"
  | "login"
  | "signup"
  | "otp"
  | "home"
  | "book"
  | "passenger-details"
  | "group-booking"
  | "booking-success"
  | "services"
  | "bookings"
  | "qr"
  | "crowd"
  | "traffic"
  | "parking"
  | "lost-found"
  | "reach"
  | "offline"
  | "temple"
  | "emergency"
  | "notifications"
  | "announcements"
  | "profile"
  | "shyam-ai"
  | "khatu-path"
  | "live-darshan"
  | "virtual-darshan"
  | "help-support"
  | "hotel-booking"
  | "transport"
  | "restaurant"
  | "shyam-bus"
  | "prashad"
  | "donation"
  | "seva-booking"
  | "offerings"

export const user = {
  name: "Nand Kumar",
  phone: "+91 98290 12345",
  initials: "NK",
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
  { id: "KSJ-2026-08841", date: "28 Jun 2026", day: "Sunday", visitors: 4, status: "upcoming", name: "Nand Kumar" },
  { id: "KSJ-2026-08120", date: "12 Jun 2026", day: "Friday", visitors: 2, status: "completed", name: "Nand Kumar" },
  { id: "KSJ-2026-07765", date: "02 Jun 2026", day: "Monday", visitors: 6, status: "completed", name: "Nand Kumar" },
  { id: "KSJ-2026-07001", date: "21 May 2026", day: "Thursday", visitors: 3, status: "cancelled", name: "Nand Kumar" },
]

export const liveStatus = {
  crowd: { label: "Crowd Level", value: "Moderate", hint: "~ 6,400 devotees", tone: "warning" as const },
  traffic: { label: "Traffic Status", value: "Smooth", hint: "NH-148 clear", tone: "success" as const },
  parking: { label: "Parking", value: "Available", hint: "Lot B · 320 left", tone: "success" as const },
  darshan: { label: "Darshan", value: "Open", hint: "Wait ~ 35 min", tone: "success" as const },
}

export const services = [
  { key: "live-darshan", label: "Live Darshan", hindi: "लाइव दर्शन", icon: "Video", desc: "Real-time shrine feed", meta: "Live", screenKey: "live-darshan" as const },
  { key: "aarti", label: "Aarti Timings", hindi: "आरती दर्शन", icon: "Flame", desc: "Daily aarti timings", meta: "Timings", screenKey: "home" as const },
  { key: "temple", label: "Temple Guide", hindi: "मंदिर विवरण", icon: "Landmark", desc: "Temple information", meta: "Guide", screenKey: "temple" as const },
  { key: "hotel", label: "Hotel Booking", hindi: "होटल बुकिंग", icon: "BedDouble", desc: "Stays near Khatu Dham", meta: "120+ stays", screenKey: "hotel-booking" as const },
  { key: "transport", label: "Transport", hindi: "परिवहन", icon: "Bus", desc: "Buses, taxis & shared rides", meta: "Book now", screenKey: "transport" as const },
  { key: "restaurant", label: "Restaurant", hindi: "भोजनालय", icon: "UtensilsCrossed", desc: "Pure veg dining options", meta: "50+ places", screenKey: "restaurant" as const },
  { key: "shyam-bus", label: "Shyam Bus", hindi: "श्याम बस", icon: "BusFront", desc: "Dedicated pilgrim buses", meta: "Daily", screenKey: "shyam-bus" as const },
  { key: "prashad", label: "Prashad", hindi: "प्रसाद", icon: "ShoppingBag", desc: "Order sacred prasad", meta: "Fresh daily", screenKey: "prashad" as const },
  { key: "donation", label: "Donation", hindi: "दान", icon: "HandCoins", desc: "Support the temple", meta: "Tax receipt", screenKey: "donation" as const },
  { key: "seva", label: "Seva Booking", hindi: "सेवा बुकिंग", icon: "Heart", desc: "Book special seva & puja", meta: "Book", screenKey: "seva-booking" as const },
  { key: "offerings", label: "Offerings", hindi: "भेंट", icon: "Gift", desc: "Flowers, coconut & more", meta: "Counter 2", screenKey: "offerings" as const },
  { key: "emergency", label: "Emergency Helpline", hindi: "आपातकालीन हेल्पलाइन", icon: "Siren", desc: "24/7 medical & police help", meta: "Dial 112", screenKey: "emergency" as const },
  { key: "parking", label: "Parking Info", hindi: "पार्किंग जानकारी", icon: "SquareParking", desc: "Find spot availability", meta: "Live", screenKey: "parking" as const },
  { key: "lost-found", label: "Lost and Found", hindi: "खोया और पाया", icon: "PackageSearch", desc: "Claim lost belongings", meta: "Desk", screenKey: "lost-found" as const },
  { key: "traffic", label: "Traffic Updates", hindi: "ट्रैफिक अपडेट", icon: "TrafficCone", desc: "Live highway status", meta: "Live", screenKey: "traffic" as const },
  { key: "notifications", label: "Announcements", hindi: "घोषणाएं", icon: "Bell", desc: "Temple notices & updates", meta: "Prayers", screenKey: "notifications" as const },
  { key: "reach", label: "Pilgrim Assistance", hindi: "भक्त सहायता", icon: "MapPin", desc: "Dham travel guidelines", meta: "Help desk", screenKey: "reach" as const },
]

export const drawerItems: { key: ScreenKey; label: string; hindi: string; icon: string }[] = [
  { key: "home", label: "Home", hindi: "होम", icon: "Home" },
  { key: "book", label: "Book Darshan", hindi: "दर्शन बुकिंग", icon: "CalendarCheck" },
  { key: "live-darshan", label: "Live Darshan", hindi: "लाइव दर्शन", icon: "Video" },
  { key: "virtual-darshan", label: "Virtual Darshan", hindi: "आभासी दर्शन", icon: "Compass" },
  { key: "khatu-path", label: "Shyam Path", hindi: "श्याम पथ", icon: "Footprints" },
  { key: "bookings", label: "My Bookings", hindi: "मेरी बुकिंग", icon: "Ticket" },
  { key: "qr", label: "QR Pass", hindi: "क्यूआर पास", icon: "QrCode" },
  { key: "services", label: "Services", hindi: "सेवाएं", icon: "LayoutGrid" },
  { key: "crowd", label: "Live Crowd Status", hindi: "भीड़ स्थिति", icon: "Users" },
  { key: "traffic", label: "Traffic Updates", hindi: "ट्रैफिक", icon: "TrafficCone" },
  { key: "reach", label: "How to Reach", hindi: "कैसे पहुंचें", icon: "MapPin" },
  { key: "lost-found", label: "Lost & Found", hindi: "खोया और पाया", icon: "PackageSearch" },
  { key: "offline", label: "Offline Centers", hindi: "ऑफलाइन केंद्र", icon: "Building2" },
  { key: "temple", label: "Temple Information", hindi: "मंदिर जानकारी", icon: "Landmark" },
  { key: "emergency", label: "Emergency Help", hindi: "आपातकालीन", icon: "Siren" },
  { key: "notifications", label: "Notifications", hindi: "सूचनाएं", icon: "Bell" },
  { key: "help-support", label: "Help & Support", hindi: "सहायता", icon: "CircleHelp" },
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
