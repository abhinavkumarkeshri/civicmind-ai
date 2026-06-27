import type { ComplaintCategory, ComplaintSeverity, ComplaintStatus } from './types/database'

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  streetlight: 'Streetlight',
  water_leak: 'Water Leak',
  drain: 'Drain',
  fallen_tree: 'Fallen Tree',
  road_damage: 'Road Damage',
  other: 'Other',
}

export const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  pothole: '🕳',
  garbage: '🗑',
  streetlight: '💡',
  water_leak: '💧',
  drain: '🌊',
  fallen_tree: '🌳',
  road_damage: '🚧',
  other: '📋',
}

export const SEVERITY_LABELS: Record<ComplaintSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const SEVERITY_COLORS: Record<ComplaintSeverity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  submitted: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  under_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
}

export const BADGE_LABELS: Record<string, string> = {
  first_report: 'First Report',
  verified_reporter: 'Verified Reporter',
  top_contributor: 'Top Contributor',
  community_watchdog: 'Community Watchdog',
}

export const POINTS_TABLE = {
  submit_complaint: 10,
  complaint_resolved: 20,
  upvote_complaint: 2,
  confirm_complaint: 5,
  submit_with_photo: 5,
} as const

export const BADGE_THRESHOLDS = {
  first_report: 1,            // 1+ submitted complaints
  verified_reporter: 3,       // 3+ resolved complaints
  top_contributor: 200,       // 200+ points
  community_watchdog: 10,     // 10+ upvotes given
} as const

// AI model configuration — override via env vars
export const AI_MODELS = {
  fast: process.env.GEMINI_FAST_MODEL ?? 'gemini-2.0-flash',
  pro: process.env.GEMINI_PRO_MODEL ?? 'gemini-1.5-pro',
} as const
