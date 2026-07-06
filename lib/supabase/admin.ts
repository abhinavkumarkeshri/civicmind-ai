import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — SERVER-SIDE ONLY, never import in client components.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY, which bypasses Row Level Security entirely.
 * Only use this for operations that:
 *   1. Happen immediately after a legitimate signup (no user session exists yet), or
 *   2. Are already gated by an explicit server-side check (e.g. admin allowlist).
 *
 * Never expose this client or the service role key to the browser.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local (get it from ' +
        'Supabase Dashboard → Settings → API → service_role key).',
    )
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
