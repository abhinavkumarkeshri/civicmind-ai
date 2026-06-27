import { createClient } from '@/lib/supabase/server'
import { POINTS_TABLE, BADGE_THRESHOLDS } from '@/lib/constants'

type PointsAction = keyof typeof POINTS_TABLE

export async function awardPoints(userId: string, action: PointsAction): Promise<void> {
  const supabase = await createClient()
  const points = POINTS_TABLE[action]

  const { data: profile } = await supabase
    .from('profiles')
    .select('points, badges')
    .eq('id', userId)
    .single()

  if (!profile) return

  const newPoints = profile.points + points
  const badges = new Set<string>(profile.badges)

  // Badge checks
  if (newPoints >= BADGE_THRESHOLDS.top_contributor) badges.add('top_contributor')

  await supabase
    .from('profiles')
    .update({ points: newPoints, badges: Array.from(badges) })
    .eq('id', userId)
}

export async function checkAndAwardBadges(userId: string): Promise<void> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('points, badges')
    .eq('id', userId)
    .single()
  if (!profile) return

  // Count resolved complaints for this user
  const { count: resolvedCount } = await supabase
    .from('complaints')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_id', userId)
    .eq('status', 'resolved')

  // Count total submitted complaints
  const { count: totalCount } = await supabase
    .from('complaints')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_id', userId)

  // Count upvotes given by this user
  const { count: upvotesGiven } = await supabase
    .from('complaint_verifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'upvote')

  const badges = new Set<string>(profile.badges)

  if ((totalCount ?? 0) >= BADGE_THRESHOLDS.first_report) badges.add('first_report')
  if ((resolvedCount ?? 0) >= BADGE_THRESHOLDS.verified_reporter) badges.add('verified_reporter')
  if (profile.points >= BADGE_THRESHOLDS.top_contributor) badges.add('top_contributor')
  if ((upvotesGiven ?? 0) >= BADGE_THRESHOLDS.community_watchdog) badges.add('community_watchdog')

  await supabase
    .from('profiles')
    .update({ badges: Array.from(badges) })
    .eq('id', userId)
}
