import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Auth pages that must always remain reachable, even when logged out
  // (officer/admin have their own login/register/pending pages nested
  // under /officer and /admin, which would otherwise get caught by the
  // blanket "protect everything under /officer" rule below).
  const PUBLIC_AUTH_PATHS = [
    '/officer/login',
    '/officer/register',
    '/officer/pending-approval',
    '/admin/login',
    '/admin/signup',
  ]
  const isPublicAuthPath = PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Protect citizen, officer, and admin app routes — but not their own
  // public login/register pages.
  const isProtected =
    !isPublicAuthPath &&
    (pathname.startsWith('/citizen') ||
      pathname.startsWith('/officer') ||
      pathname.startsWith('/admin'))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    // Send people to the role-appropriate login, not a single generic one.
    if (pathname.startsWith('/officer')) {
      url.pathname = '/officer/login'
    } else if (pathname.startsWith('/admin')) {
      url.pathname = '/admin/login'
    } else {
      url.pathname = '/auth/login'
    }
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from the generic citizen auth pages,
  // routed by their ACTUAL role — not hardcoded to citizen.
  if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const url = request.nextUrl.clone()
    if (profile?.role === 'officer') {
      url.pathname = '/officer/dashboard'
    } else if (profile?.role === 'admin') {
      url.pathname = '/admin/dashboard'
    } else {
      url.pathname = '/citizen/dashboard'
    }
    return NextResponse.redirect(url)
  }

  // Also bounce already-authenticated officers/admins away from their own
  // login/register pages straight to their dashboard.
  if (user && isPublicAuthPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const url = request.nextUrl.clone()
    if (pathname.startsWith('/officer') && profile?.role === 'officer') {
      url.pathname = '/officer/dashboard'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/admin') && profile?.role === 'admin') {
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
