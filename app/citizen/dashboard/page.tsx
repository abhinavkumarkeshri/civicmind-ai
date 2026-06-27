import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { PageHeader } from '@/components/shared/PageHeader'
import { ComplaintCard } from '@/components/complaints/ComplaintCard'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  Star,
  Award,
} from 'lucide-react'
import { BADGE_LABELS } from '@/lib/constants'
import type { Complaint } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export default async function CitizenDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, complaintsRes, recentRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('reporter_id', user.id),
    supabase
      .from('complaints')
      .select('*, wards(name)')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const profile = profileRes.data
  const totalCount = complaintsRes.count ?? 0

  // Per-status counts
  const statuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'] as const
  const statusCounts: Record<string, number> = {}
  await Promise.all(
    statuses.map(async (s) => {
      const { count } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('reporter_id', user.id)
        .eq('status', s)
      statusCounts[s] = count ?? 0
    }),
  )

  const resolvedCount = statusCounts['resolved'] ?? 0
  const inProgressCount = (statusCounts['in_progress'] ?? 0) + (statusCounts['under_review'] ?? 0)
  const pendingCount = statusCounts['submitted'] ?? 0

  const recentComplaints = (recentRes.data ?? []) as Complaint[]

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Good morning, <span className="text-blue-400">{firstName}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Your civic contributions are making a difference.
          </p>
        </div>
        <Link
          href="/citizen/report"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Report Issue
        </Link>
      </div>

      {/* Stats */}
      <StatsGrid
        columns={4}
        stats={[
          {
            label: 'Total Reports',
            value: totalCount,
            icon: FileText,
            accent: 'blue',
            subtext: 'All time',
          },
          {
            label: 'Resolved',
            value: resolvedCount,
            icon: CheckCircle2,
            accent: 'emerald',
            subtext: totalCount ? `${Math.round((resolvedCount / totalCount) * 100)}% resolution` : '—',
          },
          {
            label: 'In Progress',
            value: inProgressCount,
            icon: Clock,
            accent: 'amber',
            subtext: 'Being actioned',
          },
          {
            label: 'Pending Review',
            value: pendingCount,
            icon: AlertTriangle,
            accent: 'red',
            subtext: 'Awaiting officer',
          },
        ]}
      />

      {/* Points & Badges */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Points card */}
        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{profile?.points ?? 0}</div>
            <div className="text-sm text-slate-400">Civic Points</div>
            <div className="text-xs text-slate-500 mt-0.5">Keep reporting to earn more</div>
          </div>
        </div>

        {/* Badges card */}
        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Badges Earned</span>
          </div>
          {(profile?.badges ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">
              Submit your first report to earn the{' '}
              <span className="text-slate-400">First Report</span> badge.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile?.badges ?? []).map((badge: string) => (
                <span
                  key={badge}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  {BADGE_LABELS[badge] ?? badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent complaints */}
      <div className="mt-8">
        <PageHeader
          title="My Recent Reports"
          subtitle="Track the status of your submitted issues"
          actions={
            <Link
              href="/citizen/complaints"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all
            </Link>
          }
        />

        {recentComplaints.length === 0 ? (
          <div className="rounded-xl border border-[#1f2d45] border-dashed bg-[#0d1526] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-2">No reports yet</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
              Spotted a pothole, broken streetlight or garbage pile? Report it in 30 seconds.
            </p>
            <Link
              href="/citizen/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Report your first issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile CTA */}
      <div className="mt-8 sm:hidden">
        <Link
          href="/citizen/report"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Report a Civic Issue
        </Link>
      </div>
    </div>
  )
}
