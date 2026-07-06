"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared"
import { motion } from "framer-motion"
import { LiveDot } from "@/components/admin/admin-shared"
import {
  adminRoles,
  type AdminScreenKey,
  type AdminUser,
} from "@/lib/admin-data"

// Screens
import { RoleHubScreen } from "@/components/admin/screens/role-hub"
import { CommandCenterScreen } from "@/components/admin/screens/command-center"
import { AccommodationScreen } from "@/components/admin/screens/accommodation"
import { ParkingManagementScreen } from "@/components/admin/screens/parking-management"
import { TrafficOpsScreen } from "@/components/admin/screens/traffic-ops"
import { LostFoundAdminScreen } from "@/components/admin/screens/lost-found-admin"
import { SevaManagementScreen } from "@/components/admin/screens/seva-management"
import { TempleInfoAdminScreen } from "@/components/admin/screens/temple-info-admin"
import { DonationManagementScreen } from "@/components/admin/screens/donation-management"
import { EmergencyOpsScreen } from "@/components/admin/screens/emergency-ops"
import { NotificationsAdminScreen } from "@/components/admin/screens/notifications-admin"
import { AdminManagementScreen } from "@/components/admin/screens/admin-management"
import { ApprovalQueueScreen } from "@/components/admin/screens/approval-queue"
import { PilgrimRegistryScreen } from "@/components/admin/screens/pilgrim-registry"
import { CommerceManagementScreen } from "@/components/admin/screens/commerce-management"
import { ReachAdminScreen } from "@/components/admin/screens/reach-admin"
import { CentersAdminScreen } from "@/components/admin/screens/centers-admin"

// Screen titles
const screenTitles: Record<Exclude<AdminScreenKey, "admin-login">, string> = {
  "role-hub": "Role Hub",
  "command-center": "Temple Operations Command Center",
  accommodation: "Accommodation Management",
  "parking-management": "Parking Management",
  "traffic-ops": "Traffic Operations",
  "lost-found-admin": "Lost & Found",
  "seva-management": "Seva Management",
  "temple-info-admin": "Temple Information",
  "donation-management": "Donation Management",
  "emergency-ops": "Emergency Operations",
  "notifications-admin": "Notifications",
  "admin-management": "Admin Management",
  "approval-queue": "Approval Queue",
  "pilgrim-registry": "Pilgrim Registry",
  "commerce-management": "Commerce Management",
  "reach-admin": "How to Reach",
  "centers-admin": "Offline Booking Centers",
}

// Sidebar menu items
const sidebarItems: { key: AdminScreenKey; icon: string; label: string; group: string }[] = [
  { key: "command-center", icon: "Shield", label: "Command Center", group: "Operations" },
  { key: "parking-management", icon: "SquareParking", label: "Parking", group: "Operations" },
  { key: "traffic-ops", icon: "TrafficCone", label: "Traffic", group: "Operations" },
  { key: "emergency-ops", icon: "Siren", label: "Emergency", group: "Operations" },
  { key: "accommodation", icon: "BedDouble", label: "Accommodation", group: "Services" },
  { key: "seva-management", icon: "Heart", label: "Seva", group: "Services" },
  { key: "temple-info-admin", icon: "Landmark", label: "Temple Info", group: "Services" },
  { key: "donation-management", icon: "HandCoins", label: "Donations", group: "Services" },
  { key: "commerce-management", icon: "Wallet", label: "Commerce & Ledger", group: "Services" },
  { key: "reach-admin", icon: "MapPinned", label: "How to Reach", group: "Services" },
  { key: "centers-admin", icon: "Building2", label: "Offline Centers", group: "Services" },
  { key: "notifications-admin", icon: "Bell", label: "Notifications", group: "Communication" },
  { key: "lost-found-admin", icon: "PackageSearch", label: "Lost & Found", group: "Communication" },
  { key: "admin-management", icon: "Users", label: "Admin Users", group: "System" },
  { key: "approval-queue", icon: "ClipboardCheck", label: "Approvals", group: "System" },
  { key: "pilgrim-registry", icon: "BookOpen", label: "Pilgrim Registry", group: "System" },
]

/**
 * AdminWorkspace is the admin shell WITHOUT its own login screen.
 * It receives a pre-authenticated AdminUser and starts at the Role Hub.
 * Used by both:
 *   - The unified entry at `/` (via AppShell → WelcomeScreen admin login)
 *   - The standalone `/admin` route (via AdminShell)
 */
export function AdminWorkspace({
  initialUser,
  onExitAdmin,
  isStandalone = false,
  triggerPwaInstall,
}: {
  initialUser: AdminUser
  onExitAdmin: () => void
  isStandalone?: boolean
  triggerPwaInstall?: () => void
}) {
  const [screen, setScreen] = useState<AdminScreenKey>("role-hub")
  const [currentAdmin] = useState<AdminUser>(initialUser)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  const navigate = (s: AdminScreenKey) => {
    setScreen(s)
    setDrawerOpen(false)
    setShowRoleSwitcher(false)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  const handleLogout = () => {
    onExitAdmin()
  }

  // Filter sidebar items based on user roles
  const getMenuItems = () => {
    const isSuperAdmin = currentAdmin.roles.includes("super-admin")
    if (isSuperAdmin) return sidebarItems

    const roleScreenMap: Record<string, AdminScreenKey[]> = {
      accommodation: ["accommodation"],
      parking: ["parking-management"],
      traffic: ["traffic-ops"],
      "lost-found": ["lost-found-admin"],
      "temple-info": ["temple-info-admin"],
      donation: ["donation-management"],
      emergency: ["emergency-ops"],
    }

    const allowedScreens = new Set<AdminScreenKey>(["notifications-admin"])
    for (const role of currentAdmin.roles) {
      const screens = roleScreenMap[role]
      if (screens) screens.forEach((s) => allowedScreens.add(s))
    }

    return sidebarItems.filter((item) => allowedScreens.has(item.key))
  }

  const menuItems = getMenuItems()
  const showHeaderAndNav = screen !== "role-hub"

  // Group menu items
  const groups = ["Operations", "Services", "Communication", "System"]
  const groupedItems = groups
    .map((g) => ({ group: g, items: menuItems.filter((i) => i.group === g) }))
    .filter((g) => g.items.length > 0)

  // Role Hub — full page, no shell
  if (screen === "role-hub") {
    return <RoleHubScreen user={currentAdmin} navigate={navigate} onLogout={handleLogout} />
  }

  // Workspace shell
  return (
    <div className="flex min-h-screen w-full bg-[#FFF8F0] text-foreground">
      {/* Desktop Sidebar */}
      {showHeaderAndNav && (
        <aside
          className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 flex-col border-r border-border bg-card shadow-lg"
          style={{ position: "sticky", top: 0, height: "100vh" }}
        >
          {/* Sidebar Header */}
          <div
            className="relative overflow-hidden px-5 pb-5 pt-5 text-white shrink-0"
            style={{ backgroundImage: "linear-gradient(135deg, #D97706 0%, #D4AF37 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "200px" }}
            />
            <div className="relative flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white p-1 shadow-lg border border-white/30">
                <Image
                  src="/images/khatu-shyam-logo.png"
                  alt="Khatu Shyam Ji"
                  width={32}
                  height={32}
                  className="size-full object-contain"
                />
              </span>
              <div>
                <p className="font-heading text-sm font-bold tracking-wide drop-shadow-sm">TOCC</p>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/80">Admin Portal</p>
              </div>
            </div>
            {/* Admin card */}
            <div className="relative mt-4 flex items-center gap-2.5 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 p-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-white font-heading text-sm font-bold text-[#D97706] shrink-0">
                {currentAdmin.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentAdmin.name}</p>
                <p className="text-[10px] text-white/70 truncate">{currentAdmin.id}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {/* Back to Role Hub */}
            <button
              onClick={() => navigate("role-hub")}
              className="mb-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition"
            >
              <Icon name="ChevronLeft" className="size-4" /> Back to Role Hub
            </button>

            {groupedItems.map((group) => (
              <div key={group.group} className="mb-4">
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = screen === item.key
                    return (
                      <button
                        key={item.key}
                        onClick={() => navigate(item.key)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                          active ? "bg-[#D97706]/10 text-[#D97706]" : "text-foreground hover:bg-[#D97706]/5",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-lg shadow-sm shrink-0",
                            active ? "bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white" : "bg-card text-[#D97706] border border-border",
                          )}
                        >
                          <Icon name={item.icon} className="size-4" />
                        </span>
                        <span className="text-[13px] font-bold leading-tight font-heading truncate">
                          {item.label}
                        </span>
                        {active && <span className="size-1.5 rounded-full bg-[#D97706] shrink-0 ml-auto" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            
            {/* PWA Install Button in Admin Sidebar */}
            {!isStandalone && triggerPwaInstall && (
              <div className="mt-2 pt-2 border-t border-border">
                <button
                  onClick={triggerPwaInstall}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-200 text-[#D97706] hover:bg-[#D97706]/5"
                >
                  <span className="grid size-8 place-items-center rounded-lg shadow-sm shrink-0 bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white">
                    <Icon name="Download" className="size-4" />
                  </span>
                  <span className="text-[13px] font-bold leading-tight font-heading truncate">
                    Install App
                  </span>
                </button>
              </div>
            )}
          </nav>

          <div className="p-4 text-center shrink-0 border-t border-border">
            <p className="text-[10px] font-heading tracking-widest text-muted-foreground">ADMIN V2.0</p>
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
            >
              <Icon name="LogOut" className="size-3.5" /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        {showHeaderAndNav && (
          <header
            className="sticky top-0 z-30 shrink-0 overflow-hidden text-white shadow-md"
            style={{ backgroundImage: "linear-gradient(135deg, #D97706 0%, #B45309 100%)" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "250px" }}
            />
            <div className="relative flex h-14 items-center gap-3 px-4 md:px-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden grid size-9 shrink-0 place-items-center rounded-lg bg-white/20 transition hover:bg-white/30"
                aria-label="Open menu"
              >
                <Icon name="Menu" className="size-5" />
              </button>

              {/* Logo */}
              <span className="lg:hidden grid size-8 shrink-0 place-items-center rounded-lg bg-white p-0.5 shadow border border-white/30">
                <Image
                  src="/images/khatu-shyam-logo.png"
                  alt="TOCC"
                  width={28}
                  height={28}
                  className="size-full object-contain"
                />
              </span>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-heading text-sm font-bold leading-tight drop-shadow-sm md:text-base">
                  {(screenTitles as Record<string, string>)[screen] || "Admin"}
                </h1>
                <p className="truncate text-[9px] uppercase tracking-wider text-white/70">
                  Temple Operations Command Center
                </p>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-1.5">
                {/* Role Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                    className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/30"
                  >
                    <Icon name="Repeat" className="size-3.5" />
                    <span className="hidden md:inline">Switch Role</span>
                  </button>
                  {showRoleSwitcher && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl z-50">
                      {adminRoles
                        .filter((r) => currentAdmin.roles.includes(r.key))
                        .map((role) => (
                          <button
                            key={role.key}
                            onClick={() => navigate(role.screen)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-[#FFF3E0] transition"
                          >
                            <span className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br ${role.color} text-white shadow-sm`}>
                              <Icon name={role.icon} className="size-4" />
                            </span>
                            <span className="text-xs font-bold text-foreground truncate">{role.name.replace("Temple Operations Command Center", "TOCC")}</span>
                          </button>
                        ))}
                      <hr className="my-1.5 border-border" />
                      <button
                        onClick={() => navigate("role-hub")}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-muted-foreground hover:bg-muted/50 transition"
                      >
                        <Icon name="LayoutGrid" className="size-4" /> All Workspaces
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <button
                  onClick={() => navigate("notifications-admin")}
                  className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-white/20 transition hover:bg-white/30"
                >
                  <Icon name="Bell" className="size-4" />
                  <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-1 ring-white/50">
                    5
                  </span>
                </button>

                {/* Admin avatar */}
                <button
                  onClick={() => navigate("role-hub")}
                  className="hidden sm:grid size-9 shrink-0 place-items-center rounded-lg bg-white font-heading text-xs font-bold text-[#D97706] shadow"
                >
                  {currentAdmin.initials}
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={cn("flex-1 w-full max-w-5xl mx-auto px-4 md:px-8", showHeaderAndNav ? "pt-5 pb-24 lg:pb-8" : "")}>
          {screen === "command-center" && <CommandCenterScreen navigate={navigate} />}
          {screen === "accommodation" && <AccommodationScreen navigate={navigate} />}
          {screen === "parking-management" && <ParkingManagementScreen navigate={navigate} currentAdmin={currentAdmin} />}
          {screen === "traffic-ops" && <TrafficOpsScreen navigate={navigate} currentAdmin={currentAdmin} />}
          {screen === "lost-found-admin" && <LostFoundAdminScreen navigate={navigate} />}
          {screen === "seva-management" && <SevaManagementScreen navigate={navigate} />}
          {screen === "temple-info-admin" && <TempleInfoAdminScreen navigate={navigate} currentAdmin={currentAdmin} />}
          {screen === "donation-management" && <DonationManagementScreen navigate={navigate} />}
          {screen === "emergency-ops" && <EmergencyOpsScreen navigate={navigate} />}
          {screen === "notifications-admin" && <NotificationsAdminScreen navigate={navigate} />}
          {screen === "admin-management" && <AdminManagementScreen navigate={navigate} />}
          {screen === "approval-queue" && <ApprovalQueueScreen navigate={navigate} />}
          {screen === "pilgrim-registry" && <PilgrimRegistryScreen navigate={navigate} />}
          {screen === "commerce-management" && <CommerceManagementScreen navigate={navigate} />}
          {screen === "reach-admin" && <ReachAdminScreen navigate={navigate} />}
          {screen === "centers-admin" && <CentersAdminScreen navigate={navigate} />}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {showHeaderAndNav && (
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 w-full border-t border-border bg-card/95 backdrop-blur-md pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-5 h-14 w-full">
            {[
              { key: "command-center" as AdminScreenKey, icon: "Shield", label: "TOCC" },
              { key: "accommodation" as AdminScreenKey, icon: "BedDouble", label: "Hotels" },
              { key: "parking-management" as AdminScreenKey, icon: "SquareParking", label: "Parking" },
              { key: "approval-queue" as AdminScreenKey, icon: "ClipboardCheck", label: "Approvals" },
              { key: "role-hub" as AdminScreenKey, icon: "LayoutGrid", label: "Roles" },
            ].map((item) => {
              const active = screen === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className="relative flex flex-col items-center justify-center gap-0.5 h-full w-full min-w-0 px-1 transition-transform active:scale-95"
                >
                  {active && <span className="absolute -top-0.5 w-8 h-1 bg-[#D97706] rounded-b-full" />}
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full transition-all duration-300",
                      active ? "bg-gradient-to-r from-[#D97706] to-[#D4AF37] text-white shadow-md -translate-y-0.5" : "text-muted-foreground",
                    )}
                  >
                    <Icon name={item.icon} className="size-4" />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] w-full text-center truncate font-semibold transition-colors",
                      active ? "text-[#D97706]" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {/* Mobile Drawer */}
      {drawerOpen && showHeaderAndNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col overflow-y-auto bg-background shadow-2xl duration-300 animate-in slide-in-from-left">
            {/* Drawer header */}
            <div
              className="relative overflow-hidden px-5 pb-5 pt-5 text-white shrink-0"
              style={{ backgroundImage: "linear-gradient(135deg, #D97706 0%, #D4AF37 100%)" }}
            >
              <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "url(/images/mandala-pattern.png)", backgroundSize: "200px" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white p-1 shadow-lg">
                    <Image src="/images/khatu-shyam-logo.png" alt="TOCC" width={32} height={32} className="size-full object-contain" />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-bold">TOCC</p>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-white/80">Admin Portal</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="grid size-8 place-items-center rounded-lg bg-black/20">
                  <Icon name="X" className="size-4 text-white" />
                </button>
              </div>
              <div className="relative mt-3 flex items-center gap-2.5 rounded-xl bg-black/20 border border-white/10 p-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-white font-heading text-sm font-bold text-[#D97706]">
                  {currentAdmin.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentAdmin.name}</p>
                  <p className="text-[10px] text-white/70">{currentAdmin.id}</p>
                </div>
              </div>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 px-3 py-4">
              <button
                onClick={() => navigate("role-hub")}
                className="mb-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition"
              >
                <Icon name="ChevronLeft" className="size-4" /> Back to Role Hub
              </button>
              {groupedItems.map((group) => (
                <div key={group.group} className="mb-4">
                  <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {group.group}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = screen === item.key
                      return (
                        <button
                          key={item.key}
                          onClick={() => navigate(item.key)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                            active ? "bg-[#D97706]/10 text-[#D97706]" : "text-foreground hover:bg-[#D97706]/5",
                          )}
                        >
                          <span className={cn("grid size-8 place-items-center rounded-lg shadow-sm shrink-0", active ? "bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white" : "bg-card text-[#D97706] border border-border")}>
                            <Icon name={item.icon} className="size-4" />
                          </span>
                          <span className="text-[13px] font-bold font-heading">{item.label}</span>
                          {active && <span className="size-1.5 rounded-full bg-[#D97706] ml-auto" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              
              {/* PWA Install Button in Admin Mobile Drawer */}
              {!isStandalone && triggerPwaInstall && (
                <div className="mt-2 pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setDrawerOpen(false)
                      triggerPwaInstall()
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-200 text-[#D97706] hover:bg-[#D97706]/5"
                  >
                    <span className="grid size-8 place-items-center rounded-lg shadow-sm shrink-0 bg-gradient-to-br from-[#D97706] to-[#D4AF37] text-white">
                      <Icon name="Download" className="size-4" />
                    </span>
                    <span className="text-[13px] font-bold leading-tight font-heading truncate">
                      Install App
                    </span>
                  </button>
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
              >
                <Icon name="LogOut" className="size-3.5" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
