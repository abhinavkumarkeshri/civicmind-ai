import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOtp } from '@/lib/otp/otp'
import { sendOtpEmail } from '@/lib/email/mailer'

export async function POST(request: NextRequest) {
  try {
    const { email, purpose, userId } = await request.json()

    if (!email || !purpose || !['signup', 'reset'].includes(purpose)) {
      return NextResponse.json({ error: 'email and a valid purpose are required' }, { status: 400 })
    }

    // Citizen signup creates the profile row via a DB trigger that
    // predates the profiles.email column, so it's often left NULL.
    // Backfill it here (only if currently null) so this account is
    // findable by email later — for password resets, and so this OTP
    // step itself works reliably.
    if (purpose === 'signup' && userId) {
      const adminSupabase = createAdminClient()
      await adminSupabase
        .from('profiles')
        .update({ email: email.toLowerCase() })
        .eq('id', userId)
        .is('email', null)
    }

    // For password reset: tell the person plainly if this email isn't
    // registered, per explicit request. (Note: this trades away the
    // usual anti-enumeration protection — someone could probe emails to
    // learn which ones have accounts. Fine for this app's threat model,
    // but worth knowing.)
    if (purpose === 'reset') {
      const supabase = createAdminClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (!profile) {
        return NextResponse.json(
          { error: 'You have not registered with this email. Please sign up first.' },
          { status: 404 },
        )
      }
    }

    const otp = await createOtp(email, purpose)
    await sendOtpEmail(email, otp, purpose)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[send-otp] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 })
  }
}
