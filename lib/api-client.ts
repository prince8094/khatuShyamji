import { supabase } from "./supabase"

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ""
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  }
}

export const apiClient = {
  async get(url: string) {
    const headers = await getHeaders()
    const response = await fetch(url, { headers })
    const res = await response.json()
    if (!response.ok) throw new Error(res.error || "Request failed")
    return res.data
  },

  async post(url: string, body: any) {
    const headers = await getHeaders()
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
    const res = await response.json()
    if (!response.ok) throw new Error(res.error || "Request failed")
    return res.data
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Devotee API Connectors
// ────────────────────────────────────────────────────────────────────────────
export const devoteeApi = {
  getDarshanSlots: () => apiClient.get("/api/darshan/slots"),
  bookDarshan: (payload: any) => apiClient.post("/api/darshan/bookings", payload),
  
  getHotels: () => apiClient.get("/api/hotels"),
  bookHotel: (payload: any) => apiClient.post("/api/hotels/bookings", payload),
  
  getTransportVehicles: () => apiClient.get("/api/transport/vehicles"),
  bookTransport: (payload: any) => apiClient.post("/api/transport/bookings", payload),
  
  getBusRoutes: () => apiClient.get("/api/bus/routes"),
  bookBus: (payload: any) => apiClient.post("/api/bus/bookings", payload),
  
  getRestaurants: () => apiClient.get("/api/restaurants"),
  bookRestaurant: (payload: any) => apiClient.post("/api/restaurants/bookings", payload),
  
  getPrashadItems: () => apiClient.get("/api/prashad/items"),
  orderPrashad: (payload: any) => apiClient.post("/api/prashad/orders", payload),
  
  getOfferingItems: () => apiClient.get("/api/offerings/items"),
  orderOfferings: (payload: any) => apiClient.post("/api/offerings/orders", payload),
  
  donate: (payload: any) => apiClient.post("/api/donations", payload),
  applyVolunteer: (payload: any) => apiClient.post("/api/seva/volunteers", payload),
  updateProfile: (payload: any) => apiClient.post("/api/devotee/update-profile", payload),
  
  getFoundItems: () => apiClient.get("/api/lost-found/found-items"),
  reportLostItem: (payload: any) => apiClient.post("/api/lost-found/lost-items", payload),
  
  triggerSOS: (payload: any) => apiClient.post("/api/emergency/sos", payload),
  getAnnouncements: () => apiClient.get("/api/announcements"),
  getTraffic: () => apiClient.get("/api/traffic"),
  getNotifications: () => apiClient.get("/api/notifications"),
  markNotificationRead: (payload: { notification_id: string }) => apiClient.post("/api/notifications/read", payload),
  getParkingBlocks: () => apiClient.get("/api/parking"),
  getTempleInfo: () => apiClient.get("/api/temple"),
}

// ────────────────────────────────────────────────────────────────────────────
// Admin API Connectors
// ────────────────────────────────────────────────────────────────────────────
export const adminApi = {
  getPilgrims: () => apiClient.get("/api/admin/pilgrims"),
  scanPilgrimQR: (payload: any) => apiClient.post("/api/admin/pilgrims/scan", payload),
  verifyPilgrimPass: (payload: { qr_data: string; gate_name: string }) => apiClient.post("/api/admin/pilgrims/verify-pass", payload),
  checkInPassengers: (payload: { booking_id: string; passenger_ids: string[]; gate_name: string }) => apiClient.post("/api/admin/pilgrims/check-in", payload),
  
  getVolunteers: () => apiClient.get("/api/admin/seva/volunteers"),
  actionVolunteer: (payload: any) => apiClient.post("/api/admin/seva/volunteers/action", payload),
  
  getApprovals: () => apiClient.get("/api/admin/approvals"),
  actionApproval: (payload: any) => apiClient.post("/api/admin/approvals/action", payload),
  
  getCommerceLedger: () => apiClient.get("/api/admin/commerce/ledger"),
  updateCommerceStatus: (payload: any) => apiClient.post("/api/admin/commerce/update-status", payload),
  
  getAccommodation: () => apiClient.get("/api/admin/accommodation"),
  checkoutStay: (payload: any) => apiClient.post("/api/admin/accommodation/checkout", payload),
  
  getParkingBlocks: () => apiClient.get("/api/admin/parking"),
  updateParkingOccupancy: (payload: any) => apiClient.post("/api/admin/parking/occupancy", payload),
  
  getTraffic: () => apiClient.get("/api/admin/traffic"),
  publishTrafficAlert: (payload: any) => apiClient.post("/api/admin/traffic/alerts", payload),
  resolveTrafficAlert: (payload: any) => apiClient.post("/api/admin/traffic/alerts/resolve", payload),
  
  getEmergencyRequests: () => apiClient.get("/api/admin/emergency"),
  updateEmergencyStatus: (payload: any) => apiClient.post("/api/admin/emergency/update", payload),
  getNotifications: () => apiClient.get("/api/admin/notifications"),
  broadcastNotification: (payload: any) => apiClient.post("/api/admin/notifications", payload),
  getAdminUsers: () => apiClient.get("/api/admin/admins"),
  createAdminUser: (payload: any) => apiClient.post("/api/admin/admins", payload),
  getDonations: () => apiClient.get("/api/admin/donations"),
  getAnalyticsSummary: () => apiClient.get("/api/admin/analytics/summary"),
  updateTempleInfo: (payload: any) => apiClient.post("/api/admin/temple", payload),
  getHotelRegistrations: () => apiClient.get("/api/admin/accommodation/registrations"),
  registerHotel: (payload: any) => apiClient.post("/api/admin/accommodation/register", payload),
  approveHotelRegistration: (payload: any) => apiClient.post("/api/admin/accommodation/approve-registration", payload),
  rejectHotelRegistration: (payload: any) => apiClient.post("/api/admin/accommodation/reject-registration", payload),
}
