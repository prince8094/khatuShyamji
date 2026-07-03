import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "./supabase"

export interface AuthContext {
  user: any
  token: string
}

export interface AdminContext extends AuthContext {
  admin: any
  roles: string[]
}

export function apiResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function verifyAuth(req: Request): Promise<AuthContext | null> {
  try {
    const authHeader = req.headers.get("authorization") || ""
    if (!authHeader.startsWith("Bearer ")) {
      return null
    }
    const token = authHeader.substring(7)
    if (!token) return null

    // Development Mode devotee bypass for any phone number
    if (token.startsWith("DEV_TOKEN_")) {
      const phoneDigits = token.substring(10)

      const { data: devProfile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .like("phone", `%${phoneDigits}`)
        .maybeSingle()

      if (devProfile) {
        return {
          user: {
            id: devProfile.id,
            email: `${phoneDigits}@devotee.com`,
            user_metadata: {
              name: devProfile.name,
              city: devProfile.city
            }
          },
          token
        }
      }
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      console.error("verifyAuth failed: supabase.auth.getUser error:", error ? error.message : "No user returned")
      return null
    }

    return { user, token }
  } catch (err) {
    console.error("Auth verification failed:", err)
    return null
  }
}

export async function verifyAdmin(req: Request, requiredRole?: string): Promise<AdminContext | null> {
  const auth = await verifyAuth(req)
  if (!auth) return null

  try {
    // Check if user is registered in the public admins table
    const { data: adminRecord, error: adminError } = await supabaseAdmin
      .from("admins")
      .select(`
        *,
        admin_roles_bridge (
          role_key
        )
      `)
      .eq("auth_user_id", auth.user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (adminError || !adminRecord) {
      console.error("verifyAdmin failed: admin record error or not found. adminRecord:", adminRecord, "error:", adminError ? adminError.message : "None")
      return null
    }

    const roles = adminRecord.admin_roles_bridge
      ? adminRecord.admin_roles_bridge.map((b: any) => b.role_key)
      : []

    if (requiredRole && !roles.includes(requiredRole) && !roles.includes("super-admin")) {
      console.error("verifyAdmin failed: missing required role:", requiredRole, "actual roles:", roles)
      return null
    }

    return {
      ...auth,
      admin: adminRecord,
      roles
    }
  } catch (err) {
    console.error("Admin verification failed:", err)
    return null
  }
}
