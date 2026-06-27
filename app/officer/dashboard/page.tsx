import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { PageHeader } from '@/components/shared/PageHeader'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { formatRelativeTime, formatCurrency } from '@/lib/utils/formatters'
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  IndianRupee,
} from 'lucide-react'
import type { Complaint } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export default async function OfficerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'officer') redirect('/citizen/dashboard')

  // Get officer's ward assignment
  const { data: officerData } = await supabase
    .from('officers')
    .select('ward_id')
    .eq('user_id', user.id)
    .single()

  // Fetch all stats in parallel - filter by officer's ward
  const wardFilter = officerData?.ward_id ? { ward_id: officerData.ward_id } : {}
  
  const [totalRes, criticalRes, inProgressRes, resolvedRes, budgetRes, priorityRes] =
    await Promise.all([
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .match(wardFilter),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical')
        .not('status', 'in', '("resolved","closed")')
        .match(wardFilter),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress')
        .match(wardFilter),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .match(wardFilter),
      supabase
        .from('complaints')
        .select('estimated_cost')
        .not('status', 'in', '("resolved","closed")')
        .not('estimated_cost', 'is', null)
        .match(wardFilter),
      supabase
        .from('complaints')
        .select('*, wards(name), profiles!reporter_id(full_name)')
        .not('status', 'in', '("resolved","closed")')
        .match(wardFilter)
        .order('severity_score', { ascending: false })
        .order('upvote_count', { ascending: false })
        .limit(8),
    ])

  const totalBudget =
    (budgetRes.data ?? []).reduce(
      (sum: number, c: { estimated_cost: number | null }) => sum + (c.estimated_cost ?? 0),
      0,
    )

  const priorityQueue = (priorityRes.data ?? []) as Complaint[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Officer Dashboard"
        subtitle={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? 'Officer'} — here's today's situation`}
        actions={
          <Link
            href="/officer/complaints"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-sm font-medium transition-colors"
          >
            View Full Queue
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      {/* Stats */}
      <StatsGrid
        columns={4}
        stats={[
          {
            label: 'Total Complaints',
            value: totalRes.count ?? 0,
            icon: ClipboardList,
            accent: 'blue',
            subtext: 'Across all wards',
          },
          {
            label: 'Critical Unresolved',
            value: criticalRes.count ?? 0,
            icon: AlertTriangle,
            accent: 'red',
            subtext: 'Need immediate action',
          },
          {
            label: 'In Progress',
            value: inProgressRes.count ?? 0,
            icon: Clock,
            accent: 'amber',
            subtext: 'Currently being actioned',
          },
          {
            label: 'Resolved',
            value: resolvedRes.count ?? 0,
            icon: CheckCircle2,
            accent: 'emerald',
            subtext: 'Successfully closed',
          },
        ]}
      />

      {/* Budget widget */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(totalBudget)}
            </div>
            <div className="text-sm text-slate-400">Estimated Repair Budget</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Sum of open complaint estimates
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {totalRes.count
                ? `${Math.round(((resolvedRes.count ?? 0) / (totalRes.count ?? 1)) * 100)}%`
                : '—'}
            </div>
            <div className="text-sm text-slate-400">Resolution Rate</div>
            <div className="text-xs text-slate-500 mt-0.5">All-time resolved vs total</div>
          </div>
        </div>
      </div>

      {/* Priority queue */}
      <div className="mt-8">
        <PageHeader
          title="Priority Queue"
          subtitle="Highest severity unresolved complaints — sorted by AI severity score"
          actions={
            <Link
              href="/officer/complaints"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              View all
            </Link>
          }
        />

        {priorityQueue.length === 0 ? (
          <div className="rounded-xl border border-[#1f2d45] border-dashed bg-[#0d1526] p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-200 mb-1">All clear!</h3>
            <p className="text-sm text-slate-400">No open complaints at the moment.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#1f2d45] bg-[#111827] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2d45]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Upvotes
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden xl:table-cell">
                      Reported
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2235]">
                  {priorityQueue.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="hover:bg-[#131e30] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200 line-clamp-1 group-hover:text-blue-300 transition-colors max-w-[200px]">
                          {complaint.title}
                        </div>
                        {complaint.address && (
                          <div className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">
                            {complaint.address}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <CategoryBadge category={complaint.category} />
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={complaint.severity} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={complaint.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-400">
                        {complaint.upvote_count}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-slate-500">
                        {formatRelativeTime(complaint.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/officer/complaints/${complaint.id}`}
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
