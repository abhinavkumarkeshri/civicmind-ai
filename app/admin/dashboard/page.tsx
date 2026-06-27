'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, LogOut, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import AdminNav from '@/components/shared/AdminNav'

interface PendingOfficer {
  id: string
  full_name: string
  email: string
  created_at: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pendingOfficers, setPendingOfficers] = useState<PendingOfficer[]>([])
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingApprovals: 0,
    activeOfficers: 0,
    resolvedComplaints: 0,
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const supabase = createClient()

      // Load pending officer approvals
      const { data: officers, error: officersError } = await supabase
        .from('officers')
        .select(
          `
          id,
          created_at,
          profiles:user_id (full_name, email)
        `,
        )
        .eq('status', 'pending')
        .limit(10)

      if (!officersError && officers) {
        setPendingOfficers(
          officers.map((o: any) => ({
            id: o.id,
            full_name: o.profiles?.[0]?.full_name || 'Unknown',
            email: o.profiles?.[0]?.email || 'N/A',
            created_at: o.created_at,
          })),
        )

        // Load stats
        const { count: complaintCount } = await supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })

        const { count: activeOfficerCount } = await supabase
          .from('officers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        const { count: resolvedCount } = await supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved')

        setStats({
          totalComplaints: complaintCount || 0,
          pendingApprovals: officers.length,
          activeOfficers: activeOfficerCount || 0,
          resolvedComplaints: resolvedCount || 0,
        })
      }
    } catch (error) {
      console.error('[v0] Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveOfficer(officerId: string) {
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
        // Reload dashboard
        loadDashboard()
      }
    } catch (error) {
      console.error('[v0] Officer approval error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            Admin Dashboard
          </h1>
          <p className="text-slate-400">System administration and officer management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={AlertCircle} label="Total Complaints" value={stats.totalComplaints} color="blue" />
          <StatCard icon={Clock} label="Pending Approvals" value={stats.pendingApprovals} color="amber" highlight />
          <StatCard icon={Users} label="Active Officers" value={stats.activeOfficers} color="green" />
          <StatCard icon={CheckCircle} label="Resolved" value={stats.resolvedComplaints} color="emerald" />
        </div>

        {/* Pending Officer Approvals */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pending Officer Approvals
          </h2>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : pendingOfficers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No pending approvals</div>
          ) : (
            <div className="space-y-3">
              {pendingOfficers.map((officer) => (
                <div
                  key={officer.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-900/20 hover:bg-slate-900/40 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{officer.full_name}</p>
                    <p className="text-sm text-slate-400">{officer.email}</p>
                  </div>
                  <button
                    onClick={() => handleApproveOfficer(officer.id)}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium border border-green-500/30"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className: string }>
  label: string
  value: number
  color: 'blue' | 'amber' | 'green' | 'emerald'
  highlight?: boolean
}

function StatCard({ icon: Icon, label, value, color, highlight }: StatCardProps) {
  const colorClass = {
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  }

  return (
    <div
      className={`rounded-xl border ${colorClass[color]} p-6 ${highlight ? 'ring-2 ring-offset-1 ring-offset-slate-900' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
