'use server'

import { createClient } from '@/lib/supabase/server'
import { awardPoints, checkAndAwardBadges } from '@/services/gamification'
import type { OrchestratorResult } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export interface SubmitComplaintInput {
  idempotencyKey: string
  title: string
  description: string
  category: string
  lat: number
  lng: number
  address: string
  beforeImageUrl: string
  wardId: string | null
  wardLabel: string | null
  city: string | null
  aiAnalysis: OrchestratorResult
}

export async function submitComplaint(input: SubmitComplaintInput) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // ── Server-side duplicate guard ──────────────────────────────────────────
  // Block if same user already has an unresolved complaint of the same
  // category within 100 m in the last 24 hours.
  const RADIUS_M = 100
  const LAT_DELTA = RADIUS_M / 111_320
  const LNG_DELTA = RADIUS_M / (111_320 * Math.cos((input.lat * Math.PI) / 180))
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: nearbyOwn } = await supabase
    .from('complaints')
    .select('id, title, status')
    .eq('reporter_id', user.id)
    .eq('category', input.category)
    .not('status', 'in', '("resolved","closed")')
    .gte('lat', input.lat - LAT_DELTA)
    .lte('lat', input.lat + LAT_DELTA)
    .gte('lng', input.lng - LNG_DELTA)
    .lte('lng', input.lng + LNG_DELTA)
    .gte('created_at', since)
    .limit(1)

  if (nearbyOwn && nearbyOwn.length > 0) {
    throw new Error(
      `DUPLICATE:${nearbyOwn[0].id}:You already reported "${nearbyOwn[0].title}" at this location. Track it instead of submitting again.`,
    )
  }

  // Find department by name
  const { data: dept } = await supabase
    .from('departments')
    .select('id')
    .contains('categories', [input.category])
    .single()

  const { data: complaint, error } = await supabase
    .from('complaints')
    .upsert(
      {
        reporter_id: user.id,
        ward_id: input.wardId,
        ward_label: input.wardLabel,
        city: input.city && input.city !== 'Unknown' ? input.city : null,
        title: input.title,
        description: input.description,
        category: input.category,
        status: 'submitted',
        severity: input.aiAnalysis.severity,
        severity_score: input.aiAnalysis.severityScore,
        lat: input.lat,
        lng: input.lng,
        address: input.address,
        department_id: dept?.id ?? null,
        before_image_url: input.beforeImageUrl,
        ai_analysis: input.aiAnalysis,
        ai_confidence: input.aiAnalysis.vision.confidence,
        ai_reasoning: input.aiAnalysis.vision.reasoning.join(' '),
        repair_steps: input.aiAnalysis.repairSteps,
        estimated_cost: input.aiAnalysis.estimatedCost,
        estimated_hours: input.aiAnalysis.estimatedHours,
        duplicate_of: input.aiAnalysis.duplicates[0]?.id ?? null,
        idempotency_key: input.idempotencyKey,
      },
      { onConflict: 'idempotency_key', ignoreDuplicates: false },
    )
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Award points
  await awardPoints(user.id, 'submit_complaint')
  if (input.beforeImageUrl) await awardPoints(user.id, 'submit_with_photo')
  await checkAndAwardBadges(user.id)

  // Initial status update record
  await supabase.from('complaint_updates').insert({
    complaint_id: complaint.id,
    author_id: user.id,
    old_status: null,
    new_status: 'submitted',
    message: 'Complaint submitted by citizen.',
  })

  revalidatePath('/citizen/dashboard')
  revalidatePath('/citizen/complaints')
  revalidatePath('/officer/dashboard')

  return { id: complaint.id }
}
