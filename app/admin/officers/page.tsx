'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/shared/AdminNav'
import { Users, CheckCircle, Clock, XCircle, Pause, Trash2, Eye, MoreVertical } from 'lucide-react'

interface OfficerData {
  id: string
  user_id: string
  full_name: string
  email: string
  ward_name: string
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  created_at: string
  approved_at: string | null
}

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<OfficerData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended' | 'rejected'>('all')
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerData | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadOfficers()
  }, [filter])

  async function loadOfficers() {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('officers')
        .select(
          `
          id,
          user_id,
          status,
          created_at,
          approved_at,
          wards:ward_id (name),
          profiles:user_id (full_name, email)
        `,
        )

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (!error && data) {
        const formattedData = data.map((o: any) => ({
          id: o.id,
          user_id: o.user_id,
          full_name: o.profiles?.[0]?.full_name || 'Unknown',
          email: o.profiles?.[0]?.email || 'N/A',
          ward_name: o.wards?.name || 'Unassigned',
          status: o.status,
          created_at: o.created_at,
          approved_at: o.approved_at,
        }))
        setOfficers(formattedData)
      }
    } catch (error) {
      console.error('[v0] Officers loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(officerId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('officers')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
        })
        .eq('id', officerId)

      if (!error) {
        loadOfficers()
        setShowModal(false)
      }
    } catch (error) {
      console.error('[v0] Officer approval error:', error)
    }
  }

  async function handleReject(officerId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('officers')
        .update({ status: 'rejected' })
        .eq('id', officerId)

      if (!error) {
        loadOfficers()
        setShowModal(false)
      }
    } catch (error) {
      console.error('[v0] Officer rejection error:', error)
    }
  }

  async function handleSuspend(officerId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('officers')
        .update({
          status: 'suspended',
          suspended_at: new Date().toISOString(),
        })
        .eq('id', officerId)

      if (!error) {
        loadOfficers()
        setShowModal(false)
      }
    } catch (error) {
      console.error('[v0] Officer suspension error:', error)
    }
  }

  async function handleActivate(officerId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('officers')
        .update({ status: 'active' })
        .eq('id', officerId)

      if (!error) {
        loadOfficers()
        setShowModal(false)
      }
    } catch (error) {
      console.error('[v0] Officer activation error:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
      rejected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    const labels = {
      pending: 'Pending',
      active: 'Active',
      suspended: 'Suspended',
      rejected: 'Rejected',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const filteredOfficers = officers

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            Officer Management
          </h1>
          <p className="text-slate-400">Review and manage officer applications and accounts</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'pending', 'active', 'suspended', 'rejected'] as const).map((status) => (
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
              {status === 'pending' && officers.filter((o) => o.status === 'pending').length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-400 text-xs">
                  {officers.filter((o) => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Officers Table */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading officers...</div>
          ) : filteredOfficers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No officers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Ward</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Applied</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfficers.map((officer) => (
                    <tr
                      key={officer.id}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">{officer.full_name}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{officer.email}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{officer.ward_name}</td>
                      <td className="px-6 py-4">{getStatusBadge(officer.status)}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(officer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOfficer(officer)
                            setShowModal(true)
                          }}
                          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Officer Details Modal */}
      {showModal && selectedOfficer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-xl p-6 z-50">
            <h2 className="text-2xl font-bold text-white mb-4">{selectedOfficer.full_name}</h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase">Email</p>
                <p className="text-white">{selectedOfficer.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Ward</p>
                <p className="text-white">{selectedOfficer.ward_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Status</p>
                <p className="mt-1">{getStatusBadge(selectedOfficer.status)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Applied Date</p>
                <p className="text-white">{new Date(selectedOfficer.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {selectedOfficer.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedOfficer.id)}
                    className="w-full py-2 px-4 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Officer
                  </button>
                  <button
                    onClick={() => handleReject(selectedOfficer.id)}
                    className="w-full py-2 px-4 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Application
                  </button>
                </>
              )}

              {selectedOfficer.status === 'active' && (
                <button
                  onClick={() => handleSuspend(selectedOfficer.id)}
                  className="w-full py-2 px-4 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Suspend Officer
                </button>
              )}

              {selectedOfficer.status === 'suspended' && (
                <button
                  onClick={() => handleActivate(selectedOfficer.id)}
                  className="w-full py-2 px-4 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Reactivate Officer
                </button>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 px-4 bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
