import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is officer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || profile.role !== 'officer') {
      return NextResponse.json(
        { error: 'Only officers can update status' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Update status and optional fields
    const { data, error } = await supabase
      .from('complaints')
      .update({
        status: body.status,
        resolution_notes: body.resolution_notes || null,
        resolved_at: body.status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[status] Update error:', error)
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ complaint: data })
  } catch (err) {
    console.error('[status] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
