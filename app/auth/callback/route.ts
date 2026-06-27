import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/citizen/dashboard'

  if (code) {
    const supabase = await createClient()
    console.log('[v0] Exchanging auth code for session...')
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[v0] Auth exchange error:', error.message)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
    }

    if (!data?.session) {
      console.error('[v0] No session created after code exchange')
      return NextResponse.redirect(`${origin}/auth/error?error=No%20session%20created`)
    }

    console.log('[v0] Auth exchange successful, session created for user:', data.session.user.id)
    
    // Create response that redirects to next, which allows the session cookie to be set
    const response = NextResponse.redirect(`${origin}${next}`)
    return response
  }

  console.error('[v0] No auth code in callback')
  return NextResponse.redirect(`${origin}/auth/error?error=No%20authorization%20code`)
}
