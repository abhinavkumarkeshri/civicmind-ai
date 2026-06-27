import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if user already verified this complaint
    const { data: existing } = await supabase
      .from('complaint_verifications')
      .select('id')
      .eq('complaint_id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      // Already verified, return success
      return NextResponse.json({ verified: true })
    }

    // Add verification
    const { error: insertError } = await supabase
      .from('complaint_verifications')
      .insert({
        complaint_id: id,
        user_id: user.id,
      })

    if (insertError) {
      console.error('[verify] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to verify' },
        { status: 500 }
      )
    }

    // Increment upvote_count
    const { error: updateError } = await supabase
      .from('complaints')
      .update({ upvote_count: supabase.rpc('increment_upvotes', { complaint_id: id }) })
      .eq('id', id)

    if (updateError) {
      console.error('[verify] Update error:', updateError)
      // Don't fail — verification was recorded
    }

    return NextResponse.json({ verified: true })
  } catch (err) {
    console.error('[verify] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
