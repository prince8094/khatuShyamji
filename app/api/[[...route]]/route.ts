import { NextRequest } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { apiResponse, apiError, verifyAuth, verifyAdmin } from "@/lib/api-middleware"
import crypto from "crypto"
import { withSupabase } from "@supabase/server"

export function signBookingNumber(bookingNumber: string): string {
  const secret = process.env.SUPABASE_JWT_SECRET || "secure-khatu-shyam-pepper"
  return crypto.createHmac("sha256", secret).update(bookingNumber).digest("hex")
}

export async function createNotification(payload: {
  profile_id?: string | null
  title_en: string
  title_hi: string
  body_en: string
  body_hi: string
  type: string
  icon?: string
  tone?: string
}) {
  try {
    await supabaseAdmin.from("notifications").insert({
      profile_id: payload.profile_id || null,
      title_en: payload.title_en,
      title_hi: payload.title_hi,
      body_en: payload.body_en,
      body_hi: payload.body_hi,
      type: payload.type,
      icon: payload.icon || "Bell",
      tone: payload.tone || "success"
    })
  } catch (err) {
    console.error("Failed to insert notification trigger", err)
  }
}

export async function createAuditLog(payload: {
  admin_id?: string | null
  action: string
  department: string
  actor_name: string
  old_values?: any
  new_values?: any
}) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: payload.admin_id || null,
      action: payload.action,
      department: payload.department,
      actor_name: payload.actor_name,
      old_values: payload.old_values || null,
      new_values: payload.new_values || null
    })
  } catch (err) {
    console.error("Failed to insert audit log", err)
  }
}

export const GET = withSupabase<any>({ auth: ["user", "none"] }, async (req, ctx) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\//, "")
  const supabase = path.startsWith("admin/") ? ctx.supabaseAdmin : ctx.supabase

  try {
    // ────────────────────────────────────────────────────────────────────────
    // 1. Devotee / Public GET Routes
    // ────────────────────────────────────────────────────────────────────────

    if (path === "darshan/slots") {
      // Returns stats to calculate Darshan booking limits
      const { data, error } = await supabase
        .from("darshan_bookings")
        .select("booking_date, visitor_count")
        .eq("status", "upcoming")
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "hotels") {
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .eq("is_active", true)
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "devotee/reach") {
      const [dest, options, routes, instrs] = await Promise.all([
        supabase.from("temple_destinations").select("*").maybeSingle(),
        supabase.from("travel_options").select("*").eq("is_active", true).order("display_order", { ascending: true }),
        supabase.from("route_information").select("*").eq("is_active", true),
        supabase.from("transport_instructions").select("*").eq("is_active", true)
      ])
      if (dest.error) throw dest.error
      if (options.error) throw options.error
      if (routes.error) throw routes.error
      if (instrs.error) throw instrs.error
      return apiResponse({
        destination: dest.data,
        travel_options: options.data,
        routes: routes.data,
        instructions: instrs.data
      })
    }

    if (path === "devotee/aarti") {
      const { data, error } = await supabase
        .from("aarti_timings")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true })
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "devotee/guidelines") {
      const { data, error } = await supabase
        .from("devotee_guidelines")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true })
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "devotee/booking-centers") {
      const { data, error } = await supabase
        .from("offline_booking_centers")
        .select("*")
        .eq("status", "active")
        .order("name", { ascending: true })
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "transport/vehicles") {
      const { data, error } = await supabase
        .from("transport_vehicles")
        .select("*")
        .eq("is_active", true)
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "bus/routes") {
      const { data, error } = await supabase
        .from("bus_routes")
        .select("*")
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "restaurants") {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "prashad/items") {
      const { data, error } = await supabase
        .from("prashad_items")
        .select("*")
        .eq("is_active", true)
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "offerings/items") {
      const { data, error } = await supabase
        .from("offering_items")
        .select("*")
        .eq("is_active", true)
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "lost-found/found-items") {
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - 30)
      const dateLimitStr = dateLimit.toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("found_items")
        .select("*")
        .gte("date_found", dateLimitStr)
        .order("date_found", { ascending: false })
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "traffic") {
      const [routes, alerts] = await Promise.all([
        supabase.from("traffic_routes").select("*"),
        supabase.from("traffic_alerts").select("*").eq("is_active", true)
      ])
      if (routes.error) throw routes.error
      if (alerts.error) throw alerts.error
      return apiResponse({ routes: routes.data, alerts: alerts.data })
    }

    if (path === "notifications") {
      const authCtx = await verifyAuth(req)
      if (!authCtx) return apiError("Unauthorized: Devotee authentication required", 401)

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`profile_id.eq.${authCtx.user.id},profile_id.is.null`)
        .order("created_at", { ascending: false })

      if (error) throw error
      return apiResponse(data)
    }

    if (path === "seva/volunteers") {
      const authCtx = await verifyAuth(req)
      if (!authCtx) return apiError("Unauthorized: Devotee authentication required", 401)

      const { data, error } = await supabase
        .from("volunteer_applications")
        .select("*")
        .eq("profile_id", authCtx.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return apiResponse(data)
    }

    if (path === "lost-found/my-reports") {
      const authCtx = await verifyAuth(req)
      if (!authCtx) return apiError("Unauthorized: Devotee authentication required", 401)

      const { data, error } = await supabase
        .from("lost_items")
        .select("*")
        .eq("profile_id", authCtx.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return apiResponse(data)
    }

    if (path === "lost-found/claims") {
      const authCtx = await verifyAuth(req)
      if (!authCtx) return apiError("Unauthorized: Devotee authentication required", 401)

      const { data, error } = await supabase
        .from("claim_requests")
        .select("*, found_items(*)")
        .eq("profile_id", authCtx.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return apiResponse(data)
    }

    if (path === "devotee/bookings") {
      const authCtx = await verifyAuth(req)
      if (!authCtx) return apiError("Unauthorized: Devotee authentication required", 401)

      const { data, error } = await supabaseAdmin
        .from("darshan_bookings")
        .select("*")
        .eq("profile_id", authCtx.user.id)
        .order("booking_date", { ascending: false })

      if (error) throw error

      const formatted = (data || []).map((b: any) => ({
        id: b.booking_number,
        name: b.group_name || "Solo Devotee",
        date: new Date(b.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        visitors: b.visitor_count,
        status: b.status,
        qrToken: `${b.booking_number}:${signBookingNumber(b.booking_number)}`
      }))

      return apiResponse(formatted)
    }

    if (path === "announcements") {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          announcement_translations (
            language_code,
            title,
            description
          )
        `)
        .eq("status", "published")
        .order("publish_at", { ascending: false })
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "parking") {
      const { data, error } = await supabase
        .from("parking_blocks")
        .select("*")
        .eq("is_active", true)
      if (error) throw error
      return apiResponse(data)
    }

    if (path === "temple") {
      let { data, error } = await supabase
        .from("temple_information")
        .select("*")
      if (error) throw error

      if (!data || data.length === 0) {
        const defaultRecords = [
          {
            section_key: "live_telemetry",
            title: "Live Operational Telemetry",
            content: {
              crowd_level: "Moderate",
              crowd_count: 6420,
              wait_time_minutes: 35,
              darshan_status: "Open",
              is_emergency_mode: false,
              is_darshan_closed: false,
              is_global_alarm: false
            },
            last_updated_by_admin_id: "00000000-0000-0000-0000-000000000001"
          },
          {
            section_key: "darshan_timings",
            title: "Darshan Timings",
            content: [
              { name: "Mangla Aarti", time: "4:30 AM" },
              { name: "Shringaar", time: "7:00 AM" },
              { name: "Bhog Aarti", time: "12:30 PM" },
              { name: "Sandhya Aarti", time: "7:30 PM" }
            ],
            last_updated_by_admin_id: "00000000-0000-0000-0000-000000000001"
          },
          {
            section_key: "temple_guidelines",
            title: "Temple Guidelines",
            content: [
              "No photography inside the sanctum.",
              "Mobile phones must be kept on silent.",
              "Dress modestly and maintain decorum."
            ],
            last_updated_by_admin_id: "00000000-0000-0000-0000-000000000001"
          },
          {
            section_key: "volunteer_opportunities",
            title: "Volunteer Opportunities",
            content: [
              {
                id: "crowd",
                role: "Crowd Management Volunteer",
                roleHi: "भीड़ प्रबंधन स्वयंसेवक",
                icon: "Users",
                desc: "Assist in managing crowd flow in halls, ensuring orderly movement during peak darshan hours.",
                descHi: "हॉल में भीड़ प्रवाह को प्रबंधित करने में सहायता करें, पीक दर्शन घंटों के दौरान सुचारू आवाजाही सुनिश्चित करें।",
                duration: "4 Hours",
                durationHi: "4 घंटे",
                status: "Open"
              },
              {
                id: "devotee-assist",
                role: "Devotee Assistance Volunteer",
                roleHi: "भक्त सहायता स्वयंसेवक",
                icon: "HeartHandshake",
                desc: "Help elderly pilgrims, physically challenged devotees, and families navigate the temple premises.",
                descHi: "बुजुर्ग तीर्थयात्रियों, शारीरिक रूप से अक्षम भक्तों और परिवारों को मंदिर परिसर में सहायता करें।",
                duration: "6 Hours",
                durationHi: "6 घंटे",
                status: "Open"
              },
              {
                id: "prasad",
                role: "Prasad Distribution Volunteer",
                roleHi: "प्रसाद वितरण स्वयंसेवक",
                icon: "ShoppingBag",
                desc: "Contribute to the packing and systematic distribution of sacred Prasad to devotees at counters.",
                descHi: "काउंटरों पर भक्तों को पवित्र प्रसाद की पैकिंग और व्यवस्थित वितरण में योगदान दें।",
                duration: "4 Hours",
                durationHi: "4 घंटे",
                status: "Open"
              }
            ],
            last_updated_by_admin_id: "00000000-0000-0000-0000-000000000001"
          }
        ]

        const insertRes = await ctx.supabaseAdmin
          .from("temple_information")
          .insert(defaultRecords)
          .select()

        if (insertRes.error) {
          console.error("Self-healing temple info bootstrap failed:", insertRes.error)
        } else {
          data = insertRes.data
        }
      }

      return apiResponse(data)
    }

    // ────────────────────────────────────────────────────────────────────────
    // 2. Admin GET Routes (Requires Admin Verification)
    // ────────────────────────────────────────────────────────────────────────

    if (path.startsWith("admin/")) {
      const adminCtx = await verifyAdmin(req)
      if (!adminCtx) {
        return apiError("Unauthorized: Admin access required", 403)
      }

      if (path === "admin/pilgrims") {
        const [profiles, bookings, members, scans] = await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("darshan_bookings").select("*, profiles(*)").order("created_at", { ascending: false }),
          supabase.from("darshan_booking_members").select("*"),
          supabase.from("qr_scans").select("*, darshan_bookings(booking_number, visitor_count)").order("scanned_at", { ascending: false }).limit(20)
        ])

        if (profiles.error) throw profiles.error
        if (bookings.error) throw bookings.error
        if (members.error) throw members.error
        if (scans.error) throw scans.error

        return apiResponse({
          profiles: profiles.data,
          bookings: bookings.data,
          members: members.data,
          scans: scans.data
        })
      }

      if (path === "admin/seva/volunteers") {
        const { data, error } = await supabase
          .from("volunteer_applications")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/audit-logs") {
        const { data, error } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/approvals") {
        const { data, error } = await supabase
          .from("approval_queue")
          .select("*")
          .order("submitted_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/notifications") {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/admins") {
        const { data, error } = await supabase
          .from("admins")
          .select(`
            *,
            admin_roles_bridge (
              role_key
            )
          `)
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/commerce/ledger") {
        // Fetch all ledgers to feed commerce dashboard
        const [cabs, buses, dining, prasad, offerings] = await Promise.all([
          supabase.from("transport_bookings").select("*, transport_vehicles(name)").order("created_at", { ascending: false }),
          supabase.from("bus_bookings").select("*, bus_routes(from_city, to_city, departure_time)").order("created_at", { ascending: false }),
          supabase.from("restaurant_reservations").select("*, restaurants(name)").order("created_at", { ascending: false }),
          supabase.from("prashad_orders").select("*, prashad_order_items(*, prashad_items(*))").order("created_at", { ascending: false }),
          supabase.from("offering_orders").select("*, offering_order_items(*, offering_items(*))").order("created_at", { ascending: false }),
        ])

        if (cabs.error) throw cabs.error
        if (buses.error) throw buses.error
        if (dining.error) throw dining.error
        if (prasad.error) throw prasad.error
        if (offerings.error) throw offerings.error

        const mappedDining = dining.data?.map((item: any) => ({
          ...item,
          reservation_date: item.check_in_date
        }))

        return apiResponse({
          cabs: cabs.data,
          buses: buses.data,
          dining: mappedDining,
          prasad: prasad.data,
          offerings: offerings.data
        })
      }

      if (path === "admin/accommodation") {
        const { data, error } = await supabase
          .from("hotel_bookings")
          .select("*, hotels(name)")
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/accommodation/registrations") {
        const { data, error } = await supabase
          .from("hotel_registrations")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          if (error.code === "42P01") {
            // Fallback: hotel_registrations table not created yet, use approval_queue
            const queueRes = await supabase
              .from("approval_queue")
              .select("*")
              .eq("type", "hotel-update")
              .order("submitted_at", { ascending: false })
            if (queueRes.error) throw queueRes.error
            const formatted = (queueRes.data || []).map((q: any) => ({
              id: q.id,
              hotel_code: q.draft_payload?.hotel_code,
              name: q.draft_payload?.name,
              stars: q.draft_payload?.stars,
              total_rooms: q.draft_payload?.total_rooms,
              price_range: q.draft_payload?.price_range,
              assigned_admin_id: q.submitted_by_admin_id,
              status: q.status,
              rating: q.draft_payload?.rating,
              address: q.draft_payload?.address,
              contact_phone: q.draft_payload?.contact_phone,
              manager_name: q.draft_payload?.manager_name,
              maps_link: q.draft_payload?.maps_link,
              photo_url: q.draft_payload?.photo_url,
              type: q.draft_payload?.type,
              created_at: q.submitted_at
            }))
            return apiResponse(formatted)
          }
          throw error
        }
        return apiResponse(data || [])
      }

      if (path === "admin/parking") {
        const { data, error } = await supabase
          .from("parking_blocks")
          .select("*")
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/traffic") {
        const [routes, alerts] = await Promise.all([
          supabase.from("traffic_routes").select("*"),
          supabase.from("traffic_alerts").select("*").eq("is_active", true)
        ])
        if (routes.error) throw routes.error
        if (alerts.error) throw alerts.error
        return apiResponse({ routes: routes.data, alerts: alerts.data })
      }

      if (path === "admin/emergency") {
        const { data, error } = await supabase
          .from("emergency_requests")
          .select("*, profiles(name, phone)")
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/donations") {
        const { data, error } = await supabase
          .from("donations")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/lost-found/claims") {
        const { data, error } = await supabase
          .from("claim_requests")
          .select("*, found_items(*), profiles(name, phone)")
          .order("created_at", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/reach") {
        const [dest, options, routes, instrs] = await Promise.all([
          supabase.from("temple_destinations").select("*").maybeSingle(),
          supabase.from("travel_options").select("*").order("display_order", { ascending: true }),
          supabase.from("route_information").select("*").order("title", { ascending: true }),
          supabase.from("transport_instructions").select("*").order("title", { ascending: true })
        ])
        if (dest.error) throw dest.error
        if (options.error) throw options.error
        if (routes.error) throw routes.error
        if (instrs.error) throw instrs.error
        return apiResponse({
          destination: dest.data,
          travel_options: options.data,
          routes: routes.data,
          instructions: instrs.data
        })
      }

      if (path === "admin/aarti") {
        const { data, error } = await supabase
          .from("aarti_timings")
          .select("*")
          .order("display_order", { ascending: true })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/guidelines") {
        const { data, error } = await supabase
          .from("devotee_guidelines")
          .select("*")
          .order("display_order", { ascending: true })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/booking-centers") {
        const { data, error } = await supabase
          .from("offline_booking_centers")
          .select("*")
          .order("name", { ascending: true })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/cms-history") {
        const { data, error } = await supabase
          .from("temple_cms_history")
          .select("*")
          .order("updated_time", { ascending: false })
        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/analytics/summary") {
        const todayStr = new Date().toISOString().split("T")[0]

        const [
          profilesCount,
          todayBookings,
          parkingSum,
          volunteersCount,
          hotelBookingsCount,
          emergencyCount,
          telemetryInfo,
          hotelsCount,
          pendingHotelsCount
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("darshan_bookings").select("visitor_count").eq("booking_date", todayStr),
          supabase.from("parking_blocks").select("total_capacity, occupied"),
          supabase.from("volunteer_applications").select("id", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("hotel_bookings").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("emergency_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("temple_information").select("*").eq("section_key", "live_telemetry").maybeSingle(),
          supabase.from("hotels").select("id", { count: "exact", head: true }),
          supabase.from("approval_queue").select("id", { count: "exact", head: true }).eq("type", "hotel-update").eq("status", "pending")
        ])

        const totalProfiles = profilesCount.count || 0
        const todayCount = todayBookings.data
          ? todayBookings.data.reduce((sum: number, b: any) => sum + Number(b.visitor_count || 1), 0)
          : 0

        let totalParkingCap = 0
        let occupiedParking = 0
        if (parkingSum.data) {
          parkingSum.data.forEach((p: any) => {
            totalParkingCap += Number(p.total_capacity || 0)
            occupiedParking += Number(p.occupied || 0)
          })
        }

        const activeVolunteers = volunteersCount.count || 0
        const activeStays = hotelBookingsCount.count || 0
        const pendingEmergencies = emergencyCount.count || 0
        const approvedHotels = hotelsCount.count || 0
        const pendingHotels = pendingHotelsCount.count || 0

        const telemetry = telemetryInfo.data?.content || {
          crowd_level: "Moderate",
          crowd_count: 6420,
          wait_time_minutes: 35,
          darshan_status: "Open",
          is_emergency_mode: false,
          is_darshan_closed: false,
          is_global_alarm: false
        }

        return apiResponse({
          total_profiles: totalProfiles,
          today_devotees: todayCount,
          parking: {
            total: totalParkingCap,
            occupied: occupiedParking,
            free: Math.max(0, totalParkingCap - occupiedParking)
          },
          active_volunteers: activeVolunteers,
          active_stays: activeStays,
          pending_emergencies: pendingEmergencies,
          approved_hotels: approvedHotels,
          pending_hotels: pendingHotels,
          telemetry
        })
      }
    }

    return apiError(`Route GET /api/${path} not found`, 404)
  } catch (err: any) {
    console.error(`Error in GET /api/${path}:`, err)
    return apiError(err.message || "Internal Server Error", 500)
  }
})

export const POST = withSupabase<any>({ auth: ["user", "none"] }, async (req, ctx) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\//, "")
  const supabase = path.startsWith("admin/") ? ctx.supabaseAdmin : ctx.supabase

  try {
    const body = await req.json().catch(() => ({}))

    // ────────────────────────────────────────────────────────────────────────
    // 1. Devotee POST Routes (Requires Devotee Auth)
    // ────────────────────────────────────────────────────────────────────────

    if (!path.startsWith("admin/")) {
      if (path === "devotee/auth-init") {
        const { phone, signup, name, city } = body
        if (!phone) {
          return apiError("Missing phone number", 400)
        }

        const cleanPhone = phone.replace(/\s+/g, "")
        const phoneDigits = cleanPhone.replace("+91", "").replace(" ", "")
        const unspacedPhone = `+91${phoneDigits}`
        const email = `${phoneDigits}@devotee.com`

        // Check if user profile exists in database
        const { data: existingProfile, error: profileErr } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .like("phone", `%${phoneDigits}`)
          .maybeSingle()

        if (profileErr) throw profileErr

        if (signup && existingProfile) {
          return apiError("A profile with this phone number already exists. Please log in.", 400)
        }

        if (!signup && !existingProfile) {
          return apiError("Profile not found. Please sign up first.", 404)
        }

        // Development Mode devotee bypass for any phone number
        if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
          let existingUser = null
          if (!listError && listData?.users) {
            existingUser = listData.users.find((u: any) => u.email === email || u.phone === unspacedPhone || u.phone === phoneDigits)
          }

          if (!existingUser) {
            const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
              email: email,
              phone: unspacedPhone,
              password: "devotee_dev_bypass_123",
              email_confirm: true,
              phone_confirm: true,
              user_metadata: {
                name: name || "Pilgrim",
                city: city || ""
              }
            })
            if (signUpError) {
              console.error("Failed to create dev user in auth.users:", signUpError.message, signUpError)
              return apiError(signUpError.message, 400)
            }
            existingUser = signUpData.user
          } else {
            // Ensure password matches dev bypass value
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              password: "devotee_dev_bypass_123",
              email_confirm: true,
              phone_confirm: true
            })
          }

          if (!existingProfile && existingUser) {
            const { error: insErr } = await supabaseAdmin.from("profiles").insert({
              id: existingUser.id,
              name: name || "Pilgrim",
              phone: unspacedPhone,
              city: city || ""
            }).select().maybeSingle()
            if (insErr && insErr.code !== "23505") {
              console.error("Failed to create dev profile:", insErr.message)
            }
          }

          return apiResponse({ success: true, devMode: true })
        }

        if (signup && existingProfile) {
          return apiError("A profile with this phone number already exists. Please log in.", 400)
        }

        if (!signup && !existingProfile) {
          return apiError("Profile not found. Please sign up first.", 404)
        }

        return apiResponse({ success: true })
      }

      const authCtx = await verifyAuth(req)
      if (!authCtx) {
        return apiError("Unauthorized: Devotee login required", 401)
      }

      if (path === "devotee/update-profile") {
        const { name, email, address, dob, gender, photo_url } = body
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .update({
            name,
            email,
            address,
            dob: dob || null,
            gender: gender || null,
            photo_url: photo_url || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", authCtx.user.id)
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "devotee/accommodation/register") {
        const { name, stars, total_rooms, price_range, address, contact_phone, manager_name, maps_link, type } = body
        const hotel_code = `HTL-${Math.floor(100 + Math.random() * 900)}`

        const { data, error } = await supabase
          .from("hotel_registrations")
          .insert({
            hotel_code,
            name,
            stars: Number(stars) || 3,
            total_rooms: Number(total_rooms) || 20,
            price_range,
            assigned_admin_id: "00000000-0000-0000-0000-000000000001",
            status: "pending",
            rating: 4.0,
            address,
            contact_phone,
            manager_name,
            maps_link,
            photo_url: "/images/hotel-room-1.jpg",
            type
          })
          .select()
          .single()

        if (error) {
          if (error.code === "42P01") {
            const queueRes = await supabase
              .from("approval_queue")
              .insert({
                type: "hotel-update",
                title: `Register stay: ${name}`,
                submitted_by_admin_id: "00000000-0000-0000-0000-000000000001",
                status: "pending",
                department: "accommodation",
                description: `Listing request for new ${type} stay ${name}. Price range: ${price_range}, stars: ${stars}`,
                draft_payload: {
                  hotel_code,
                  name,
                  stars: Number(stars) || 3,
                  total_rooms: Number(total_rooms) || 20,
                  price_range,
                  assigned_admin_id: "00000000-0000-0000-0000-000000000001",
                  status: "active",
                  rating: 4.0,
                  address,
                  contact_phone,
                  manager_name,
                  maps_link,
                  photo_url: "/images/hotel-room-1.jpg",
                  type
                }
              })
              .select()
              .single()
            if (queueRes.error) throw queueRes.error
            return apiResponse(queueRes.data)
          }
          throw error
        }
        return apiResponse(data)
      }

      if (path === "notifications/read") {
        const { notification_id } = body
        if (!notification_id) {
          return apiError("Missing notification identifier", 400)
        }

        const { data, error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notification_id)
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "darshan/bookings") {
        const { booking_type, booking_date, day_name, visitor_count, group_name, members } = body
        if (!booking_type || !booking_date || !visitor_count || !members || !Array.isArray(members)) {
          return apiError("Missing required Darshan fields", 400)
        }

        const booking_number = "BK-" + Math.floor(100000 + Math.random() * 900000)

        // Insert booking
        const { data: booking, error: bError } = await supabase
          .from("darshan_bookings")
          .insert({
            booking_number,
            profile_id: authCtx.user.id,
            booking_type,
            booking_date,
            day_name,
            visitor_count,
            group_name,
            status: "upcoming"
          })
          .select()
          .single()

        if (bError) throw bError

        // Insert member list
        const memberPayloads = members.map((m: any, idx: number) => ({
          booking_id: booking.id,
          name: m.name,
          age: parseInt(m.age),
          gender: m.gender,
          relationship: m.relationship || null,
          identity_proof_type: m.identity_proof_type || null,
          identity_proof_number: m.identity_proof_number || null,
          nationality: m.nationality || "India",
          is_child: !!m.is_child,
          passenger_id: `PX-${booking_number.replace("BK-", "")}-${idx + 1}`,
          checked_in: false
        }))

        const { error: mError } = await supabase
          .from("darshan_booking_members")
          .insert(memberPayloads)

        if (mError) throw mError

        await createNotification({
          profile_id: authCtx.user.id,
          title_en: "Darshan Booking Confirmed",
          title_hi: "दर्शन बुकिंग की पुष्टि की गई",
          body_en: `Your Darshan slot on ${booking_date} has been confirmed. Pass Code: ${booking_number}`,
          body_hi: `आपका दर्शन स्लॉट ${booking_date} को कन्फर्म हो गया है। पास कोड: ${booking_number}`,
          type: "booking",
          icon: "CalendarCheck",
          tone: "success"
        })

        const qr_token = `${booking_number}:${signBookingNumber(booking_number)}`
        return apiResponse({ ...booking, qr_token })
      }

      if (path === "devotee/bookings/cancel") {
        const { booking_number } = body
        if (!booking_number) return apiError("Missing booking number", 400)

        const { data, error } = await supabaseAdmin
          .from("darshan_bookings")
          .update({ status: "cancelled" })
          .eq("booking_number", booking_number)
          .eq("profile_id", authCtx.user.id)
          .select()
          .single()

        if (error) throw error

        await createNotification({
          profile_id: authCtx.user.id,
          title_en: "Darshan Booking Cancelled",
          title_hi: "दर्शन बुकिंग रद्द कर दी गई",
          body_en: `Your Darshan slot reservation ${booking_number} has been cancelled successfully.`,
          body_hi: `आपका दर्शन स्लॉट आरक्षण ${booking_number} सफलतापूर्वक रद्द कर दिया गया है।`,
          type: "booking",
          icon: "CalendarX",
          tone: "danger"
        })

        return apiResponse(data)
      }

      if (path === "hotels/bookings") {
        const { hotel_id, guest_name, guest_phone, check_in_date, check_out_date, nights_count, guests_count, rooms_count } = body
        if (!hotel_id || !guest_name || !guest_phone || !check_in_date || !check_out_date) {
          return apiError("Missing required hotel booking fields", 400)
        }

        const { data, error } = await supabase
          .from("hotel_bookings")
          .insert({
            profile_id: authCtx.user.id,
            hotel_id,
            guest_name,
            guest_phone,
            check_in_date,
            check_out_date,
            nights_count: parseInt(nights_count) || 1,
            guests_count: parseInt(guests_count),
            rooms_count: parseInt(rooms_count),
            status: "upcoming"
          })
          .select()
          .single()

        if (error) throw error

        await createNotification({
          profile_id: authCtx.user.id,
          title_en: "Hotel Reservation Confirmed",
          title_hi: "होटल बुकिंग की पुष्टि की गई",
          body_en: `Your stay at guest house has been confirmed for check-in on ${check_in_date}.`,
          body_hi: `गैस्ट हाउस में आपके ठहरने की बुकिंग ${check_in_date} को चेक-इन के लिए कन्फर्म कर दी गई है।`,
          type: "booking",
          icon: "Hotel",
          tone: "success"
        })

        return apiResponse(data)
      }

      if (path === "transport/bookings") {
        const { vehicle_id, devotee_name, contact_phone, pickup_point, custom_pickup_address, pickup_date, pickup_time } = body
        if (!vehicle_id || !devotee_name || !contact_phone || !pickup_point || !pickup_date || !pickup_time) {
          return apiError("Missing transport booking fields", 400)
        }

        const { data, error } = await supabase
          .from("transport_bookings")
          .insert({
            profile_id: authCtx.user.id,
            vehicle_id,
            devotee_name,
            contact_phone,
            pickup_point,
            custom_pickup_address,
            pickup_date,
            pickup_time,
            status: "confirmed"
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "bus/bookings") {
        const { bus_route_id, devotee_name, contact_phone, travel_date, seat_count } = body
        if (!bus_route_id || !devotee_name || !contact_phone || !travel_date || !seat_count) {
          return apiError("Missing bus reservation fields", 400)
        }

        const { data, error } = await supabase
          .from("bus_bookings")
          .insert({
            profile_id: authCtx.user.id,
            bus_route_id,
            devotee_name,
            contact_phone,
            travel_date,
            seat_count: parseInt(seat_count),
            status: "confirmed"
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "restaurants/bookings") {
        const { restaurant_id, guest_name, guest_phone, reservation_date, reservation_time, people_count } = body
        if (!restaurant_id || !guest_name || !guest_phone || !reservation_date || !reservation_time || !people_count) {
          return apiError("Missing table booking fields", 400)
        }

        const { data, error } = await supabase
          .from("restaurant_reservations")
          .insert({
            profile_id: authCtx.user.id,
            restaurant_id,
            guest_name,
            guest_phone,
            check_in_date: reservation_date,
            check_out_date: null,
            reservation_time,
            people_count: parseInt(people_count),
            status: "confirmed"
          })
          .select()
          .single()

        if (error) throw error

        const mappedData = data ? {
          ...data,
          reservation_date: data.check_in_date
        } : null

        return apiResponse(mappedData)
      }

      if (path === "prashad/orders") {
        const { total_amount, recipient_name, recipient_phone, delivery_type, shipping_address, postal_code, items } = body
        if (!total_amount || !recipient_name || !recipient_phone || !items || !Array.isArray(items)) {
          return apiError("Missing prasad order details", 400)
        }

        const { data: order, error: oError } = await supabase
          .from("prashad_orders")
          .insert({
            profile_id: authCtx.user.id,
            total_amount,
            delivery_type,
            recipient_name,
            recipient_phone,
            shipping_address,
            postal_code,
            status: "pending"
          })
          .select()
          .single()

        if (oError) throw oError

        const itemPayloads = items.map((it: any) => ({
          order_id: order.id,
          prashad_id: it.prashad_id,
          quantity: it.quantity
        }))

        const { error: itemsError } = await supabase
          .from("prashad_order_items")
          .insert(itemPayloads)

        if (itemsError) throw itemsError

        return apiResponse(order)
      }

      if (path === "offerings/orders") {
        const { total_amount, items } = body
        if (!total_amount || !items || !Array.isArray(items)) {
          return apiError("Missing offerings order details", 400)
        }

        const { data: order, error: oError } = await supabase
          .from("offering_orders")
          .insert({
            profile_id: authCtx.user.id,
            total_amount,
            status: "pending"
          })
          .select()
          .single()

        if (oError) throw oError

        const itemPayloads = items.map((it: any) => ({
          order_id: order.id,
          offering_id: it.offering_id,
          quantity: it.quantity
        }))

        const { error: itemsError } = await supabase
          .from("offering_order_items")
          .insert(itemPayloads)

        if (itemsError) throw itemsError

        return apiResponse(order)
      }

      if (path === "donations") {
        const { donor_name, email, phone, pan_number, amount, purpose, payment_mode } = body
        if (!donor_name || !email || !phone || !amount || !purpose) {
          return apiError("Missing donation details", 400)
        }

        const donation_number = "DN-" + Math.floor(100000 + Math.random() * 900000)

        const { data, error } = await supabase
          .from("donations")
          .insert({
            donation_number,
            profile_id: authCtx.user.id,
            donor_name,
            email,
            phone,
            pan_number,
            amount: parseInt(amount),
            purpose,
            payment_mode: payment_mode || "UPI",
            receipt_generated: true
          })
          .select()
          .single()

        if (error) throw error

        await createNotification({
          profile_id: authCtx.user.id,
          title_en: "Donation/Payment Confirmed",
          title_hi: "दान/भुगतान की पुष्टि की गई",
          body_en: `Thank you for your donation of INR ${amount}. Receipt DN: ${donation_number}`,
          body_hi: `INR ${amount} के आपके दान के लिए धन्यवाद। रसीद संख्या DN: ${donation_number}`,
          type: "payment",
          icon: "Coins",
          tone: "success"
        })

        await createAuditLog({
          action: `Donation of INR ${amount} made by ${donor_name} (Receipt: ${donation_number})`,
          department: "Accounts / Donation",
          actor_name: donor_name
        })

        return apiResponse(data)
      }

      if (path === "seva/volunteers") {
        const { full_name, email, mobile, age, gender, city, preferred_role, preferred_date, preferred_time_slot, experience, reason, emergency_contact } = body
        if (!full_name || !email || !mobile || !preferred_role || !preferred_date || !preferred_time_slot || !reason) {
          return apiError("Missing volunteer application details", 400)
        }

        const { data, error } = await supabase
          .from("volunteer_applications")
          .insert({
            profile_id: authCtx.user.id,
            full_name,
            email,
            mobile,
            age: parseInt(age) || 18,
            gender: gender || "Male",
            city: city || "",
            preferred_role,
            preferred_date,
            preferred_time_slot,
            experience,
            reason,
            emergency_contact,
            status: "pending"
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "lost-found/lost-items") {
        const { item_name, color_description, location_lost, date_lost, contact_phone, additional_details, image_url } = body
        if (!item_name || !color_description || !location_lost || !date_lost || !contact_phone) {
          return apiError("Missing lost report details", 400)
        }

        const case_number = "LF-" + Math.floor(100000 + Math.random() * 900000)
        const initialDetails = JSON.stringify({
          user_notes: additional_details || "",
          history: [
            {
              status: "Reported",
              timestamp: new Date().toISOString(),
              notes: "Item registered by user."
            }
          ]
        })

        const { data, error } = await supabase
          .from("lost_items")
          .insert({
            case_number,
            profile_id: authCtx.user.id,
            item_name,
            color_description,
            location_lost,
            date_lost,
            contact_phone,
            additional_details: initialDetails,
            image_url,
            status: "registered"
          })
          .select()
          .single()

        if (error) throw error

        await createNotification({
          profile_id: authCtx.user.id,
          title_en: "Lost Item Report Submitted",
          title_hi: "खोई हुई वस्तु की रिपोर्ट जमा की गई",
          body_en: `Your lost report for "${item_name}" has been registered. Case Number: ${case_number}`,
          body_hi: `आपके "${item_name}" के लिए खोई हुई रिपोर्ट दर्ज कर ली गई है। केस नंबर: ${case_number}`,
          type: "lost-found",
          icon: "PackageSearch",
          tone: "info"
        })

        await createAuditLog({
          action: `Devotee reported lost item: "${item_name}" (Case: ${case_number})`,
          department: "Security / Lost & Found",
          actor_name: authCtx.user.name || "Devotee"
        })

        return apiResponse(data)
      }

      if (path === "lost-found/claim") {
        const { found_item_id, claimant_name, identity_proof_type, identity_proof_number, claim_description } = body
        if (!found_item_id || !claimant_name || !identity_proof_type || !identity_proof_number || !claim_description) {
          return apiError("Missing claim request parameters", 400)
        }

        const { data: claim, error } = await supabase
          .from("claim_requests")
          .insert({
            found_item_id,
            profile_id: authCtx.user.id,
            claimant_name,
            identity_proof_type,
            identity_proof_number,
            claim_description,
            status: "pending"
          })
          .select()
          .single()

        if (error) throw error

        await supabase
          .from("found_items")
          .update({ status: "Claim Requested" })
          .eq("id", found_item_id)

        await createAuditLog({
          action: `Devotee ${claimant_name} submitted claim for found item #${found_item_id}`,
          department: "Security / Lost & Found",
          actor_name: claimant_name
        })

        return apiResponse(claim)
      }

      if (path === "emergency/sos") {
        const { incident_type, location_latitude, location_longitude, location_text } = body
        if (!incident_type || !location_latitude || !location_longitude) {
          return apiError("Missing SOS geolocation payload details", 400)
        }

        const { data, error } = await supabase
          .from("emergency_requests")
          .insert({
            profile_id: authCtx.user.id,
            incident_type,
            location_latitude,
            location_longitude,
            location_text,
            status: "pending"
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }
    }

    // ────────────────────────────────────────────────────────────────────────
    // 2. Admin POST Routes (Requires Admin Verification)
    // ────────────────────────────────────────────────────────────────────────

    if (path === "admin/auth-init") {
      const { admin_code, password } = body
      if (!admin_code) {
        return apiError("Missing admin code", 400)
      }

      const { data: adminRecord, error: dbError } = await supabaseAdmin
        .from("admins")
        .select(`
          *,
          admin_roles_bridge (
            role_key
          )
        `)
        .eq("admin_code", admin_code)
        .eq("is_active", true)
        .maybeSingle()

      if (dbError) throw dbError
      if (!adminRecord) {
        return apiError("Invalid Admin ID or account is disabled", 404)
      }

      const email = adminRecord.email
      let authUserId = adminRecord.auth_user_id

      if (!authUserId) {
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password || "admin123",
          email_confirm: true
        })

        let newUserId = signUpData?.user?.id

        if (!newUserId) {
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
          if (!listError && listData?.users) {
            const existingUser = listData.users.find((u: any) => u.email === email)
            if (existingUser) {
              newUserId = existingUser.id
            }
          }
        }

        if (newUserId) {
          const { error: updateError } = await supabaseAdmin
            .from("admins")
            .update({ auth_user_id: newUserId })
            .eq("id", adminRecord.id)
          if (updateError) throw updateError
          authUserId = newUserId
        }
      }

      return apiResponse({ email, auth_user_id: authUserId, adminRecord })
    }

    if (path.startsWith("admin/")) {
      const adminCtx = await verifyAdmin(req)
      if (!adminCtx) {
        return apiError("Unauthorized: Admin credentials required", 403)
      }

      if (path === "admin/traffic/routes/status") {
        const { route_id, status, eta } = body
        if (!route_id || !status) {
          return apiError("Missing route status parameters", 400)
        }

        const { data, error } = await supabase
          .from("traffic_routes")
          .update({ status, eta })
          .eq("id", route_id)
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Update Route Status to ${status}`,
          department: "Traffic",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/pilgrims/scan") {
        const { darshan_booking_id, validation_gate, scan_status } = body
        if (!darshan_booking_id || !validation_gate || !scan_status) {
          return apiError("Missing QR scan logging fields", 400)
        }

        // Write scan log
        const { data: scanLog, error: sError } = await supabase
          .from("qr_scans")
          .insert({
            darshan_booking_id,
            validation_gate,
            scanner_admin_id: adminCtx.admin.id,
            scan_status
          })
          .select()
          .single()

        if (sError) throw sError

        // Update booking state if scan was successful
        if (scan_status === "valid") {
          await supabase
            .from("darshan_bookings")
            .update({ status: "completed" })
            .eq("id", darshan_booking_id)
        }

        return apiResponse(scanLog)
      }

      if (path === "admin/pilgrims/verify-pass") {
        const { qr_data, gate_name } = body
        if (!qr_data) {
          return apiError("Missing QR scanner data", 400)
        }

        let bookingNumber = qr_data.trim()
        let isSecure = false
        if (bookingNumber.includes(":")) {
          const parts = bookingNumber.split(":")
          if (parts.length === 2) {
            const [bn, signature] = parts
            const expectedSignature = signBookingNumber(bn)
            if (signature === expectedSignature) {
              bookingNumber = bn
              isSecure = true
            } else {
              return apiError("Verification Failed: QR ticket signature is invalid or tampered.", 400)
            }
          }
        }

        // Query booking
        const { data: booking, error: bErr } = await supabase
          .from("darshan_bookings")
          .select("*")
          .eq("booking_number", bookingNumber)
          .maybeSingle()

        if (bErr) throw bErr
        if (!booking) {
          return apiError(`Verification Failed: Booking "${bookingNumber}" not found in database.`, 404)
        }

        // Query booking members
        const { data: members, error: mErr } = await supabase
          .from("darshan_booking_members")
          .select("*")
          .eq("booking_id", booking.id)
          .order("id", { ascending: true })

        if (mErr) throw mErr

        return apiResponse({
          booking,
          members,
          is_secure: isSecure
        })
      }

      if (path === "admin/pilgrims/check-in") {
        const { booking_id, passenger_ids, gate_name } = body
        if (!booking_id || !passenger_ids || !Array.isArray(passenger_ids) || !gate_name) {
          return apiError("Missing check-in parameter fields", 400)
        }

        // 1. Mark passenger IDs as checked_in
        const { error: uErr } = await supabase
          .from("darshan_booking_members")
          .update({ checked_in: true, checked_in_at: new Date().toISOString() })
          .eq("booking_id", booking_id)
          .in("passenger_id", passenger_ids)

        if (uErr) throw uErr

        // 2. Fetch all members under this booking to evaluate completeness
        const { data: allMembers, error: fErr } = await supabase
          .from("darshan_booking_members")
          .select("*")
          .eq("booking_id", booking_id)
          .order("id", { ascending: true })

        if (fErr) throw fErr

        const allCheckedIn = allMembers.every((m: any) => m.checked_in)

        // 3. Update parent booking if expired
        if (allCheckedIn) {
          const { error: bUpdateErr } = await supabase
            .from("darshan_bookings")
            .update({ status: "completed" })
            .eq("id", booking_id)

          if (bUpdateErr) throw bUpdateErr
        }

        // 4. Log QR entry audit scans log
        const { data: scanLog, error: sErr } = await supabase
          .from("qr_scans")
          .insert({
            darshan_booking_id: booking_id,
            validation_gate: gate_name,
            scanner_admin_id: adminCtx.admin.id,
            scan_status: "valid"
          })
          .select()
          .single()

        if (sErr) throw sErr

        return apiResponse({
          success: true,
          booking_status: allCheckedIn ? "completed" : "upcoming",
          members: allMembers,
          scanLog
        })
      }

      if (path === "admin/seva/volunteers/action") {
        const { application_id, status } = body
        if (!application_id || !status) {
          return apiError("Missing volunteer action status", 400)
        }

        const { data, error } = await supabase
          .from("volunteer_applications")
          .update({ status })
          .eq("id", application_id)
          .select()
          .single()

        if (error) throw error

        await createNotification({
          profile_id: data.profile_id,
          title_en: `Volunteer Application ${status === "approved" ? "Approved" : "Rejected"}`,
          title_hi: `स्वयंसेवक आवेदन ${status === "approved" ? "स्वीकृत" : "अस्वीकृत"}`,
          body_en: `Your volunteer application for "${data.preferred_role}" has been ${status}.`,
          body_hi: `भूमिका "${data.preferred_role}" के लिए आपका स्वयंसेवक आवेदन ${status === "approved" ? "स्वीकार" : "अस्वीकार"} कर दिया गया है।`,
          type: "volunteer",
          icon: "ShieldCheck",
          tone: status === "approved" ? "success" : "danger"
        })

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Volunteer application for ${data.full_name} was ${status} (Role: ${data.preferred_role})`,
          department: "Seva Management",
          actor_name: adminCtx.admin.name,
          new_values: { status }
        })

        return apiResponse(data)
      }

      if (path === "admin/approvals/action") {
        const { proposal_id, status, review_notes, rejection_reason } = body
        if (!proposal_id || !status) {
          return apiError("Missing approval action fields", 400)
        }

        const updatePayload: any = {
          status,
          review_notes
        }

        if (status === "approved") {
          updatePayload.approved_by_admin_id = adminCtx.admin.id
          updatePayload.approved_at = new Date().toISOString()
        } else {
          updatePayload.rejected_by_admin_id = adminCtx.admin.id
          updatePayload.rejected_at = new Date().toISOString()
          updatePayload.rejection_reason = rejection_reason
        }

        // Transaction updates
        const { data: proposal, error: pError } = await supabase
          .from("approval_queue")
          .update(updatePayload)
          .eq("id", proposal_id)
          .select()
          .single()

        if (pError) throw pError

        // If approved, trigger content table writebacks
        if (status === "approved" && proposal.type === "hotel-update") {
          const payload = proposal.draft_payload
          const { error: hotelErr } = await supabase
            .from("hotels")
            .insert({
              hotel_code: payload.hotel_code || `HTL-${Date.now().toString().substring(8)}`,
              name: payload.name,
              stars: Number(payload.stars) || 3,
              total_rooms: Number(payload.total_rooms) || 20,
              price_range: payload.price_range || "₹800 – ₹2,000",
              assigned_admin_id: payload.assigned_admin_id || proposal.submitted_by_admin_id,
              status: payload.status || "active",
              rating: Number(payload.rating) || 4.0,
              is_active: true,
              address: payload.address || "Main Walkway, Khatu Dham",
              contact_phone: payload.contact_phone || "+91 98290 11002",
              manager_name: payload.manager_name || "Priya Sharma",
              maps_link: payload.maps_link,
              photo_url: payload.photo_url || "/images/hotel-room-1.jpg",
              type: payload.type || "hotel"
            })
          if (hotelErr) throw hotelErr

          await createNotification({
            profile_id: null,
            title_en: `New Accommodation Approved: ${payload.name}`,
            title_hi: `नया आवास स्वीकृत: ${payload.name}`,
            body_en: `Room booking is now open for ${payload.name} at Khatu Dham.`,
            body_hi: `खाटू धाम में ${payload.name} के लिए कमरों की बुकिंग अब खुली है।`,
            type: "accommodation",
            icon: "BedDouble",
            tone: "success"
          })
        }

        if (status === "approved" && proposal.type === "announcement") {
          const payload = proposal.draft_payload
          const { data: ann, error: annError } = await supabase
            .from("announcements")
            .insert({
              priority: payload.priority || "low",
              target_audience: payload.target_audience || "all",
              status: "published",
              publish_at: payload.publish_at || new Date().toISOString(),
              expiry_at: payload.expiry_at,
              created_by_admin_id: proposal.submitted_by_admin_id
            })
            .select()
            .single()

          if (annError) throw annError

          // Create translations records
          const transPayloads = (payload.translations || []).map((t: any) => ({
            announcement_id: ann.id,
            language_code: t.language_code,
            title: t.title,
            description: t.description
          }))

          if (transPayloads.length > 0) {
            const { error: transError } = await supabase
              .from("announcement_translations")
              .insert(transPayloads)
            if (transError) throw transError
          }

          const enTrans = (payload.translations || []).find((t: any) => t.language_code === "en") || { title: "New Announcement", description: "A new update has been posted by the temple board." }
          const hiTrans = (payload.translations || []).find((t: any) => t.language_code === "hi") || { title: "नई घोषणा", description: "मंदिर बोर्ड द्वारा एक नया अपडेट पोस्ट किया गया है।" }
          
          await createNotification({
            profile_id: null,
            title_en: enTrans.title,
            title_hi: hiTrans.title,
            body_en: enTrans.description,
            body_hi: hiTrans.description,
            type: "temple",
            icon: "Megaphone",
            tone: "info"
          })
        }

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Proposal "${proposal.title}" (Type: ${proposal.type}) has been ${status}.`,
          department: "Temple Administration",
          actor_name: adminCtx.admin.name,
          new_values: { status }
        })

        return apiResponse(proposal)
      }

      if (path === "admin/notifications") {
        const { title_en, title_hi, body_en, body_hi, type, icon, tone } = body
        if (!title_en || !body_en || !type) {
          return apiError("Missing required notification parameters", 400)
        }

        const { data, error } = await supabase
          .from("notifications")
          .insert({
            profile_id: null,
            title_en,
            title_hi: title_hi || title_en,
            body_en,
            body_hi: body_hi || body_en,
            type,
            icon: icon || "Bell",
            tone: tone || "success"
          })
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Broadcasted notification: "${title_en}" (Category: ${type})`,
          department: "Notifications / Public Relations",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/admins") {
        const { name, phone, email, roles } = body
        if (!name || !phone || !email || !roles || !Array.isArray(roles)) {
          return apiError("Missing required admin configuration parameters", 400)
        }

        const admin_code = "ADM-" + Math.floor(1000 + Math.random() * 9000)
        const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase()

        const { data: admin, error: aError } = await supabase
          .from("admins")
          .insert({
            admin_code,
            name,
            phone,
            email,
            initials,
            is_active: true
          })
          .select()
          .single()

        if (aError) throw aError

        const bridgePayloads = roles.map((r: string) => ({
          admin_id: admin.id,
          role_key: r
        }))

        if (bridgePayloads.length > 0) {
          const { error: bError } = await supabase
            .from("admin_roles_bridge")
            .insert(bridgePayloads)
          if (bError) throw bError
        }

        return apiResponse(admin)
      }

      if (path === "admin/commerce/update-status") {
        const { type, id, status } = body
        if (!type || !id || !status) {
          return apiError("Missing status update identifiers", 400)
        }

        let targetTable = ""
        if (type === "transport") targetTable = "transport_bookings"
        else if (type === "bus") targetTable = "bus_bookings"
        else if (type === "restaurant") targetTable = "restaurant_reservations"
        else if (type === "prashad") targetTable = "prashad_orders"
        else if (type === "offering") targetTable = "offering_orders"
        else if (type === "hotel" || type === "accommodation") targetTable = "hotel_bookings"
        else {
          return apiError("Invalid commerce order type", 400)
        }

        const { data, error } = await supabase
          .from(targetTable)
          .update({ status })
          .eq("id", id)
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/accommodation/checkout") {
        const { booking_id } = body
        if (!booking_id) {
          return apiError("Missing check-out booking identifier", 400)
        }

        const { data, error } = await supabase
          .from("hotel_bookings")
          .update({ status: "completed" })
          .eq("id", booking_id)
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/accommodation/registrations") {
        const { data, error } = await supabase
          .from("hotel_registrations")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          if (error.code === "42P01") {
            const queueRes = await supabase
              .from("approval_queue")
              .select("*")
              .eq("type", "hotel-update")
              .order("submitted_at", { ascending: false })
            if (queueRes.error) throw queueRes.error
            const formatted = (queueRes.data || []).map((q: any) => ({
              id: q.id,
              hotel_code: q.draft_payload.hotel_code,
              name: q.draft_payload.name,
              stars: q.draft_payload.stars,
              total_rooms: q.draft_payload.total_rooms,
              price_range: q.draft_payload.price_range,
              assigned_admin_id: q.submitted_by_admin_id,
              status: q.status,
              rating: q.draft_payload.rating,
              address: q.draft_payload.address,
              contact_phone: q.draft_payload.contact_phone,
              manager_name: q.draft_payload.manager_name,
              maps_link: q.draft_payload.maps_link,
              photo_url: q.draft_payload.photo_url,
              type: q.draft_payload.type,
              created_at: q.submitted_at
            }))
            return apiResponse(formatted)
          }
          throw error
        }
        return apiResponse(data)
      }

      if (path === "admin/accommodation/register") {
        const { hotel_code, name, stars, total_rooms, price_range, address, contact_phone, manager_name, maps_link, photo_url, type } = body

        const { data, error } = await supabase
          .from("hotel_registrations")
          .insert({
            hotel_code,
            name,
            stars: Number(stars) || 3,
            total_rooms: Number(total_rooms) || 20,
            price_range,
            assigned_admin_id: adminCtx.admin.id,
            status: "pending",
            rating: 4.0,
            address,
            contact_phone,
            manager_name,
            maps_link,
            photo_url: photo_url || "/images/hotel-room-1.jpg",
            type
          })
          .select()
          .single()

        if (error) {
          if (error.code === "42P01") {
            const queueRes = await supabase
              .from("approval_queue")
              .insert({
                type: "hotel-update",
                title: `Register stay: ${name}`,
                submitted_by_admin_id: adminCtx.admin.id,
                status: "pending",
                department: "accommodation",
                description: `Listing request for new ${type} stay ${name}. Price range: ${price_range}, stars: ${stars}`,
                draft_payload: {
                  hotel_code,
                  name,
                  stars: Number(stars) || 3,
                  total_rooms: Number(total_rooms) || 20,
                  price_range,
                  assigned_admin_id: adminCtx.admin.id,
                  status: "active",
                  rating: 4.0,
                  address,
                  contact_phone,
                  manager_name,
                  maps_link,
                  photo_url: photo_url || "/images/hotel-room-1.jpg",
                  type
                }
              })
              .select()
              .single()

            if (queueRes.error) throw queueRes.error
            return apiResponse(queueRes.data)
          }
          throw error
        }
        return apiResponse(data)
      }

      if (path === "admin/accommodation/approve-registration") {
        const { registration_id } = body
        if (!registration_id) {
          return apiError("Missing registration ID", 400)
        }

        const { data: reg, error: getErr } = await supabase
          .from("hotel_registrations")
          .select("*")
          .eq("id", registration_id)
          .maybeSingle()

        if (getErr && getErr.code !== "42P01") throw getErr

        if (reg) {
          const { error: updateErr } = await supabase
            .from("hotel_registrations")
            .update({ status: "approved" })
            .eq("id", registration_id)
          if (updateErr) throw updateErr

          const { error: hotelErr } = await supabase
            .from("hotels")
            .insert({
              hotel_code: reg.hotel_code,
              name: reg.name,
              stars: reg.stars,
              total_rooms: reg.total_rooms,
              price_range: reg.price_range,
              assigned_admin_id: reg.assigned_admin_id,
              status: "active",
              rating: reg.rating,
              is_active: true
            })
          if (hotelErr) throw hotelErr

          await createNotification({
            profile_id: null,
            title_en: `New Accommodation Approved: ${reg.name}`,
            title_hi: `नया आवास स्वीकृत: ${reg.name}`,
            body_en: `Room booking is now open for ${reg.name} at Khatu Dham.`,
            body_hi: `खाटू धाम में ${reg.name} के लिए कमरों की बुकिंग अब खुली है।`,
            type: "accommodation",
            icon: "BedDouble",
            tone: "success"
          })

          await createAuditLog({
            admin_id: adminCtx.admin.id,
            action: `Approved hotel registration for "${reg.name}"`,
            department: "Accommodation",
            actor_name: adminCtx.admin.name
          })

          return apiResponse({ success: true, hotel: reg })
        } else {
          const { data: proposal, error: propErr } = await supabase
            .from("approval_queue")
            .select("*")
            .eq("id", registration_id)
            .maybeSingle()

          if (propErr) throw propErr
          if (!proposal) {
            return apiError("Registration record not found", 404)
          }

          const { error: updateQueueErr } = await supabase
            .from("approval_queue")
            .update({ status: "approved", approved_by_admin_id: adminCtx.admin.id, approved_at: new Date().toISOString() })
            .eq("id", registration_id)
          if (updateQueueErr) throw updateQueueErr

          const payload = proposal.draft_payload
          const { error: hotelErr } = await supabase
            .from("hotels")
            .insert({
              hotel_code: payload.hotel_code,
              name: payload.name,
              stars: Number(payload.stars) || 3,
              total_rooms: Number(payload.total_rooms) || 20,
              price_range: payload.price_range,
              assigned_admin_id: payload.assigned_admin_id,
              status: "active",
              rating: Number(payload.rating) || 4.0,
              is_active: true
            })
          if (hotelErr) throw hotelErr

          await createNotification({
            profile_id: null,
            title_en: `New Accommodation Approved: ${payload.name}`,
            title_hi: `नया आवास स्वीकृत: ${payload.name}`,
            body_en: `Room booking is now open for ${payload.name} at Khatu Dham.`,
            body_hi: `खाटू धाम में ${payload.name} के लिए कमरों की बुकिंग अब खुली है।`,
            type: "accommodation",
            icon: "BedDouble",
            tone: "success"
          })

          await createAuditLog({
            admin_id: adminCtx.admin.id,
            action: `Approved hotel registration for "${payload.name}"`,
            department: "Accommodation",
            actor_name: adminCtx.admin.name
          })

          return apiResponse({ success: true, hotel: payload })
        }
      }

      if (path === "admin/accommodation/reject-registration") {
        const { registration_id, rejection_reason } = body
        if (!registration_id) {
          return apiError("Missing registration ID", 400)
        }

        const { data: reg, error: getErr } = await supabase
          .from("hotel_registrations")
          .select("*")
          .eq("id", registration_id)
          .maybeSingle()

        if (getErr && getErr.code !== "42P01") throw getErr

        if (reg) {
          const { error: updateErr } = await supabase
            .from("hotel_registrations")
            .update({ status: "rejected" })
            .eq("id", registration_id)
          if (updateErr) throw updateErr

          await createAuditLog({
            admin_id: adminCtx.admin.id,
            action: `Rejected hotel registration for "${reg.name}"`,
            department: "Accommodation",
            actor_name: adminCtx.admin.name
          })

          return apiResponse({ success: true })
        } else {
          const { error: updateQueueErr } = await supabase
            .from("approval_queue")
            .update({ status: "rejected", rejected_by_admin_id: adminCtx.admin.id, rejected_at: new Date().toISOString(), rejection_reason })
            .eq("id", registration_id)
          if (updateQueueErr) throw updateQueueErr

          await createAuditLog({
            admin_id: adminCtx.admin.id,
            action: `Rejected hotel registration proposal ID ${registration_id} (Reason: ${rejection_reason || "None"})`,
            department: "Accommodation",
            actor_name: adminCtx.admin.name
          })

          return apiResponse({ success: true })
        }
      }

      if (path === "admin/parking/occupancy") {
        const { block_id, occupied, vehicle_type, status } = body
        if (!block_id) {
          return apiError("Missing parking update block ID", 400)
        }

        // Fetch capacity limits
        const { data: block, error: blockError } = await supabase
          .from("parking_blocks")
          .select("*")
          .eq("id", block_id)
          .single()

        if (blockError) throw blockError

        const updatePayload: any = {}
        if (occupied !== undefined) {
          if (occupied > block.total_capacity) {
            return apiError("Occupancy count cannot exceed total capacity limit", 400)
          }
          updatePayload.occupied = occupied
          updatePayload.status = occupied === block.total_capacity ? "full" : "open"
        }

        if (status !== undefined) {
          updatePayload.status = status
        }

        updatePayload.updated_at = new Date().toISOString()

        // Update block
        const { data: updatedBlock, error: uError } = await supabase
          .from("parking_blocks")
          .update(updatePayload)
          .eq("id", block_id)
          .select()
          .single()

        if (uError) throw uError

        // Record history log
        await supabase
          .from("parking_history")
          .insert({
            block_id,
            total_capacity: block.total_capacity,
            occupied,
            entries_count: occupied > block.occupied ? (occupied - block.occupied) : 0,
            exits_count: occupied < block.occupied ? (block.occupied - occupied) : 0,
            cars_parked: vehicle_type === "Car" ? occupied : 0,
            bikes_parked: vehicle_type === "Two-Wheeler" ? occupied : 0,
            updated_by_admin_id: adminCtx.admin.id
          })

        if (updatedBlock.status === "full" || updatedBlock.status === "closed") {
          await createNotification({
            profile_id: null,
            title_en: `Parking block ${updatedBlock.name} is ${updatedBlock.status.toUpperCase()}`,
            title_hi: `पार्किंग ब्लॉक ${updatedBlock.name} ${updatedBlock.status === 'full' ? 'पूरा भर गया है' : 'बंद है'}`,
            body_en: `Parking Block ${updatedBlock.name} is now ${updatedBlock.status}. Please follow local diversions to alternative parking blocks.`,
            body_hi: `पार्किंग ब्लॉक ${updatedBlock.name} अब ${updatedBlock.status === 'full' ? 'भर गया है' : 'बंद हो गया है'}। कृपया वैकल्पिक पार्किंग ब्लॉकों के लिए स्थानीय डायवर्जन का पालन करें।`,
            type: "parking",
            icon: "ParkingSquare",
            tone: "warning"
          })
        }

        return apiResponse(updatedBlock)
      }

      if (path === "admin/parking/add") {
        const { block_code, name, total_capacity, occupied, status, vehicle_types, manager_name, latitude, longitude, google_maps_url, shuttle_active } = body
        if (!block_code || !name || !total_capacity) {
          return apiError("Missing required parking block details", 400)
        }

        const { data, error } = await supabase
          .from("parking_blocks")
          .insert({
            block_code,
            name,
            total_capacity: Number(total_capacity),
            occupied: Number(occupied || 0),
            status: status || "open",
            vehicle_types: vehicle_types || ["Car"],
            manager_name: manager_name || null,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            google_maps_url: google_maps_url || null,
            shuttle_active: shuttle_active !== undefined ? shuttle_active : true,
            is_active: true
          })
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Create Parking Block ${name}`,
          department: "Parking",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/parking/edit") {
        const { id, block_code, name, total_capacity, occupied, status, vehicle_types, manager_name, latitude, longitude, google_maps_url, shuttle_active } = body
        if (!id) {
          return apiError("Missing parking block ID", 400)
        }

        const updatePayload: any = {}
        if (block_code !== undefined) updatePayload.block_code = block_code
        if (name !== undefined) updatePayload.name = name
        if (total_capacity !== undefined) updatePayload.total_capacity = Number(total_capacity)
        if (occupied !== undefined) updatePayload.occupied = Number(occupied)
        if (status !== undefined) updatePayload.status = status
        if (vehicle_types !== undefined) updatePayload.vehicle_types = vehicle_types
        if (manager_name !== undefined) updatePayload.manager_name = manager_name
        if (latitude !== undefined) updatePayload.latitude = latitude ? Number(latitude) : null
        if (longitude !== undefined) updatePayload.longitude = longitude ? Number(longitude) : null
        if (google_maps_url !== undefined) updatePayload.google_maps_url = google_maps_url
        if (shuttle_active !== undefined) updatePayload.shuttle_active = shuttle_active
        updatePayload.updated_at = new Date().toISOString()

        const { data, error } = await supabase
          .from("parking_blocks")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Edit Parking Block ${data.name}`,
          department: "Parking",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/parking/delete") {
        const { id } = body
        if (!id) {
          return apiError("Missing parking block ID", 400)
        }

        const { data, error } = await supabase
          .from("parking_blocks")
          .delete()
          .eq("id", id)
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Delete Parking Block ${data.name}`,
          department: "Parking",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/traffic/routes/add") {
        const { name, origin, destination, coordinates, eta, congestion_level, status, google_maps_polyline, google_maps_url } = body
        if (!name || !eta) {
          return apiError("Missing required traffic route details", 400)
        }

        const { data, error } = await supabase
          .from("traffic_routes")
          .insert({
            name,
            origin: origin || null,
            destination: destination || null,
            coordinates: coordinates || null,
            eta,
            congestion_level: congestion_level || "smooth",
            status: status || "smooth",
            alert_count: 0,
            google_maps_polyline: google_maps_polyline || null,
            google_maps_url: google_maps_url || null,
            is_active: true
          })
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Create Traffic Route ${name}`,
          department: "Traffic",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/traffic/routes/edit") {
        const { id, name, origin, destination, coordinates, eta, congestion_level, status, google_maps_polyline, google_maps_url } = body
        if (!id) {
          return apiError("Missing traffic route ID", 400)
        }

        const updatePayload: any = {}
        if (name !== undefined) updatePayload.name = name
        if (origin !== undefined) updatePayload.origin = origin
        if (destination !== undefined) updatePayload.destination = destination
        if (coordinates !== undefined) updatePayload.coordinates = coordinates
        if (eta !== undefined) updatePayload.eta = eta
        if (congestion_level !== undefined) updatePayload.congestion_level = congestion_level
        if (status !== undefined) updatePayload.status = status
        if (google_maps_polyline !== undefined) updatePayload.google_maps_polyline = google_maps_polyline
        if (google_maps_url !== undefined) updatePayload.google_maps_url = google_maps_url
        updatePayload.updated_at = new Date().toISOString()

        const { data, error } = await supabase
          .from("traffic_routes")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Edit Traffic Route ${data.name}`,
          department: "Traffic",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/traffic/routes/delete") {
        const { id } = body
        if (!id) {
          return apiError("Missing traffic route ID", 400)
        }

        const { data, error } = await supabase
          .from("traffic_routes")
          .delete()
          .eq("id", id)
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Delete Traffic Route ${data.name}`,
          department: "Traffic",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/traffic/alerts") {
        const { route_id, severity, message, source, latitude, longitude, alert_type } = body
        if (!route_id || !severity || !message) {
          return apiError("Missing traffic alert parameters", 400)
        }

        const alert_code = "TRF-" + Math.floor(100000 + Math.random() * 900000)

        const { data, error } = await supabase
          .from("traffic_alerts")
          .insert({
            alert_code,
            route_id,
            severity,
            message,
            source: source || "Manual",
            is_active: true,
            published_by_admin_id: adminCtx.admin.id,
            latitude: latitude || null,
            longitude: longitude || null,
            alert_type: alert_type || "closure"
          })
          .select()
          .single()

        if (error) throw error

        await createNotification({
          profile_id: null,
          title_en: "New Traffic Advisory",
          title_hi: "नया ट्रैफिक परामर्श",
          body_en: `Alert: ${message}`,
          body_hi: `चेतावनी: ${message}`,
          type: "traffic",
          icon: "TrafficCone",
          tone: "warning"
        })

        return apiResponse(data)
      }

      if (path === "admin/traffic/alerts/resolve") {
        const { alert_id } = body
        if (!alert_id) {
          return apiError("Missing traffic alert identifier", 400)
        }

        const { data, error } = await supabase
          .from("traffic_alerts")
          .update({ is_active: false })
          .eq("id", alert_id)
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/emergency/update") {
        const { request_id, status, resolution_details, location_text } = body
        if (!request_id || !status) {
          return apiError("Missing emergency incident updates", 400)
        }

        const updatePayload: any = {
          status,
          assigned_admin_id: adminCtx.admin.id
        }

        if (status === "resolved") {
          updatePayload.resolution_details = resolution_details
          updatePayload.resolved_at = new Date().toISOString()
        }

        if (location_text) {
          updatePayload.location_text = location_text
        }

        const { data, error } = await supabase
          .from("emergency_requests")
          .update(updatePayload)
          .eq("id", request_id)
          .select()
          .single()

        if (error) throw error

        await createNotification({
          profile_id: data.profile_id,
          title_en: status === "resolved" ? "Emergency SOS Resolved" : "Emergency SOS Dispatched",
          title_hi: status === "resolved" ? "आपातकालीन SOS हल हो गया" : "आपातकालीन SOS डिस्पैच किया गया",
          body_en: status === "resolved" 
            ? `Your SOS incident has been marked resolved. Details: ${resolution_details || "N/A"}`
            : `Help has been dispatched to your location: ${location_text || "Sanctum Main entrance"}`,
          body_hi: status === "resolved"
            ? `आपकी SOS घटना का समाधान कर दिया गया है। विवरण: ${resolution_details || "लागू नहीं"}`
            : `आपके स्थान पर सहायता भेजी गई है: ${location_text || "गर्भगृह मुख्य प्रवेश द्वार"}`,
          type: "emergency",
          icon: status === "resolved" ? "CheckCircle" : "ShieldAlert",
          tone: status === "resolved" ? "success" : "danger"
        })

        return apiResponse(data)
      }

      if (path === "admin/temple") {
        const { section_key, title, content } = body
        if (!section_key || !title || !content) {
          return apiError("Missing required temple information parameters", 400)
        }

        const { data, error } = await supabase
          .from("temple_information")
          .upsert({
            section_key,
            title,
            content,
            last_updated_by_admin_id: adminCtx.admin.id,
            updated_at: new Date().toISOString()
          }, { onConflict: "section_key" })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/lost-found/claims/action") {
        const { claim_id, action, rejection_reason } = body
        if (!claim_id || !action) {
          return apiError("Missing claim action parameters", 400)
        }

        const { data: claim, error: claimErr } = await supabase
          .from("claim_requests")
          .select("*, found_items(*)")
          .eq("id", claim_id)
          .single()

        if (claimErr) throw claimErr

        const newStatus = action === "approve" ? "Claim Approved" : "ready-to-collect"
        const claimStatus = action === "approve" ? "approved" : "rejected"

        const { error: updClaimErr } = await supabase
          .from("claim_requests")
          .update({ status: claimStatus, updated_at: new Date().toISOString() })
          .eq("id", claim_id)

        if (updClaimErr) throw updClaimErr

        await supabase
          .from("found_items")
          .update({ status: newStatus })
          .eq("id", claim.found_item_id)

        const { data: matchedLost } = await supabase
          .from("lost_items")
          .select("*")
          .eq("profile_id", claim.profile_id)
          .eq("matched_found_item_id", claim.found_item_id)
          .maybeSingle()

        if (matchedLost) {
          let parsed: any = { user_notes: "", history: [] }
          try {
            parsed = JSON.parse(matchedLost.additional_details || "{}")
          } catch(e) {}
          if (!Array.isArray(parsed.history)) parsed.history = []
          parsed.history.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            notes: `Claim ${claimStatus} by Admin. Remarks: ${rejection_reason || "N/A"}`
          })

          await supabase
            .from("lost_items")
            .update({
              status: newStatus,
              additional_details: JSON.stringify(parsed),
              updated_at: new Date().toISOString()
            })
            .eq("id", matchedLost.id)
        }

        await createNotification({
          profile_id: claim.profile_id,
          title_en: action === "approve" ? "Claim Request Approved" : "Claim Request Rejected",
          title_hi: action === "approve" ? "दावा अनुरोध स्वीकृत" : "दावा अनुरोध अस्वीकृत",
          body_en: action === "approve"
            ? `Your claim for item "${claim.found_items?.item_name}" has been approved! Please collect it at the Lost & Found desk.`
            : `Your claim for item "${claim.found_items?.item_name}" was not approved. Remarks: ${rejection_reason || "Verification failed."}`,
          body_hi: action === "approve"
            ? `आपकी वस्तु "${claim.found_items?.item_name}" के लिए आपका दावा स्वीकृत हो गया है! कृपया इसे खोया-पाया डेस्क से प्राप्त करें।`
            : `आपकी वस्तु "${claim.found_items?.item_name}" के लिए आपका दावा स्वीकृत नहीं किया गया। विवरण: ${rejection_reason || "सत्यापन विफल रहा।"}`,
          type: "lost-found",
          icon: action === "approve" ? "CheckCircle" : "XCircle",
          tone: action === "approve" ? "success" : "danger"
        })

        await createAuditLog({
          action: `Claim request ${claimStatus} for found item #${claim.found_item_id} by devotee (Profile: ${claim.profile_id})`,
          department: "Security / Lost & Found",
          actor_name: adminCtx.admin.name
        })

        return apiResponse({ success: true })
      }

      if (path === "admin/lost-found/found/manual") {
        const { item_name, category, description, image_url, date_found, time_found, location_found, storage_location, found_by, remarks, lost_item_id } = body
        if (!item_name || !description || !location_found || !date_found) {
          return apiError("Missing manual found item details", 400)
        }

        const { data: item, error } = await supabase
          .from("found_items")
          .insert({
            item_name,
            category: category || "General",
            description,
            image_url: image_url || null,
            date_found,
            time_found: time_found || "12:00 PM",
            location_found,
            storage_location: storage_location || "Storage Safe",
            found_by: found_by || "Admin Staff",
            remarks: remarks || "",
            status: "Found",
            item_color: "N/A",
            category_icon: "PackageSearch"
          })
          .select()
          .single()

        if (error) throw error

        let autoMatchedId = lost_item_id || null

        if (!autoMatchedId) {
          const { data: pendingLost } = await supabase
            .from("lost_items")
            .select("*")
            .eq("status", "registered")
            .is("matched_found_item_id", null)

          if (pendingLost && pendingLost.length > 0) {
            const normalizedFoundName = item_name.toLowerCase();
            const matchedReport = pendingLost.find(l =>
              l.item_name.toLowerCase().includes(normalizedFoundName) ||
              normalizedFoundName.includes(l.item_name.toLowerCase())
            )
            if (matchedReport) {
              autoMatchedId = matchedReport.id
            }
          }
        }

        if (autoMatchedId) {
          const { data: lostItem } = await supabase
            .from("lost_items")
            .select("*")
            .eq("id", autoMatchedId)
            .single()

          if (lostItem) {
            let parsed: any = { user_notes: "", history: [] }
            try {
              parsed = JSON.parse(lostItem.additional_details || "{}")
            } catch(e) {}
            if (!Array.isArray(parsed.history)) parsed.history = []
            parsed.history.push({
              status: "Found",
              timestamp: new Date().toISOString(),
              notes: `Item matched automatically with Found Item ID: ${item.id}`
            })

            await supabase
              .from("lost_items")
              .update({
                status: "Found",
                matched_found_item_id: item.id,
                additional_details: JSON.stringify(parsed),
                updated_at: new Date().toISOString()
              })
              .eq("id", autoMatchedId)

            await supabase
              .from("found_items")
              .update({ status: "Found" })
              .eq("id", item.id)

            await createNotification({
              profile_id: lostItem.profile_id,
              title_en: "Lost Item Match Found",
              title_hi: "खोई हुई वस्तु का मिलान मिला",
              body_en: `Good news! Your reported lost item "${lostItem.item_name}" has been matched with a found item. Please verify and claim it.`,
              body_hi: `अच्छी खबर! आपकी रिपोर्ट की गई खोई हुई वस्तु "${lostItem.item_name}" का मिलान मिल गया है। कृपया जांच करें।`,
              type: "lost-found",
              icon: "PackageSearch",
              tone: "success"
            })
          }
        }

        await createAuditLog({
          action: `Admin manually added found item: "${item_name}"` + (autoMatchedId ? ` (Auto-matched to lost report ID: ${autoMatchedId})` : ""),
          department: "Security / Lost & Found",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(item)
      }

      if (path === "admin/lost-found/resolve") {
        const { lost_item_id, found_item_id, remarks } = body
        if (!lost_item_id && !found_item_id) {
          return apiError("Missing resolution targets", 400)
        }

        const timestamp = new Date().toISOString()

        if (lost_item_id) {
          const { data: lostItem } = await supabase
            .from("lost_items")
            .select("*")
            .eq("id", lost_item_id)
            .single()

          if (lostItem) {
            let parsed: any = { user_notes: "", history: [] }
            try {
              parsed = JSON.parse(lostItem.additional_details || "{}")
            } catch(e) {}
            if (!Array.isArray(parsed.history)) parsed.history = []
            parsed.history.push({
              status: "Returned",
              timestamp,
              notes: remarks || "Item returned to owner and case closed."
            })

            await supabase
              .from("lost_items")
              .update({
                status: "Returned",
                additional_details: JSON.stringify(parsed),
                updated_at: timestamp
              })
              .eq("id", lost_item_id)

            await createNotification({
              profile_id: lostItem.profile_id,
              title_en: "Lost & Found Case Closed",
              title_hi: "खोया-पाया मामला बंद",
              body_en: `Your reported lost item "${lostItem.item_name}" has been returned to you. Thank you!`,
              body_hi: `आपकी खोई हुई वस्तु "${lostItem.item_name}" आपको वापस कर दी गई है। धन्यवाद!`,
              type: "lost-found",
              icon: "CheckSquare",
              tone: "success"
            })
          }
        }

        if (found_item_id) {
          await supabase
            .from("found_items")
            .update({ status: "Returned" })
            .eq("id", found_item_id)
        }

        await createAuditLog({
          action: `Lost & Found case resolved (Returned) for lost_id: ${lost_item_id || "N/A"}, found_id: ${found_item_id || "N/A"}`,
          department: "Security / Lost & Found",
          actor_name: adminCtx.admin.name
        })

        return apiResponse({ success: true })
      }

      if (path === "admin/reach/destination") {
        const { id, name, latitude, longitude, google_maps_url } = body
        if (!name || !latitude || !longitude || !google_maps_url) {
          return apiError("Missing destination details", 400)
        }

        const { data, error } = await supabase
          .from("temple_destinations")
          .upsert({
            id: id || undefined,
            name,
            latitude: Number(latitude),
            longitude: Number(longitude),
            google_maps_url,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        await createAuditLog({
          admin_id: adminCtx.admin.id,
          action: `Updated Temple Destination to: "${name}"`,
          department: "Facilities / Reach",
          actor_name: adminCtx.admin.name
        })

        return apiResponse(data)
      }

      if (path === "admin/reach/travel-option") {
        const { action, id, mode, icon, detail, detail_hi, display_order, is_active } = body
        if (!action) return apiError("Missing action", 400)

        if (action === "delete") {
          const { error } = await supabase
            .from("travel_options")
            .delete()
            .eq("id", id)
          if (error) throw error
          return apiResponse({ success: true })
        }

        const { data, error } = await supabase
          .from("travel_options")
          .upsert({
            id: id || undefined,
            mode,
            icon,
            detail,
            detail_hi,
            display_order: Number(display_order) || 0,
            is_active: is_active !== false,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/reach/route-info") {
        const { action, id, title, distance, duration, description, is_active } = body
        if (!action) return apiError("Missing action", 400)

        if (action === "delete") {
          const { error } = await supabase
            .from("route_information")
            .delete()
            .eq("id", id)
          if (error) throw error
          return apiResponse({ success: true })
        }

        const { data, error } = await supabase
          .from("route_information")
          .upsert({
            id: id || undefined,
            title,
            distance,
            duration,
            description,
            is_active: is_active !== false
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/reach/transport-instruction") {
        const { action, id, title, instructions, is_active } = body
        if (!action) return apiError("Missing action", 400)

        if (action === "delete") {
          const { error } = await supabase
            .from("transport_instructions")
            .delete()
            .eq("id", id)
          if (error) throw error
          return apiResponse({ success: true })
        }

        const { data, error } = await supabase
          .from("transport_instructions")
          .upsert({
            id: id || undefined,
            title,
            instructions,
            is_active: is_active !== false
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }

      if (path === "admin/aarti") {
        const { action, id, name, name_hi, start_time, end_time, description, description_hi, status, display_order } = body
        if (!action) return apiError("Missing action", 400)

        let previousState: any = null
        if (id) {
          const { data } = await supabase
            .from("aarti_timings")
            .select("*")
            .eq("id", id)
            .maybeSingle()
          previousState = data
        }

        if (action === "delete") {
          const { error } = await supabase
            .from("aarti_timings")
            .delete()
            .eq("id", id)
          if (error) throw error

          await supabase.from("temple_cms_history").insert({
            module_type: "aarti",
            record_id: id,
            action_type: "delete",
            updated_by: adminCtx.admin.name || adminCtx.admin.initials || "Admin",
            previous_value: previousState,
            current_value: null
          })

          return apiResponse({ success: true })
        }

        const { data, error } = await supabase
          .from("aarti_timings")
          .upsert({
            id: id || undefined,
            name,
            name_hi,
            start_time,
            end_time: end_time || null,
            description: description || null,
            description_hi: description_hi || null,
            status: status || "active",
            display_order: Number(display_order) || 0,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        await supabase.from("temple_cms_history").insert({
          module_type: "aarti",
          record_id: data.id,
          action_type: id ? "update" : "create",
          updated_by: adminCtx.admin.name || adminCtx.admin.initials || "Admin",
          previous_value: previousState,
          current_value: data
        })

        return apiResponse(data)
      }

      if (path === "admin/guidelines") {
        const { action, id, title, title_hi, content, content_hi, status, display_order } = body
        if (!action) return apiError("Missing action", 400)

        let previousState: any = null
        if (id) {
          const { data } = await supabase
            .from("devotee_guidelines")
            .select("*")
            .eq("id", id)
            .maybeSingle()
          previousState = data
        }

        if (action === "delete") {
          const { error } = await supabase
            .from("devotee_guidelines")
            .delete()
            .eq("id", id)
          if (error) throw error

          await supabase.from("temple_cms_history").insert({
            module_type: "guideline",
            record_id: id,
            action_type: "delete",
            updated_by: adminCtx.admin.name || adminCtx.admin.initials || "Admin",
            previous_value: previousState,
            current_value: null
          })

          return apiResponse({ success: true })
        }

        const { data, error } = await supabase
          .from("devotee_guidelines")
          .upsert({
            id: id || undefined,
            title,
            title_hi,
            content,
            content_hi,
            status: status || "published",
            display_order: Number(display_order) || 0,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        await supabase.from("temple_cms_history").insert({
          module_type: "guideline",
          record_id: data.id,
          action_type: id ? "update" : "create",
          updated_by: adminCtx.admin.name || adminCtx.admin.initials || "Admin",
          previous_value: previousState,
          current_value: data
        })

        return apiResponse(data)
      }

      if (path === "admin/booking-centers") {
        const { action, id, name, address, district, state, latitude, longitude, google_maps_url, working_hours, description, status } = body
        if (!action) return apiError("Missing action", 400)

        if (action === "delete") {
          const { error } = await supabase
            .from("offline_booking_centers")
            .delete()
            .eq("id", id)
          if (error) throw error
          return apiResponse({ success: true })
        }

        const { data, error } = await supabase
          .from("offline_booking_centers")
          .upsert({
            id: id || undefined,
            name,
            address,
            district,
            state,
            latitude: Number(latitude),
            longitude: Number(longitude),
            google_maps_url,
            working_hours,
            description: description || null,
            status: status || "active",
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return apiResponse(data)
      }
    }

    return apiError(`Route POST /api/${path} not found`, 404)
  } catch (err: any) {
    console.error(`Error in POST /api/${path}:`, err)
    return apiError(err.message || "Internal Server Error", 500)
  }
})
