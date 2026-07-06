import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthorizedAdminEmail } from '@/lib/config/admin-allowlist'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (!isAuthorizedAdminEmail(email)) {
      return NextResponse.json(
        { error: 'Unauthorized email. Only authorized email addresses can create admin accounts.' },
        { status: 403 },
      )
    }

    const supabase = await createClient()

    // Check if admin record already exists — if so, just tell them to log in
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id, user_id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin account already exists. Please login.',
        userId: existingAdmin.user_id,
      })
    }

    // Attempt to create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || 'Admin', role: 'admin' },
      },
    })

    // Handle rate-limit gracefully
    if (authError?.message?.includes('rate limit') || authError?.message?.includes('Too many')) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again in a few minutes.' },
        { status: 429 },
      )
    }

    // "User already registered" means they have a citizen/officer account.
    // We can't get their UUID from signUp in this case.
    // Ask them to log in via /admin/login — admin verification still works
    // because verifyAdminAccess checks the admins table by userId obtained
    // AFTER a successful signInWithPassword.
    // Supabase has two different ways of signalling "this email is already
    // registered": sometimes it throws an error with this message, but
    // OFTEN (to prevent user enumeration) it instead returns a "success"
    // response with an obfuscated user object whose `identities` array is
    // empty — no error at all. Treat both as the same case.
    const looksLikeExistingUser =
      authError?.message?.includes('already registered') ||
      (authData?.user && authData.user.identities && authData.user.identities.length === 0)

    if (looksLikeExistingUser) {
      // We need their user_id — sign them in temporarily to get it, then sign out.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError || !signInData.user) {
        return NextResponse.json(
          { error: 'Account already exists but password is incorrect. Please use your existing password.' },
          { status: 400 },
        )
      }

      const userId = signInData.user.id
      await supabase.auth.signOut()

      // Use the service-role client for these writes: we've already
      // verified the password via signInWithPassword above, and the
      // session was just signed out, so there's no active session left
      // for RLS to check against.
      const adminSupabase = createAdminClient()

      // Upsert profile with admin role
      await adminSupabase.from('profiles').upsert({
        id: userId,
        full_name: fullName || 'Admin',
        email: email.toLowerCase(),
        role: 'admin',
        updated_at: new Date().toISOString(),
      })

      // Insert admin record
      const { error: adminInsertError } = await adminSupabase.from('admins').insert({
        user_id: userId,
        email: email.toLowerCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (adminInsertError) {
        return NextResponse.json({ error: `Failed to create admin record: ${adminInsertError.message}` }, { status: 500 })
      }

      return NextResponse.json(
        { success: true, message: 'Admin access granted to existing account. Please login.', userId },
        { status: 201 },
      )
    }

    // Fresh account path
    if (authError) {
      return NextResponse.json({ error: authError.message || 'Failed to create account' }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 })
    }

    const userId = authData.user.id

    // Service-role client — same reasoning as above: no session exists
    // yet immediately after signUp() when email confirmation is enabled.
    const adminSupabase = createAdminClient()

    const { error: profileError } = await adminSupabase.from('profiles').upsert({
      id: userId,
      full_name: fullName || 'Admin',
      email: email.toLowerCase(),
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      return NextResponse.json({ error: `Failed to create admin profile: ${profileError.message}` }, { status: 500 })
    }

    const { error: adminError } = await adminSupabase.from('admins').insert({
      user_id: userId,
      email: email.toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (adminError) {
      return NextResponse.json({ error: `Failed to create admin record: ${adminError.message}` }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'Admin account created successfully.', userId },
      { status: 201 },
    )
  } catch (error) {
    console.error('[v0] Admin signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
