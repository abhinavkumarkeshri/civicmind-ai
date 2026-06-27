import { createClient } from '@/lib/supabase/server'
import type { Complaint, ComplaintUpdate, ComplaintVerification, Profile } from '@/lib/types/database'

export async function getComplaintById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      profiles:reporter_id ( id, full_name, avatar_url, points, badges ),
      wards ( id, name, city ),
      departments ( id, name )
    `)
    .eq('id', id)
    .single()
  if (error) return null
  return data as Complaint
}

export async function getComplaintUpdates(complaintId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('complaint_updates')
    .select('*, profiles:author_id ( full_name, avatar_url, role )')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true })
  return (data ?? []) as ComplaintUpdate[]
}

export async function getUserComplaints(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('complaints')
    .select('*, wards ( name ), departments ( name )')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  return (data ?? []) as Complaint[]
}

export async function getAllComplaints(options?: {
  category?: string
  status?: string
  severity?: string
  limit?: number
}) {
  const supabase = await createClient()
  let query = supabase
    .from('complaints')
    .select('*, wards ( name ), departments ( name ), profiles:reporter_id ( full_name )')
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 30)

  if (options?.category && options.category !== 'all') query = query.eq('category', options.category)
  if (options?.status && options.status !== 'all') query = query.eq('status', options.status)
  if (options?.severity && options.severity !== 'all') query = query.eq('severity', options.severity)

  const { data } = await query
  return (data ?? []) as Complaint[]
}

export async function getCommunityFeedComplaints(tab: 'nearby' | 'trending' | 'resolved' | 'top_upvoted') {
  const supabase = await createClient()
  let query = supabase
    .from('complaints')
    .select('*, wards ( name ), profiles:reporter_id ( full_name )')
    .limit(10)

  if (tab === 'trending') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', sevenDaysAgo).order('upvote_count', { ascending: false })
  } else if (tab === 'resolved') {
    query = query.eq('status', 'resolved').order('resolved_at', { ascending: false })
  } else if (tab === 'top_upvoted') {
    query = query.order('upvote_count', { ascending: false })
  } else {
    // nearby fallback — just recent
    query = query.order('created_at', { ascending: false })
  }

  const { data } = await query
  return (data ?? []) as Complaint[]
}

export async function getComplaintsForMap() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('complaints')
    .select('id, title, category, severity, status, lat, lng, upvote_count')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .limit(200)
  return data ?? []
}

export async function getDashboardStats(userId?: string) {
  const supabase = await createClient()

  const [total, resolved, inProgress, critical] = await Promise.all([
    supabase.from('complaints').select('id', { count: 'exact', head: true })
      .then(({ count }) => count ?? 0),
    supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'resolved')
      .then(({ count }) => count ?? 0),
    supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'in_progress')
      .then(({ count }) => count ?? 0),
    supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('severity', 'critical').not('status', 'in', '("resolved","closed")')
      .then(({ count }) => count ?? 0),
  ])

  return { total, resolved, inProgress, critical }
}
