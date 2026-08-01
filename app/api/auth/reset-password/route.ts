import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOtp, consumeOtp } from '@/lib/otp/otp'

const REASON_MESSAGES: Record<string, string> = {
  not_found: 'No reset code was requested for this email. Please request a new one.',
  expired: 'This code has expired. Please request a new one.',
  too_many_attempts: 'Too many incorrect attempts. Please request a new code.',
  incorrect: 'Incorrect code. Please try again.',
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'email, otp, and newPassword are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const result = await verifyOtp(email, 'reset', otp)
    if (!result.ok) {
      return NextResponse.json({ error: REASON_MESSAGES[result.reason] }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await consumeOtp(email, 'reset')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[reset-password] error:', error)
    return NextResponse.json({ error: error.message || 'Reset failed' }, { status: 500 })
  }
}
