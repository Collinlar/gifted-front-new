import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. Used only for the one-time claim flow
// to create auth accounts for migrated users without requiring email confirmation.
// Move this to a serverless function before scaling to production.
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
