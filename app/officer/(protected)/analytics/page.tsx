import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { CategoryChart } from '@/components/analytics/CategoryChart'
import { StatusChart } from '@/components/analytics/StatusChart'
import { SeverityChart } from '@/components/analytics/SeverityChart'
import { ResolutionTrendChart } from '@/components/analytics/ResolutionTrendChart'
import { AISummaryCard } from '@/components/analytics/AISummaryCard'
import { ClipboardList, CheckCircle2, AlertTriangle, IndianRupee } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ComplaintCategory, ComplaintStatus, ComplaintSeverity } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export default async function OfficerAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'officer') redirect('/citizen/dashboard')

  // Get officer's city assignment — analytics should be scoped to the
  // officer's own city, same as the dashboard and work queue.
  const { data: officerData } = await supabase
    .from('officers')
    .select('city')
    .eq('user_id', user.id)
    .single()
  const cityFilter = officerData?.city ? { city: officerData.city } : {}

  // Fetch all complaints for aggregation, scoped to this officer's city
  const [allRes, budgetRes] = await Promise.all([
    supabase.from('complaints').select('id, category, status, severity, created_at, estimated_cost, wards(name)').match(cityFilter),
    supabase.from('complaints').select('estimated_cost').not('estimated_cost', 'is', null).match(cityFilter),
  ])

  const all = allRes.data ?? []
  const totalBudget = (budgetRes.data ?? []).reduce(
    (sum: number, c: { estimated_cost: number | null }) => sum + (c.estimated_cost ?? 0), 0,
  )

  // Category breakdown
  const categoryMap: Record<string, number> = {}
  for (const c of all) {
    const cat = c.category as string
    categoryMap[cat] = (categoryMap[cat] ?? 0) + 1
  }
  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Status breakdown
  const statusMap: Record<string, number> = {}
  for (const c of all) {
    const s = c.status as string
    statusMap[s] = (statusMap[s] ?? 0) + 1
  }
  const statusData = Object.entries(statusMap).map(([name, count]) => ({ name, count }))

  // Severity breakdown
  const severityMap: Record<string, number> = {}
  for (const c of all) {
    const s = c.severity as string
    severityMap[s] = (severityMap[s] ?? 0) + 1
  }
  const severityData = Object.entries(severityMap).map(([name, count]) => ({ name, count }))

  // 7-day resolution trend (submissions vs resolutions per day)
  const trendMap: Record<string, { submitted: number; resolved: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    trendMap[key] = { submitted: 0, resolved: 0 }
  }
  for (const c of all) {
    const date = new Date(c.created_at)
    const key = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    if (trendMap[key]) trendMap[key].submitted += 1
    if (c.status === 'resolved' || c.status === 'closed') {
      const resKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      if (trendMap[resKey]) trendMap[resKey].resolved += 1
    }
  }
  const trendData = Object.entries(trendMap).map(([date, v]) => ({ date, ...v }))

  const totalCount = all.length
  const resolvedCount = (statusMap['resolved'] ?? 0) + (statusMap['closed'] ?? 0)
  const criticalCount = (severityMap['critical'] ?? 0)
  const openCritical = all.filter((c) => c.severity === 'critical' && c.status !== 'resolved' && c.status !== 'closed').length

  // For AI summary
  const topCategories = categoryData.slice(0, 3).map((c) => ({ category: c.name, count: c.count }))
  const wardMap: Record<string, number> = {}
  for (const c of all) {
    const ward = (c.wards as { name?: string } | null)?.name ?? 'Unknown'
    wardMap[ward] = (wardMap[ward] ?? 0) + 1
  }
  const mostAffectedWards = Object.entries(wardMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([ward, count]) => ({ ward, count }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Analytics"
        subtitle="Resolution trends, category breakdown, and AI insights"
      />

      <StatsGrid
        columns={4}
        stats={[
          { label: 'Total Complaints', value: totalCount, icon: ClipboardList, accent: 'blue', subtext: 'All time' },
          { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, accent: 'emerald', subtext: totalCount ? `${Math.round((resolvedCount / totalCount) * 100)}% rate` : '—' },
          { label: 'Open Criticals', value: openCritical, icon: AlertTriangle, accent: 'red', subtext: 'Need immediate action' },
          { label: 'Est. Budget', value: formatCurrency(totalBudget), icon: IndianRupee, accent: 'amber', subtext: 'Open complaints' },
        ]}
      />

      {/* AI Summary */}
      <div className="mt-6">
        <AISummaryCard
          input={{
            totalComplaints: totalCount,
            criticalCount: openCritical,
            highCount: severityMap['high'] ?? 0,
            resolvedToday: resolvedCount,
            totalEstimatedBudget: totalBudget,
            topCategories,
            mostAffectedWards,
            unresolvedCriticals: [],
          }}
        />
      </div>

      {/* Charts grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Complaints by Category</h3>
          <CategoryChart data={categoryData} />
        </div>
        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Status Breakdown</h3>
          <StatusChart data={statusData} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Severity Distribution</h3>
          <SeverityChart data={severityData} />
        </div>
        <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">7-Day Activity Trend</h3>
          <ResolutionTrendChart data={trendData} />
        </div>
      </div>
    </div>
  )
}
