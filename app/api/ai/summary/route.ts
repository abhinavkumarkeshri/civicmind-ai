import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSummary } from '@/services/ai/summaryService'
import type { SummaryInput, SummaryContext } from '@/services/ai/summaryService'

export async function POST(req: NextRequest) {
  // Auth check — only officers should call this
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
    const { input, context = 'officer_dashboard' } = body as {
      input: SummaryInput
      context?: SummaryContext
    }

    if (!input) {
      return NextResponse.json({ error: 'input is required' }, { status: 400 })
    }

    const result = await generateSummary(input, context)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[ai/summary] Error:', err)
    return NextResponse.json({ error: 'Summary generation failed' }, { status: 500 })
  }
}
