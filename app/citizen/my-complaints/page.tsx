'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MapPin, Clock, CheckCircle, AlertCircle, Eye, Search, Filter } from 'lucide-react'

interface ComplaintTracking {
  id: string
  title: string
  description: string
  category: string
  severity: string
  status: string
  address: string
  upvote_count: number
  created_at: string
  updated_at: string
  assigned_officer_id: string | null
  estimated_hours: number | null
  estimated_cost: number | null
}

export default function MyCitizensComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<ComplaintTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'closed'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadComplaints()
  }, [filter])

  async function loadComplaints() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/auth/login')
        return
      }

      let query = supabase
        .from('complaints')
        .select(
          `
          id,
          title,
          description,
          category,
          severity,
          status,
          address,
          upvote_count,
          created_at,
          updated_at,
          assigned_officer_id,
          estimated_hours,
          estimated_cost
        `,
        )
        .eq('reporter_id', userData.user.id)

      if (filter === 'active') {
        query = query.neq('status', 'closed').neq('status', 'resolved')
      } else if (filter === 'resolved') {
        query = query.eq('status', 'resolved')
      } else if (filter === 'closed') {
        query = query.eq('status', 'closed')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (!error && data) {
        setComplaints(data)
      }
    } catch (error) {
      console.error('[v0] Load complaints error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComplaints = complaints.filter((c) => {
    if (!search) return true
    const lowerSearch = search.toLowerCase()
    return (
      c.title.toLowerCase().includes(lowerSearch) ||
      c.description.toLowerCase().includes(lowerSearch) ||
      c.address?.toLowerCase().includes(lowerSearch)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'verified':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'under_review':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'medium':
        return 'text-amber-400'
      case 'low':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-purple-400" />
      case 'submitted':
        return <AlertCircle className="w-5 h-5 text-blue-400" />
      default:
        return <Clock className="w-5 h-5 text-amber-400" />
    }
  }

  const getProgressPercent = (status: string) => {
    const statusProgression = ['submitted', 'verified', 'under_review', 'in_progress', 'completed', 'resolved']
    const index = statusProgression.indexOf(status)
    return index === -1 ? 0 : ((index + 1) / statusProgression.length) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111827] to-[#1a2235]">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-white">My Complaints</h1>
            <p className="text-xs text-slate-400">Track your submitted complaints</p>
          </div>
          <Link href="/citizen/dashboard" className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm">
            Back
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search complaints by title, description, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'resolved', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading your complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-slate-700/50 bg-slate-900/30">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No complaints found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredComplaints.map((complaint) => (
              <Link
                key={complaint.id}
                href={`/citizen/complaints/${complaint.id}`}
                className="rounded-xl border border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/50 transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{complaint.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{complaint.description}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors ml-2">
                    <Eye className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Status Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(complaint.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{Math.round(getProgressPercent(complaint.status))}% done</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${getProgressPercent(complaint.status)}%` }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-xs">
                    <p className="text-slate-500 mb-1">Category</p>
                    <p className="text-slate-300 capitalize">{complaint.category}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 mb-1">Severity</p>
                    <p className={`font-medium ${getSeverityColor(complaint.severity)}`}>{complaint.severity.toUpperCase()}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 mb-1">Upvotes</p>
                    <p className="text-slate-300">{complaint.upvote_count} citizens</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 mb-1">Updated</p>
                    <p className="text-slate-300">{new Date(complaint.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {complaint.address && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{complaint.address}</span>
                    </div>
                  </div>
                )}

                {/* Estimated Info */}
                {(complaint.estimated_hours || complaint.estimated_cost) && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30 flex gap-4 text-xs">
                    {complaint.estimated_hours && (
                      <div>
                        <p className="text-slate-500 mb-1">Est. Time</p>
                        <p className="text-slate-300 font-medium">{complaint.estimated_hours}h</p>
                      </div>
                    )}
                    {complaint.estimated_cost && (
                      <div>
                        <p className="text-slate-500 mb-1">Est. Cost</p>
                        <p className="text-slate-300 font-medium">${complaint.estimated_cost}</p>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
