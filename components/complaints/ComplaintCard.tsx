import Link from 'next/link'
import Image from 'next/image'
import { ThumbsUp, MapPin, Clock } from 'lucide-react'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { Complaint } from '@/lib/types/database'

interface ComplaintCardProps {
  complaint: Complaint
  href?: string
}

export function ComplaintCard({ complaint, href }: ComplaintCardProps) {
  const link = href ?? `/citizen/complaints/${complaint.id}`

  return (
    <Link href={link} className="block group">
      <article className="rounded-xl border border-[#1f2d45] bg-[#111827] hover:border-blue-500/30 hover:bg-[#131e30] transition-all duration-200 overflow-hidden">
        {complaint.before_image_url && (
          <div className="relative w-full h-40 bg-[#0d1526]">
            <Image
              src={complaint.before_image_url}
              alt={complaint.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2">
              <SeverityBadge severity={complaint.severity} size="sm" />
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-1.5">
              <CategoryBadge category={complaint.category} />
              {!complaint.before_image_url && <SeverityBadge severity={complaint.severity} size="sm" />}
            </div>
            <StatusPill status={complaint.status} size="sm" />
          </div>

          <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors mb-1">
            {complaint.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {complaint.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {complaint.upvote_count}
              </span>
              {complaint.address && (
                <span className="flex items-center gap-1 truncate max-w-[120px]">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{complaint.address}</span>
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(complaint.created_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
