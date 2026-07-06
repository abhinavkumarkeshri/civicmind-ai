import { createAdminClient } from '@/lib/supabase/admin'
import { canAccessAdminPortal } from '@/lib/config/admin-allowlist'

/**
 * Check if user is an authorized admin
 * Server-side validation only - never trust client-side
 */
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  try {
    // auth.admin.* methods require the service-role key — the regular
    // anon-key client (lib/supabase/server.ts) cannot call getUserById.
    const supabase = createAdminClient()

    // Get user email from Supabase Auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId)

    if (userError || !user?.email) {
      console.error('[v0] Admin verification - User fetch error:', userError)
      return false
    }

    // Check if email is in allowlist
    if (!canAccessAdminPortal(user.email)) {
      console.warn('[v0] Admin verification - Unauthorized email:', user.email)
      return false
    }

    // Verify admin exists in admins table
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.warn('[v0] Admin verification - Admin record not found:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[v0] Admin verification error:', error)
    return false
  }
}

/**
 * Get current user's admin status
 */
export async function getCurrentUserAdminStatus(userId: string): Promise<{ isAdmin: boolean; email?: string }> {
  try {
    const supabase = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.admin.getUserById(userId)

    if (!user?.email) {
      return { isAdmin: false }
    }

    return {
      isAdmin: canAccessAdminPortal(user.email),
      email: user.email,
    }
  } catch (error) {
    console.error('[v0] Get admin status error:', error)
    return { isAdmin: false }
  }
}
