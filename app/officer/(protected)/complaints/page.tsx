'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { formatRelativeTime } from '@/lib/utils/formatters'
import Link from 'next/link'
import { Search, Filter, MapPin } from 'lucide-react'
import type { Complaint } from '@/lib/types/database'

export default function OfficerComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'in_progress'>('all')

  useEffect(() => {
    loadComplaints()
  }, [severityFilter, categoryFilter, statusFilter])

  async function loadComplaints() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, ward_id')
        .eq('id', userData.user.id)
        .single()

      if (profile?.role !== 'officer') {
        router.push('/citizen/dashboard')
        return
      }

      let query = supabase
        .from('complaints')
        .select('*, wards(name)')
        .not('status', 'in', '("resolved","closed")')

      if (profile?.ward_id) {
        query = query.eq('ward_id', profile.ward_id)
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter)
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query.order('severity_score', { ascending: false }).limit(100)

      if (!error && data) {
        setComplaints(data as Complaint[])
      }
    } catch (error) {
      console.error('[v0] Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (!search) return true
      const lowerSearch = search.toLowerCase()
      return (
        c.title.toLowerCase().includes(lowerSearch) ||
        c.description.toLowerCase().includes(lowerSearch) ||
        c.address?.toLowerCase().includes(lowerSearch)
      )
    })
  }, [complaints, search])

  const grouped = useMemo(() => {
    return {
      critical: filtered.filter((c) => c.severity === 'critical'),
      high: filtered.filter((c) => c.severity === 'high'),
      medium: filtered.filter((c) => c.severity === 'medium'),
      low: filtered.filter((c) => c.severity === 'low'),
    }
  }, [filtered])

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageHeader
          title="Work Queue"
          subtitle={`${filtered.length} open complaints`}
        />

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, description, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-300 text-sm focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-300 text-sm focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="road_damage">Road Damage</option>
              <option value="streetlight">Street Light</option>
              <option value="garbage">Garbage</option>
              <option value="drain">Drain</option>
              <option value="water_leak">Water Leak</option>
              <option value="fallen_tree">Fallen Tree</option>
              <option value="other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-300 text-sm focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
            </select>

            <div className="px-3 py-2 rounded-lg border border-[#1f2d45] bg-[#0d1526] text-slate-400 text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {filtered.length} results
            </div>
          </div>
        </div>

        {/* Results by Severity */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#1f2d45] border-dashed bg-[#0d1526] p-12 text-center">
            <p className="text-slate-400">No complaints match your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([severity, items]) => {
              if (items.length === 0) return null
              const severityColors = {
                critical: 'text-red-400 bg-red-500/10',
                high: 'text-orange-400 bg-orange-500/10',
                medium: 'text-amber-400 bg-amber-500/10',
                low: 'text-blue-400 bg-blue-500/10',
              }
              return (
                <div key={severity}>
                  <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg w-fit ${severityColors[severity as keyof typeof severityColors]} border border-current/20`}>
                    <span className="font-semibold uppercase text-sm">{severity}</span>
                    <span className="px-2 py-0.5 rounded bg-current/20 text-xs font-medium">{items.length}</span>
                  </div>

                  <div className="rounded-xl border border-[#1f2d45] bg-[#111827] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#1f2d45] bg-[#0d1526]/50">
                            {['Issue', 'Category', 'Severity', 'Status', 'Upvotes', 'Reported', ''].map((h) => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a2235]">
                          {items.map((c) => (
                            <tr key={c.id} className="hover:bg-[#131e30] transition-colors group">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-200 line-clamp-1 max-w-[180px] group-hover:text-amber-300 transition-colors">
                                  {c.title}
                                </div>
                                {c.address && (
                                  <div className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {c.address}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <CategoryBadge category={c.category} />
                              </td>
                              <td className="px-4 py-3">
                                <SeverityBadge severity={c.severity} size="sm" />
                              </td>
                              <td className="px-4 py-3">
                                <StatusPill status={c.status} size="sm" />
                              </td>
                              <td className="px-4 py-3 text-slate-400">{c.upvote_count}</td>
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatRelativeTime(c.created_at)}</td>
                              <td className="px-4 py-3">
                                <Link
                                  href={`/officer/complaints/${c.id}`}
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
