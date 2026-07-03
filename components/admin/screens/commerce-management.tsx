"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/shared"
import { AdminSectionTitle, LiveDot } from "@/components/admin/admin-shared"
import { adminApi } from "@/lib/api-client"

interface TransportBooking {
  id: string
  devoteeName: string
  contactPhone: string
  vehicleName: string
  pickupPoint: string
  pickupDate: string
  pickupTime: string
  status: string
}

interface BusBooking {
  id: string
  devoteeName: string
  contactPhone: string
  route: string
  travelDate: string
  seatCount: number
  status: string
}

interface DiningReservation {
  id: string
  guestName: string
  guestPhone: string
  restaurantName: string
  reservationDate: string
  reservationTime: string
  peopleCount: number
  status: string
}

interface PrasadOrder {
  id: string
  recipientName: string
  recipientPhone: string
  totalAmount: number
  deliveryType: string
  address?: string
  status: string
  items: string
}

interface OfferingOrder {
  id: string
  profileId: string
  totalAmount: number
  status: string
  items: string
}

export function CommerceManagementScreen({ navigate }: { navigate: (s: any) => void }) {
  const [activeTab, setActiveTab] = useState<"transport" | "bus" | "dining" | "prasad" | "offerings">("transport")
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const [transports, setTransports] = useState<TransportBooking[]>([])
  const [buses, setBuses] = useState<BusBooking[]>([])
  const [dining, setDining] = useState<DiningReservation[]>([])
  const [prasad, setPrasad] = useState<PrasadOrder[]>([])
  const [offerings, setOfferings] = useState<OfferingOrder[]>([])

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3500)
  }

  // Load all commerce data
  useEffect(() => {
    const loadCommerceData = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) return

      setLoading(true)
      try {
        const ledger = await adminApi.getCommerceLedger()

        if (ledger.cabs) {
          setTransports(ledger.cabs.map((item: any) => ({
            id: String(item.id),
            devoteeName: item.devotee_name,
            contactPhone: item.contact_phone,
            vehicleName: item.transport_vehicles?.name || "Standard Cab",
            pickupPoint: item.pickup_point,
            pickupDate: item.pickup_date,
            pickupTime: item.pickup_time,
            status: item.status
          })))
        }

        if (ledger.buses) {
          setBuses(ledger.buses.map((item: any) => ({
            id: String(item.id),
            devoteeName: item.devotee_name,
            contactPhone: item.contact_phone,
            route: `${item.bus_routes?.from_city} → ${item.bus_routes?.to_city}`,
            travelDate: item.travel_date,
            seatCount: item.seat_count,
            status: item.status
          })))
        }

        if (ledger.dining) {
          setDining(ledger.dining.map((item: any) => ({
            id: String(item.id),
            guestName: item.guest_name,
            guestPhone: item.guest_phone,
            restaurantName: item.restaurants?.name || "Pure Veg Eatery",
            reservationDate: item.reservation_date,
            reservationTime: item.reservation_time,
            peopleCount: item.people_count,
            status: item.status
          })))
        }

        if (ledger.prasad) {
          setPrasad(ledger.prasad.map((item: any) => {
            const itemSummary = item.prashad_order_items?.map((oi: any) => `${oi.quantity}x ${oi.prashad_items?.name}`).join(", ") || "Prasad Box"
            return {
              id: String(item.id),
              recipientName: item.recipient_name,
              recipientPhone: item.recipient_phone,
              totalAmount: item.total_amount,
              deliveryType: item.delivery_type,
              address: item.shipping_address || undefined,
              status: item.status,
              items: itemSummary
            }
          }))
        }

        if (ledger.offerings) {
          setOfferings(ledger.offerings.map((item: any) => {
            const itemSummary = item.offering_order_items?.map((oi: any) => `${oi.quantity}x ${oi.offering_items?.name}`).join(", ") || "Puja Kit"
            return {
              id: String(item.id),
              profileId: item.profile_id,
              totalAmount: item.total_amount,
              status: item.status,
              items: itemSummary
            }
          }))
        }
      } catch (err) {
        console.error("Failed to load commerce admin records", err)
      } finally {
        setLoading(false)
      }
    }

    loadCommerceData()
  }, [])

  // Status transitions
  const updateStatus = async (table: string, id: string, nextStatus: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        let type = "transport"
        if (table === "bus_bookings") type = "bus"
        else if (table === "restaurant_reservations") type = "restaurant"
        else if (table === "prashad_orders") type = "prashad"
        else if (table === "offering_orders") type = "offering"

        await adminApi.updateCommerceStatus({
          type,
          id,
          status: nextStatus
        })
      }

      triggerToast(`Order/Booking state transitioned to: ${nextStatus}`)
      
      // Update local state
      if (activeTab === "transport") {
        setTransports(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t))
      } else if (activeTab === "bus") {
        setBuses(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b))
      } else if (activeTab === "dining") {
        setDining(prev => prev.map(d => d.id === id ? { ...d, status: nextStatus } : d))
      } else if (activeTab === "prasad") {
        setPrasad(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p))
      } else if (activeTab === "offerings") {
        setOfferings(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-gray-900 px-5 py-3 text-xs font-bold text-white shadow-xl flex items-center gap-2"
          >
            <Icon name="CheckCircle" className="size-4 text-green-500" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "180px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Commerce & Conveniences Ledger</h1>
            <p className="text-xs text-white/80 mt-1">Audit devotee taxi/bus bookings, bhandara & dining receipts, prasad shipments, and puja counter transactions</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20 border border-white/20">
            <Icon name="Wallet" className="size-6 text-white animate-pulse" />
          </span>
        </div>
      </section>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {[
          { key: "transport" as const, label: "Taxis & Cabs", icon: "Car" },
          { key: "bus" as const, label: "Temple Buses", icon: "Bus" },
          { key: "dining" as const, label: "Bhandara & Dining", icon: "Utensils" },
          { key: "prasad" as const, label: "Prasad Bhog", icon: "ShoppingBag" },
          { key: "offerings" as const, label: "Puja Offerings", icon: "Flower" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === t.key ? "bg-primary text-white shadow-md" : "bg-card text-muted-foreground border border-border/60 hover:text-foreground"
            }`}
          >
            <Icon name={t.icon} className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Ledger Transactions</p>
          <p className="font-heading text-xl font-extrabold text-foreground mt-1">
            {activeTab === "transport" ? transports.length :
             activeTab === "bus" ? buses.length :
             activeTab === "dining" ? dining.length :
             activeTab === "prasad" ? prasad.length : offerings.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Today's Revenue</p>
          <p className="font-heading text-xl font-extrabold text-green-600 mt-1">
            {activeTab === "transport" ? `₹${transports.length * 1800}` :
             activeTab === "bus" ? `₹${buses.reduce((a,c) => a + (c.seatCount * 120), 0)}` :
             activeTab === "dining" ? "₹0 (Free & Reserve)" :
             `₹${(activeTab === "prasad" ? prasad : offerings).reduce((a,c) => a + c.totalAmount, 0)}`}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pending Service</p>
          <p className="font-heading text-xl font-extrabold text-amber-600 mt-1">
            {activeTab === "transport" ? transports.filter(t => t.status === "confirmed").length :
             activeTab === "bus" ? buses.filter(b => b.status === "confirmed").length :
             activeTab === "dining" ? dining.filter(d => d.status === "confirmed").length :
             (activeTab === "prasad" ? prasad : offerings).filter(x => x.status === "pending").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">System Status</p>
          <div className="flex items-center gap-1.5 mt-2">
            <LiveDot color="bg-green-500" />
            <span className="text-xs font-bold text-foreground">Payment Gateway Live</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm overflow-hidden">
        <AdminSectionTitle title={`${activeTab.toUpperCase()} LEDGER LOGS`} icon="History" />

        {loading ? (
          <p className="text-center text-xs text-muted-foreground py-10">Loading ledger records...</p>
        ) : (
          <div className="overflow-x-auto w-full mt-4">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground">
                  <th className="pb-3 pl-2">ID</th>
                  <th className="pb-3">Devotee details</th>
                  <th className="pb-3">Service target & description</th>
                  <th className="pb-3">Date & schedule</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {activeTab === "transport" && transports.map(item => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="py-4 pl-2 font-mono text-[10px] text-muted-foreground">#{item.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-foreground">{item.devoteeName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.contactPhone}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">{item.vehicleName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">Pickup: {item.pickupPoint}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">{item.pickupDate}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.pickupTime}</p>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.status === "confirmed" ? "bg-green-50 text-green-700 dark:bg-green-950/20" : "bg-gray-100 text-gray-600"
                      }`}>{item.status}</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      {item.status === "confirmed" ? (
                        <button
                          onClick={() => updateStatus("transport_bookings", item.id, "completed")}
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1.5"
                        >
                          Complete
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">No action</span>
                      )}
                    </td>
                  </tr>
                ))}

                {activeTab === "bus" && buses.map(item => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="py-4 pl-2 font-mono text-[10px] text-muted-foreground">#{item.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-foreground">{item.devoteeName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.contactPhone}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">{item.route}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.seatCount} Seat(s) Booked</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">{item.travelDate}</p>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.status === "confirmed" ? "bg-green-50 text-green-700 dark:bg-green-950/20" : "bg-gray-100 text-gray-600"
                      }`}>{item.status}</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      {item.status === "confirmed" ? (
                        <button
                          onClick={() => updateStatus("bus_bookings", item.id, "completed")}
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1.5"
                        >
                          Complete
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">No action</span>
                      )}
                    </td>
                  </tr>
                ))}

                {activeTab === "dining" && dining.map(item => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="py-4 pl-2 font-mono text-[10px] text-muted-foreground">#{item.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-foreground">{item.guestName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.guestPhone}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">{item.restaurantName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.peopleCount} Guest(s)</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">{item.reservationDate}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.reservationTime}</p>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.status === "confirmed" ? "bg-green-50 text-green-700 dark:bg-green-950/20" : "bg-gray-100 text-gray-600"
                      }`}>{item.status}</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      {item.status === "confirmed" ? (
                        <button
                          onClick={() => updateStatus("restaurant_reservations", item.id, "completed")}
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1.5"
                        >
                          Complete
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">No action</span>
                      )}
                    </td>
                  </tr>
                ))}

                {activeTab === "prasad" && prasad.map(item => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="py-4 pl-2 font-mono text-[10px] text-muted-foreground">#{item.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-foreground">{item.recipientName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.recipientPhone}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground max-w-xs truncate">{item.items}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">Type: {item.deliveryType}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">Total: ₹{item.totalAmount}</p>
                      {item.address && <p className="text-[10px] text-muted-foreground max-w-xs truncate mt-0.5">{item.address}</p>}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20" : "bg-green-50 text-green-700 dark:bg-green-950/20"
                      }`}>{item.status}</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      {item.status === "pending" ? (
                        <button
                          onClick={() => updateStatus("prashad_orders", item.id, "completed")}
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1.5"
                        >
                          Serve Order
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Shipped / Picked Up</span>
                      )}
                    </td>
                  </tr>
                ))}

                {activeTab === "offerings" && offerings.map(item => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="py-4 pl-2 font-mono text-[10px] text-muted-foreground">#{item.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-foreground">Devotee Account</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{item.profileId.slice(0, 8)}...</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground max-w-xs truncate">{item.items}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-foreground">Total: Rs.{item.totalAmount}</p>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20" : "bg-green-50 text-green-700"
                      }`}>{item.status}</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      {item.status === "pending" ? (
                        <button
                          onClick={() => updateStatus("offering_orders", item.id, "completed")}
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1.5"
                        >
                          Hand Over Kit
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic font-semibold text-green-600">Collected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
