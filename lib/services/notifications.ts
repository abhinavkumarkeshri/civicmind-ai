import { createClient } from '@/lib/supabase/server'

export interface Notification {
  id: string
  user_id: string
  type: 'complaint_update' | 'officer_assigned' | 'status_change' | 'new_complaint' | 'admin_alert'
  title: string
  message: string
  complaint_id?: string
  read: boolean
  created_at: string
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  complaintId?: string,
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        complaint_id: complaintId || null,
        read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Notification creation error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[v0] Create notification error:', error)
    return null
  }
}

export async function notifyOfficerAssignment(userId: string, complaintTitle: string, complaintId: string) {
  return createNotification(
    userId,
    'officer_assigned',
    'You have been assigned a new complaint',
    `New complaint assigned: "${complaintTitle}"`,
    complaintId,
  )
}

export async function notifyStatusChange(userId: string, complaintTitle: string, newStatus: string, complaintId: string) {
  return createNotification(
    userId,
    'status_change',
    'Complaint status updated',
    `"${complaintTitle}" is now ${newStatus.replace('_', ' ')}`,
    complaintId,
  )
}

export async function notifyAdminNewOfficerSignup(adminUserId: string, officerName: string) {
  return createNotification(
    adminUserId,
    'admin_alert',
    'New officer signup',
    `${officerName} has submitted an officer application`,
  )
}

export async function notifyAdminCriticalComplaint(adminUserId: string, complaintTitle: string, complaintId: string) {
  return createNotification(
    adminUserId,
    'admin_alert',
    'Critical complaint reported',
    `Critical issue: "${complaintTitle}"`,
    complaintId,
  )
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('[v0] Count error:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('[v0] Get count error:', error)
    return 0
  }
}
