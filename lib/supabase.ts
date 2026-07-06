import { createClient } from "@supabase/supabase-js"

const isEnvMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (isEnvMissing) {
  console.warn(
    "Supabase URL or Anon Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment. Using build-time placeholders."
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url-for-build.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key-for-build"
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || "placeholder-key-for-build"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }
})

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})
