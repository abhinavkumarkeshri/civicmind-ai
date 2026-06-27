import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const idempotencyKey = request.headers.get('idempotency-key') || randomUUID()

    // Check if complaint with same idempotency key already exists
    if (request.headers.get('idempotency-key')) {
      const { data: existing } = await supabase
        .from('complaints')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { complaint_id: existing.id, cached: true },
          { status: 200 }
        )
      }
    }

    // Create new complaint
    const complaintId = randomUUID()
    const { error } = await supabase.from('complaints').insert({
      id: complaintId,
      reporter_id: user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      severity: body.severity,
      status: 'open',
      lat: body.lat,
      lng: body.lng,
      address: body.address,
      ward_id: body.ward_id,
      image_urls: body.image_urls || [],
      ai_analysis: body.ai_analysis,
      duplicate_score: body.duplicate_score,
      repair_steps: body.repair_steps,
      upvote_count: 0,
      idempotency_key: idempotencyKey,
    })

    if (error) {
      console.error('[complaints POST] Insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create complaint' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { complaint_id: complaintId },
      {
        status: 201,
        headers: { 'idempotency-key': idempotencyKey },
      }
    )
  } catch (err) {
    console.error('[complaints POST] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
