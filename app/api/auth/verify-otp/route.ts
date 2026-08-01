import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOtp, consumeOtp } from '@/lib/otp/otp'

const REASON_MESSAGES: Record<string, string> = {
  not_found: 'No verification code was requested for this email. Please request a new one.',
  expired: 'This code has expired. Please request a new one.',
  too_many_attempts: 'Too many incorrect attempts. Please request a new code.',
  incorrect: 'Incorrect code. Please try again.',
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'email and otp are required' }, { status: 400 })
    }

    const result = await verifyOtp(email, 'signup', otp)
    if (!result.ok) {
      return NextResponse.json({ error: REASON_MESSAGES[result.reason] }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Mark this account's email as verified in our own profiles table.
    // (Supabase's own "Confirm email" setting is left OFF — see setup
    // notes — so this flag is the sole gate the login pages check.)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await supabase.from('profiles').update({ email_verified: true }).eq('id', profile.id)

    // Also flip Supabase Auth's own confirmation flag for consistency.
    await supabase.auth.admin.updateUserById(profile.id, { email_confirm: true })

    await consumeOtp(email, 'signup')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[verify-otp] error:', error)
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
