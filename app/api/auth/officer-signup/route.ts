import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, wardId } = await request.json()

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'officer',
          ward_id: wardId,
        },
      },
    })

    if (authError) {
      console.error('[v0] Officer signup auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Create profile — uses the service-role client because at this point
    // there is no authenticated session yet (e.g. when email confirmation
    // is enabled, signUp() does not return a session), so the anon-key
    // client would fail the profiles_insert_own RLS check.
    const adminSupabase = createAdminClient()

    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        role: 'officer',
        ward_id: wardId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('[v0] Profile creation error:', profileError)
      return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 })
    }

    // Create officer record with PENDING status
    const { error: officerError } = await adminSupabase
      .from('officers')
      .upsert({
        user_id: authData.user.id,
        ward_id: wardId || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (officerError) {
      console.error('[v0] Officer record creation error:', officerError)
      return NextResponse.json(
        { error: `Failed to create officer record: ${officerError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Officer signup submitted. Waiting for admin approval.',
        userId: authData.user.id,
        status: 'pending',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[v0] Officer signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
