/**
 * Fetch wards for a specific city
 * GET /api/wards?city=Bangalore
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({ error: 'Missing city parameter' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('wards')
      .select('id, name, city, state')
      .eq('city', city)
      .order('name', { ascending: true })

    if (error) {
      console.error(`[v0] Error fetching wards for ${city}:`, error)
      return NextResponse.json({ wards: [] })
    }

    return NextResponse.json({
      wards: data || [],
      city,
      count: (data || []).length,
    })
  } catch (error) {
    console.error('[v0] Wards API error:', error)
    return NextResponse.json({ wards: [], error: 'Failed to fetch wards' }, { status: 500 })
  }
}
