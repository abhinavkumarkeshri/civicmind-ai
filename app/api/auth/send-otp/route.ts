import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOtp } from '@/lib/otp/otp'
import { sendOtpEmail } from '@/lib/email/mailer'

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json()

    if (!email || !purpose || !['signup', 'reset'].includes(purpose)) {
      return NextResponse.json({ error: 'email and a valid purpose are required' }, { status: 400 })
    }

    // For password reset, don't reveal whether an account exists — always
    // respond success, but only actually send the email if a profile with
    // this address exists.
    if (purpose === 'reset') {
      const supabase = createAdminClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (!profile) {
        return NextResponse.json({ success: true })
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
