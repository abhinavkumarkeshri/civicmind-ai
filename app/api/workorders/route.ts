import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isValidTransition } from '@/lib/config/department-mapping'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const complaintId = searchParams.get('complaintId')

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('complaint_updates')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ updates: data }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get work order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { complaintId, newStatus, message } = await request.json()

    // Validate input
    if (!complaintId || !newStatus) {
      return NextResponse.json(
        { error: 'Complaint ID and status required' },
        { status: 400 },
      )
    }

    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current complaint
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .select('status')
      .eq('id', complaintId)
      .single()

    if (complaintError || !complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    // Validate transition
    if (!isValidTransition(complaint.status, newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${complaint.status} to ${newStatus}` },
        { status: 400 },
      )
    }

    // Create complaint update record
    const { data: updateData, error: updateError } = await supabase
      .from('complaint_updates')
      .insert({
        complaint_id: complaintId,
        author_id: userData.user.id,
        old_status: complaint.status,
        new_status: newStatus,
        message: message || null,
      })
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Update creation error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update complaint status
    const { error: statusError } = await supabase
      .from('complaints')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', complaintId)

    if (statusError) {
      console.error('[v0] Status update error:', statusError)
      return NextResponse.json({ error: statusError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        update: updateData,
        message: `Complaint status updated to ${newStatus}`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[v0] Work order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
