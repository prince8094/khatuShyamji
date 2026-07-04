"use client"

import { useEffect, useRef, useState } from "react"
import { Icon } from "@/components/shared"

interface TrafficMapProps {
  showTempleRoute?: boolean
  showParkingRoute?: boolean
  showAlternativeRoute?: boolean
  showTrafficLayer?: boolean
  alerts?: Array<{
    id: string
    alert_code: string
    latitude: number | null
    longitude: number | null
    alert_type: string
    message: string
    severity: string
  }>
  adminMode?: boolean
  onMapClick?: (lat: number, lng: number) => void
  routes?: any[]
  parkingBlocks?: any[]
}

export default function TrafficMap({
  showTempleRoute = true,
  showParkingRoute = true,
  showAlternativeRoute = true,
  showTrafficLayer = true,
  alerts = [],
  adminMode = false,
  onMapClick,
  routes = [],
  parkingBlocks = [],
}: TrafficMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [apiError, setApiError] = useState(false)
  const [adminPin, setAdminPin] = useState<{ lat: number; lng: number } | null>(null)

  // Coordinate Data
  const CENTER = { lat: 27.3640, lng: 75.5100 }
  
  const ROUTE_COORDINATES = {
    temple: [
      { lat: 27.3512, lng: 75.5629 }, // Ringas Junction
      { lat: 27.3565, lng: 75.5280 }, // Midpoint
      { lat: 27.3602, lng: 75.4851 }, // Parking A Entry
      { lat: 27.3650, lng: 75.4815 }, // Ringas Road Bypass
      { lat: 27.3672, lng: 75.4795 }, // Toran Dwar
      { lat: 27.3693, lng: 75.4746 }, // Temple Gate
    ],
    parking: [
      { lat: 27.3512, lng: 75.5629 }, // Ringas Junction
      { lat: 27.3550, lng: 75.5200 }, // Lot C Bypass
      { lat: 27.3602, lng: 75.4851 }, // Lot A Entry
      { lat: 27.3638, lng: 75.4925 }, // Lot B Entry
    ],
    alternative: [
      { lat: 27.3512, lng: 75.5629 }, // Ringas Junction
      { lat: 27.3540, lng: 75.5350 }, // Bypass turnoff
      { lat: 27.3750, lng: 75.4900 }, // North Bypass Loop
      { lat: 27.3768, lng: 75.4810 }, // Khatu North Bypass
      { lat: 27.3730, lng: 75.4760 }, // North Gate
    ]
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  useEffect(() => {
    if (!apiKey) {
      console.warn("No Google Maps API Key found, loading interactive SVG fallback.")
      return
    }

    if (window.google) {
      setGoogleMapsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => setGoogleMapsLoaded(true)
    script.onerror = () => setApiError(true)
    document.head.appendChild(script)
  }, [apiKey])

  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: CENTER,
        zoom: 13,
        mapId: "DEMO_MAP_ID", // standard demo ID for modern styling
        styles: [
          {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{ visibility: "on" }]
          }
        ]
      })

      // 1. Render Traffic Layer
      const trafficLayer = new window.google.maps.TrafficLayer()
      if (showTrafficLayer) {
        trafficLayer.setMap(map)
      }

      // 2. Render Routes
      const polylines: google.maps.Polyline[] = []
      const markers: google.maps.Marker[] = []

      const getCongestionColor = (status: string) => {
        const st = status?.toLowerCase()
        if (st === "smooth" || st === "light") return "#10B981" // Emerald Green
        if (st === "moderate") return "#F59E0B" // Amber
        if (st === "heavy") return "#EA580C" // Orange
        if (st === "congested" || st === "blocked") return "#EF4444" // Red
        return "#3B82F6" // Default Blue
      }

      if (routes && routes.length > 0) {
        routes.forEach((route) => {
          if (route.coordinates && Array.isArray(route.coordinates)) {
            const poly = new window.google.maps.Polyline({
              path: route.coordinates,
              geodesic: true,
              strokeColor: getCongestionColor(route.status),
              strokeOpacity: 0.85,
              strokeWeight: 6
            })
            poly.setMap(map)
            polylines.push(poly)

            // Add a marker at the start of the route
            if (route.coordinates.length > 0) {
              const start = route.coordinates[0]
              const routeMarker = new window.google.maps.Marker({
                position: start,
                map,
                title: route.name,
                label: {
                  text: "🛣️",
                  fontSize: "12px"
                }
              })
              const routeInfo = new window.google.maps.InfoWindow({
                content: `<div style="padding: 6px; font-family: sans-serif;"><p style="margin:0; font-weight:bold; font-size:12px;">${route.name}</p><p style="margin:4px 0 0 0; font-size:11px;">Status: <span style="font-weight:bold; color:${getCongestionColor(route.status)}">${route.status.toUpperCase()}</span></p><p style="margin:2px 0 0 0; font-size:11px;">ETA: ${route.eta}</p></div>`
              })
              routeMarker.addListener("click", () => {
                routeInfo.open(map, routeMarker)
              })
              markers.push(routeMarker)
            }
          }
        })
      } else {
        // Fallback static routes
        if (showTempleRoute) {
          const templePath = new window.google.maps.Polyline({
            path: ROUTE_COORDINATES.temple,
            geodesic: true,
            strokeColor: "#F59E0B", // Saffron
            strokeOpacity: 0.85,
            strokeWeight: 6
          })
          templePath.setMap(map)
          polylines.push(templePath)
        }

        if (showParkingRoute) {
          const parkingPath = new window.google.maps.Polyline({
            path: ROUTE_COORDINATES.parking,
            geodesic: true,
            strokeColor: "#D97706", // Dark Amber
            strokeOpacity: 0.8,
            strokeWeight: 5
          })
          parkingPath.setMap(map)
          polylines.push(parkingPath)
        }

        if (showAlternativeRoute) {
          const altPath = new window.google.maps.Polyline({
            path: ROUTE_COORDINATES.alternative,
            geodesic: true,
            strokeColor: "#10B981", // Emerald
            strokeOpacity: 0.8,
            strokeWeight: 5
          })
          altPath.setMap(map)
          polylines.push(altPath)
        }
      }

      // 3. Render Temple Destination Marker
      const templeMarker = new window.google.maps.Marker({
        position: { lat: 27.36965159, lng: 75.39855581 },
        map,
        title: "Shree Khatu Shyam Ji Temple",
        label: {
          text: "🛕",
          fontSize: "16px"
        }
      })
      const templeInfo = new window.google.maps.InfoWindow({
        content: `<div style="padding: 6px; font-family: sans-serif; font-weight: bold; font-size: 12px;">Shree Khatu Shyam Ji Temple</div>`
      })
      templeMarker.addListener("click", () => {
        templeInfo.open(map, templeMarker)
      })
      markers.push(templeMarker)

      // 4. Render Database Parking Block Markers
      if (parkingBlocks && parkingBlocks.length > 0) {
        parkingBlocks.forEach((block) => {
          if (block.latitude && block.longitude) {
            const parkingMarker = new window.google.maps.Marker({
              position: { lat: Number(block.latitude), lng: Number(block.longitude) },
              map,
              title: block.name,
              label: {
                text: "🅿️",
                fontSize: "12px"
              }
            })
            const parkingInfo = new window.google.maps.InfoWindow({
              content: `<div style="padding: 6px; font-family: sans-serif;"><p style="margin:0; font-weight:bold; font-size:12px;">${block.name} (${block.block_code})</p><p style="margin:4px 0 0 0; font-size:11px;">Occupancy: ${block.occupied} / ${block.total_capacity}</p><p style="margin:2px 0 0 0; font-size:11px;">Status: ${block.status.toUpperCase()}</p></div>`
            })
            parkingMarker.addListener("click", () => {
              parkingInfo.open(map, parkingMarker)
            })
            markers.push(parkingMarker)
          }
        })
      }

      // 5. Render Database Traffic Alert Markers
      alerts.forEach((alert) => {
        if (alert.latitude && alert.longitude) {
          const isClosure = alert.alert_type === "closure"
          const pinColor = isClosure ? "#EF4444" : "#F59E0B" // Red for closures, Orange for diversions
          const pinLabel = isClosure ? "⛔" : "⚠️"

          const marker = new window.google.maps.Marker({
            position: { lat: Number(alert.latitude), lng: Number(alert.longitude) },
            map,
            title: alert.message,
            label: {
              text: pinLabel,
              fontSize: "14px"
            }
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; font-family: sans-serif; max-width: 200px;">
                <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: ${pinColor}; text-transform: uppercase;">
                  ${alert.alert_type} (${alert.severity})
                </h4>
                <p style="margin: 0; font-size: 11px; color: #4B5563; line-height: 1.4;">${alert.message}</p>
              </div>
            `
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })

          markers.push(marker)
        }
      })

      // 6. Admin Click-to-Pin handler
      let selectedMarker: google.maps.Marker | null = null

      if (adminMode && onMapClick) {
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng
          if (latLng) {
            const lat = latLng.lat()
            const lng = latLng.lng()
            setAdminPin({ lat, lng })
            onMapClick(lat, lng)

            if (selectedMarker) {
              selectedMarker.setMap(null)
            }

            selectedMarker = new window.google.maps.Marker({
              position: { lat, lng },
              map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#3B82F6",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2
              },
              title: "Selected Location"
            })
          }
        })
      }

      return () => {
        polylines.forEach((p) => p.setMap(null))
        markers.forEach((m) => m.setMap(null))
        if (selectedMarker) selectedMarker.setMap(null)
      }
    } catch (err) {
      console.error("Map initialization failed", err)
      setApiError(true)
    }
  }, [googleMapsLoaded, showTempleRoute, showParkingRoute, showAlternativeRoute, showTrafficLayer, alerts, adminMode, routes, parkingBlocks])

  // Fallback Premium SVG Vector Map
  if (!apiKey || apiError) {
    return (
      <div className="relative rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#FAF6F0] to-[#F5EFEB] p-5 shadow-inner select-none h-[350px] overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-amber-200/50 pb-2 mb-2">
          <span className="text-[10px] font-extrabold text-[#D97706] uppercase tracking-wider flex items-center gap-1">
            <Icon name="Navigation" className="size-3 animate-pulse" />
            Interactive Road Layout (Google Maps Key Offline)
          </span>
          <span className="text-[9px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            Scale Verified
          </span>
        </div>

        {/* Vector SVG Roads representation */}
        <div className="relative flex-1 bg-white/70 rounded-2xl border border-amber-100 flex items-center justify-center p-4">
          <svg 
            className="w-full h-full max-h-[260px] cursor-crosshair" 
            viewBox="0 0 400 240"
            onClick={(e) => {
              if (!adminMode || !onMapClick) return
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              const pctX = x / rect.width
              const pctY = y / rect.height

              const minLng = 75.4500
              const maxLng = 75.5800
              const maxLat = 27.3800
              const minLat = 27.3400

              const clickLng = minLng + pctX * (maxLng - minLng)
              const clickLat = maxLat - pctY * (maxLat - minLat)

              setAdminPin({ lat: clickLat, lng: clickLng })
              onMapClick(clickLat, clickLng)
            }}
          >
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F5ECE3" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Base Roads Layout (Gray background lines) */}
            <path d="M 30,210 Q 150,150 220,110 T 360,50" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
            <path d="M 30,210 Q 150,165 220,135 T 280,120" fill="none" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round" />
            <path d="M 30,210 Q 180,200 300,100 T 370,80" fill="none" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round" />

            {/* Render Temple Route */}
            {showTempleRoute && (
              <path 
                d="M 30,210 Q 150,150 220,110 T 360,50" 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="5" 
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Render Parking Route */}
            {showParkingRoute && (
              <path 
                d="M 30,210 Q 150,165 220,135 T 280,120" 
                fill="none" 
                stroke="#D97706" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Render Alternative Bypass Route */}
            {showAlternativeRoute && (
              <path 
                d="M 30,210 Q 180,200 300,100 T 370,80" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray="6,4"
                className="transition-all duration-300"
              />
            )}

            {/* Key Pins */}
            {/* Ringas Junction */}
            <g transform="translate(30, 210)">
              <circle r="6" fill="#1E293B" stroke="#ffffff" strokeWidth="2" />
              <text x="10" y="4" fontSize="8" fontWeight="bold" fill="#64748B">Ringas Jnc</text>
            </g>

            {/* Khatu Temple */}
            <g transform="translate(360, 50)">
              <circle r="7" fill="#EF4444" stroke="#ffffff" strokeWidth="2" />
              <text x="-40" y="-10" fontSize="9" fontWeight="bold" fill="#991B1B">Khatu Temple</text>
            </g>

            {/* Lot A Parking */}
            <g transform="translate(220, 135)">
              <circle r="5" fill="#D97706" stroke="#ffffff" strokeWidth="1.5" />
              <text x="8" y="10" fontSize="7" fontWeight="bold" fill="#B45309">Lot A</text>
            </g>

            {/* Traffic representation overlays (animated pulses) */}
            {showTrafficLayer && (
              <>
                <circle cx="150" cy="150" r="3" fill="#EF4444" className="animate-ping" />
                <circle cx="280" cy="80" r="3" fill="#10B981" />
              </>
            )}

            {/* Render custom warnings/closures from alerts list */}
            {alerts.map((item, idx) => {
              // Distribute warnings visually based on their index if they don't have visual maps
              const positions = [
                { x: 140, y: 145 },
                { x: 260, y: 120 },
                { x: 220, y: 180 }
              ]
              const pos = positions[idx % positions.length]
              const isClosure = item.alert_type === "closure"

              return (
                <g 
                  key={item.id} 
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => window.alert(item.message)}
                >
                  <circle r="8" fill={isClosure ? "#EF4444" : "#F59E0B"} stroke="#ffffff" strokeWidth="1.5" />
                  <text x="-4" y="3" fontSize="8" fill="#ffffff" fontWeight="extrabold">
                    {isClosure ? "!" : "?"}
                  </text>
                </g>
              )
            })}

            {/* Admin mode pointer simulator */}
            {adminMode && adminPin && (() => {
              const minLng = 75.4500
              const maxLng = 75.5800
              const maxLat = 27.3800
              const minLat = 27.3400
              const cx = ((adminPin.lng - minLng) / (maxLng - minLng)) * 400
              const cy = ((maxLat - adminPin.lat) / (maxLat - minLat)) * 240
              return (
                <g transform={`translate(${cx}, ${cy})`}>
                  <circle r="6" fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" className="animate-bounce" />
                  <text x="10" y="4" fontSize="7" fontWeight="bold" fill="#3B82F6">Selected Alert</text>
                </g>
              )
            })()}
          </svg>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-2 leading-relaxed">
          Google Maps live Traffic layer automatically streams closures and highway speed indexes when key is active.
        </p>
      </div>
    )
  }

  // Real Google Maps Container
  return (
    <div className="relative rounded-3xl border border-[#D4AF37]/30 overflow-hidden shadow-md h-[350px]">
      <div ref={mapRef} className="w-full h-full bg-slate-100" />
      {adminMode && (
        <div className="absolute bottom-3 left-3 bg-white/95 border border-border px-3 py-1.5 rounded-xl text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 shadow-sm">
          <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
          Click Map to Set Lat/Long Coordinates
        </div>
      )}
    </div>
  )
}
