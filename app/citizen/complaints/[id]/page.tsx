import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, IndianRupee, ThumbsUp, CheckCircle, UserCircle, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getComplaintById, getComplaintUpdates } from '@/services/supabase/complaints'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { AIExplainCard } from '@/components/complaints/AIExplainCard'
import { VerificationPanel } from '@/components/complaints/VerificationPanel'
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline'
import { formatRelativeTime, formatCurrency } from '@/lib/utils/formatters'

// Progress tracking component
function StatusProgressTracker({ status }: { status: string }) {
  const statusProgression = ['submitted', 'verified', 'under_review', 'in_progress', 'completed', 'resolved']
  const currentIndex = statusProgression.indexOf(status)

  return (
    <div className="rounded-xl border border-[#1f2d45] bg-[#0d1526] p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-200">Resolution Progress</h3>
      </div>
      <div className="space-y-2">
        {statusProgression.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                i <= currentIndex ? 'bg-blue-400' : 'bg-slate-700'
              }`}
            />
            <span
              className={`text-xs font-medium capitalize ${
                i <= currentIndex ? 'text-blue-300' : 'text-slate-500'
              }`}
            >
              {s.replace('_', ' ')}
            </span>
            {i === currentIndex && (
              <span className="text-[10px] text-blue-400 ml-auto">Current</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [complaint, updates] = await Promise.all([
    getComplaintById(id),
    getComplaintUpdates(id),
  ])

  if (!complaint) notFound()

  // Check if user has already upvoted/confirmed
  let userUpvoted = false
  let userConfirmed = false
  if (user) {
    const { data: verifications } = await supabase
      .from('complaint_verifications')
      .select('type')
      .eq('complaint_id', id)
      .eq('user_id', user.id)

    userUpvoted = verifications?.some((v) => v.type === 'upvote') ?? false
    userConfirmed = verifications?.some((v) => v.type === 'confirm') ?? false
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/citizen/complaints"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All complaints
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
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <CategoryBadge category={complaint.category} />
          <SeverityBadge severity={complaint.severity} />
          <StatusPill status={complaint.status} />
        </div>
        <h1 className="text-xl font-bold text-slate-100 text-balance leading-snug">{complaint.title}</h1>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">{complaint.description}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 mb-5">
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
            <Clock className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Est. time</p>
              <p className="text-xs text-slate-300">{complaint.estimated_hours}h</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Tracker */}
      <StatusProgressTracker status={complaint.status} />

      {/* Community verification panel */}
      <VerificationPanel
        complaintId={complaint.id}
        upvoteCount={complaint.upvote_count}
        isOwner={user?.id === complaint.reporter_id}
        initialUpvoted={userUpvoted}
        initialConfirmed={userConfirmed}
        userId={user?.id ?? null}
      />

      {/* AI Explainability Card */}
      {complaint.ai_analysis && (
        <div className="mt-5">
          <AIExplainCard analysis={complaint.ai_analysis} />
        </div>
      )}

      {/* Repair steps */}
      {complaint.repair_steps.length > 0 && (
        <div className="mt-5 rounded-xl border border-[#1f2d45] bg-[#0d1526] p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Repair Steps</h3>
          <ol className="space-y-2">
            {complaint.repair_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Timeline */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Status Timeline</h3>
        <ComplaintTimeline updates={updates} />
      </div>
    </div>
  )
}
