import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ComplaintFilters } from '@/components/complaints/ComplaintFilters'
import { CommunityFeed } from '@/components/dashboard/CommunityFeed'
import type { Complaint } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

interface SearchParams {
  category?: string
  status?: string
  severity?: string
}

export default async function CitizenComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams

  let query = supabase
    .from('complaints')
    .select('*, wards(name), profiles:reporter_id ( full_name )')
    .order('created_at', { ascending: false })
    .limit(30)

  if (params.category && params.category !== 'all') query = query.eq('category', params.category)
  if (params.status && params.status !== 'all') query = query.eq('status', params.status)
  if (params.severity && params.severity !== 'all') query = query.eq('severity', params.severity)

  const { data } = await query
  const complaints = (data ?? []) as Complaint[]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader
        title="Community Feed"
        subtitle="Community-reported civic issues in your area"
      />

      <ComplaintFilters
        currentCategory={params.category}
        currentStatus={params.status}
        currentSeverity={params.severity}
      />

      {/* Tabbed feed (client-side) */}
      <div className="mt-5">
        <CommunityFeed initialComplaints={complaints} />
      </div>
    </div>
  )
}
