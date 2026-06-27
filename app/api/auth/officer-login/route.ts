import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Step 1: Sign in to get the user id
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Login failed' }, { status: 401 })
    }

    // Step 2: Fetch officer record BEFORE deciding whether to keep the session
    const { data: officerData, error: officerError } = await supabase
      .from('officers')
      .select('status')
      .eq('user_id', authData.user.id)
      .maybeSingle()      // ← was .single() which throws 406 when no row found

    if (officerError) {
      // Unexpected DB error — sign out and report
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Failed to verify officer record. Please try again.' }, { status: 500 })
    }

    if (!officerData) {
      // Signed-up user exists in auth but has no officer row (edge case)
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Officer record not found. Please complete registration or contact an administrator.' },
        { status: 404 },
      )
    }

    // Step 3: Enforce status — sign out for anything other than 'active'
    if (officerData.status !== 'active') {
      await supabase.auth.signOut()

      const STATUS_MESSAGES: Record<string, { error: string; message: string }> = {
        pending: {
          error: 'Pending Approval',
          message: 'Your officer account is pending admin approval. You will be notified once approved.',
        },
        suspended: {
          error: 'Account Suspended',
          message: 'Your officer account has been suspended. Please contact an administrator.',
        },
        rejected: {
          error: 'Application Rejected',
          message: 'Your officer application was rejected. Please contact an administrator.',
        },
      }

      const msg = STATUS_MESSAGES[officerData.status] ?? {
        error: 'Account Inactive',
        message: 'Your officer account is not active. Please contact an administrator.',
      }

      return NextResponse.json({ ...msg, status: officerData.status }, { status: 403 })
    }

    // Step 4: Active officer — session is already set via signInWithPassword cookie
    return NextResponse.json({ success: true, userId: authData.user.id, status: 'active' }, { status: 200 })
  } catch (error) {
    console.error('[v0] Officer login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
