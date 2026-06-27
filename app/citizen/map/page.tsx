import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ComplaintsMap } from '@/components/map/ComplaintsMap'
import { PageHeader } from '@/components/shared/PageHeader'
import type { ComplaintCategory, ComplaintSeverity } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export default async function CitizenMapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('complaints')
    .select('id, title, category, severity, status, lat, lng, upvote_count')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .limit(300)

  const points = (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    category: row.category as ComplaintCategory,
    severity: row.severity as ComplaintSeverity,
    status: row.status as string,
    lat: row.lat as number,
    lng: row.lng as number,
    upvote_count: row.upvote_count as number,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PageHeader
        title="Civic Map"
        subtitle={`${points.length} reported issues plotted on the map`}
      />

      <div className="mt-4 rounded-xl border border-[#1f2d45] bg-[#0d1526] overflow-hidden" style={{ height: '600px' }}>
        {points.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
            <p className="text-sm">No geo-tagged complaints yet.</p>
            <p className="text-xs">Complaints with location data will appear here.</p>
          </div>
        ) : (
          <ComplaintsMap points={points} />
        )}
      </div>
    </div>
  )
}
