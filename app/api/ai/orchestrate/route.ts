import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeComplaint } from '@/orchestrator/analyzeComplaint'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { imageBase64, mimeType, lat, lng } = body

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'lat and lng are required numbers' }, { status: 400 })
    }

    const result = await analyzeComplaint({ imageBase64, mimeType, lat, lng })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[orchestrate] Error:', err)
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
  }
}
