'use server'

import { createClient } from '@/lib/supabase/server'
import type { ComplaintStatus } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  message: string,
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'officer') throw new Error('Unauthorized — officers only')

  // Get current status
  const { data: complaint } = await supabase
    .from('complaints')
    .select('status, reporter_id')
    .eq('id', complaintId)
    .single()
  if (!complaint) throw new Error('Complaint not found')

  const now = newStatus === 'resolved' ? new Date().toISOString() : null

  // Update complaint status
  const { error: updateError } = await supabase
    .from('complaints')
    .update({
      status: newStatus,
      ...(now ? { resolved_at: now } : {}),
    })
    .eq('id', complaintId)
  if (updateError) throw new Error(updateError.message)

  // Add timeline entry
  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    author_id: user.id,
    old_status: complaint.status,
    new_status: newStatus,
    message: message || `Status updated to ${newStatus} by officer.`,
  })

  // Create notification for the reporter
  if (complaint.reporter_id && complaint.reporter_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: complaint.reporter_id,
      complaint_id: complaintId,
      type: 'status_change',
      message: `Your complaint status changed to: ${newStatus.replace('_', ' ')}.`,
      read: false,
    })
  }

  // Award points if resolved
  if (newStatus === 'resolved') {
    await supabase.rpc('increment_points', {
      user_id: complaint.reporter_id,
      points_delta: 20,
    }).maybeSingle()
  }

  revalidatePath(`/officer/complaints/${complaintId}`)
  revalidatePath(`/citizen/complaints/${complaintId}`)
  revalidatePath('/officer/dashboard')
}

export async function assignOfficer(complaintId: string, officerId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'officer') throw new Error('Unauthorized')

  await supabase
    .from('complaints')
    .update({ assigned_officer_id: officerId, status: 'under_review' })
    .eq('id', complaintId)

  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    author_id: user.id,
    old_status: null,
    new_status: 'under_review',
    message: 'Complaint assigned for review.',
  })

  revalidatePath(`/officer/complaints/${complaintId}`)
  revalidatePath('/officer/dashboard')
}
