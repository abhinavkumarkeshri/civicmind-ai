'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/shared/AdminNav'
import { FileText, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'

interface ComplaintData {
  id: string
  title: string
  category: string
  status: string
  severity: string
  reporter_name: string
  assigned_officer: string | null
  created_at: string
  upvote_count: number
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'closed'>('all')

  useEffect(() => {
    loadComplaints()
  }, [filter])

  async function loadComplaints() {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('complaints')
        .select(
          `
          id,
          title,
          category,
          status,
          severity,
          upvote_count,
          created_at,
          profiles:reporter_id (full_name),
          assigned_officer_id
        `,
        )

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50)

      if (!error && data) {
        const formattedData = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          status: c.status,
          severity: c.severity,
          reporter_name: c.profiles?.full_name || 'Unknown',
          assigned_officer: c.assigned_officer_id ? 'Assigned' : 'Unassigned',
          created_at: c.created_at,
          upvote_count: c.upvote_count,
        }))
        setComplaints(formattedData)
      }
    } catch (error) {
      console.error('[v0] Complaints loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      submitted: Clock,
      under_review: AlertCircle,
      in_progress: Zap,
      resolved: CheckCircle,
      closed: CheckCircle,
    }
    const colors = {
      submitted: 'text-blue-400',
      under_review: 'text-amber-400',
      in_progress: 'text-purple-400',
      resolved: 'text-green-400',
      closed: 'text-slate-400',
    }
    const Icon = icons[status as keyof typeof icons] || FileText
    const color = colors[status as keyof typeof colors]
    return <Icon className={`w-4 h-4 ${color}`} />
  }

  const getSeverityBadge = (severity: string) => {
    const badges = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${badges[severity as keyof typeof badges]}`}>
        {severity.toUpperCase()}
      </span>
    )
  }

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            Complaint Management
          </h1>
          <p className="text-slate-400">Monitor and manage all citizen complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Complaints" value={complaints.length} color="blue" />
          <StatBox
            label="Critical"
            value={complaints.filter((c) => c.severity === 'critical').length}
            color="red"
            highlight
          />
          <StatBox label="In Progress" value={complaints.filter((c) => c.status === 'in_progress').length} color="purple" />
          <StatBox label="Resolved" value={complaints.filter((c) => c.status === 'resolved').length} color="green" />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'submitted', 'under_review', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No complaints found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Severity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reporter</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Votes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(complaint.status)}
                          <span className="text-white font-medium line-clamp-2">{complaint.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm capitalize">{complaint.category}</td>
                      <td className="px-6 py-4">{getSeverityBadge(complaint.severity)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">{getStatusLabel(complaint.status)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{complaint.reporter_name}</td>
                      <td className="px-6 py-4 text-white font-medium">{complaint.upvote_count}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{new Date(complaint.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatBox({
  label,
  value,
  color,
  highlight,
}: {
  label: string
  value: number
  color: 'blue' | 'red' | 'purple' | 'green'
  highlight?: boolean
}) {
  const colorClass = {
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
  }

  return (
    <div className={`rounded-xl border ${colorClass[color]} p-4 ${highlight ? 'ring-2 ring-offset-1 ring-offset-slate-900' : ''}`}>
      <p className="text-xs font-medium text-slate-300 uppercase">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
