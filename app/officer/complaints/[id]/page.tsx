import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, IndianRupee, User, Wrench, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getComplaintById, getComplaintUpdates } from '@/services/supabase/complaints'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { AIExplainCard } from '@/components/complaints/AIExplainCard'
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline'
import { OfficerStatusUpdater } from '@/components/officer/OfficerStatusUpdater'
import { formatRelativeTime, formatCurrency } from '@/lib/utils/formatters'
import { getDepartmentForCategory } from '@/lib/config/department-mapping'

export const dynamic = 'force-dynamic'

export default async function OfficerComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'officer') redirect('/citizen/dashboard')

  const [complaint, updates] = await Promise.all([
    getComplaintById(id),
    getComplaintUpdates(id),
  ])
  if (!complaint) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href="/officer/complaints"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Work queue
      </Link>

      {/* Hero image */}
      {complaint.before_image_url && (
        <div className="rounded-xl overflow-hidden border border-[#1f2d45] mb-5 aspect-video bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={complaint.before_image_url}
            alt={complaint.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title + badges */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <CategoryBadge category={complaint.category} />
          <SeverityBadge severity={complaint.severity} />
          <StatusPill status={complaint.status} />
        </div>
        <h1 className="text-xl font-bold text-slate-100 text-balance">{complaint.title}</h1>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">{complaint.description}</p>
      </div>

      {/* Officer Status Updater */}
      <OfficerStatusUpdater
        complaintId={complaint.id}
        currentStatus={complaint.status}
        assignedOfficerId={complaint.assigned_officer_id}
        officerId={user.id}
      />

      {/* Department Alert */}
      {(() => {
        const dept = getDepartmentForCategory(complaint.category)
        return dept ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">Department: {dept.name}</p>
              {dept.email && <p className="text-xs text-amber-200/70 mt-0.5">{dept.email}</p>}
            </div>
          </div>
        ) : null
      })()}

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 my-5">
        {complaint.address && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-[#1f2d45] bg-[#111827]">
            <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Location</p>
              <p className="text-xs text-slate-300 leading-snug">{complaint.address}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2 p-3 rounded-xl border border-[#1f2d45] bg-[#111827]">
          <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500">Reported</p>
            <p className="text-xs text-slate-300">{formatRelativeTime(complaint.created_at)}</p>
          </div>
        </div>
        {complaint.estimated_cost && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-[#1f2d45] bg-[#111827]">
            <IndianRupee className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Est. cost</p>
              <p className="text-xs text-slate-300">{formatCurrency(complaint.estimated_cost)}</p>
            </div>
          </div>
        )}
        {complaint.estimated_hours && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-[#1f2d45] bg-[#111827]">
            <Wrench className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Est. time</p>
              <p className="text-xs text-slate-300">{complaint.estimated_hours}h</p>
            </div>
          </div>
        )}
        {complaint.departments && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-[#1f2d45] bg-[#111827]">
            <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Department</p>
              <p className="text-xs text-slate-300">{(complaint.departments as { name: string }).name}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2 p-3 rounded-xl border border-[#1f2d45] bg-[#111827]">
          <User className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500">Reporter</p>
            <p className="text-xs text-slate-300">
              {complaint.profiles
                ? (complaint.profiles as { full_name?: string }).full_name ?? 'Anonymous'
                : 'Anonymous'}
            </p>
          </div>
        </div>
      </div>

      {/* Repair steps */}
      {complaint.repair_steps.length > 0 && (
        <div className="rounded-xl border border-[#1f2d45] bg-[#0d1526] p-4 mb-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">AI Repair Steps</h3>
          <ol className="space-y-2">
            {complaint.repair_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* AI Explainability */}
      {complaint.ai_analysis && (
        <div className="mb-5">
          <AIExplainCard analysis={complaint.ai_analysis} />
        </div>
      )}

      {/* Timeline */}
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Status Timeline</h3>
      <ComplaintTimeline updates={updates} />
    </div>
  )
}
