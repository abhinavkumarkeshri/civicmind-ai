import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAccessAdminPortal } from '@/lib/config/admin-allowlist'

/**
 * Protect admin routes
 * Call this in any admin route that needs authorization
 */
export async function protectAdminRoute(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('[v0] Admin protection - User not authenticated')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check if user is authorized admin
    if (!canAccessAdminPortal(user.email)) {
      console.warn('[v0] Admin protection - Unauthorized access attempt:', user.email)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Verify admin record exists
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      console.warn('[v0] Admin protection - Admin record not found:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Allow access
    return NextResponse.next()
  } catch (error) {
    console.error('[v0] Admin protection error:', error)
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

/**
 * Check admin authorization in client components
 */
export async function requireAdminAuth() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  if (!canAccessAdminPortal(user.email)) {
    throw new Error('Unauthorized admin access')
  }

  return user
}
