"use client"

import { useState } from "react"
import { AdminLoginScreen } from "@/components/admin/screens/admin-login"
import { AdminWorkspace } from "@/components/admin/admin-workspace"
import { type AdminUser } from "@/lib/admin-data"

/**
 * AdminShell is the standalone entry point for /admin.
 * It shows the login screen first, then delegates to AdminWorkspace.
 */
export function AdminShell() {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)

  if (!currentAdmin) {
    return <AdminLoginScreen onLogin={(user) => setCurrentAdmin(user)} />
  }

  return (
    <AdminWorkspace
      initialUser={currentAdmin}
      onExitAdmin={() => setCurrentAdmin(null)}
    />
  )
}
