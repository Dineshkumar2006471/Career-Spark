/*
 * Supabase client initialization for browser-side auth and data access.
 * It exists so Phase 2 auth can reuse one configured client.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL // Supabase project URL used by the public browser client.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY // Supabase publishable/anon key safe for browser requests with RLS.

// Creates the Supabase browser client and returns null until env values are configured.
function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = createSupabaseBrowserClient()
