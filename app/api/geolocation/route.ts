/**
 * Reverse geocode coordinates using OpenStreetMap (Nominatim)
 * GET /api/geolocation?lat=19.07&lng=72.87
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat/lng' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'CivicMind-AI/1.0'
        },
        cache: 'no-store',
      }
    )

    const data = await response.json()
    const addr = data.address || {}

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      'Unknown'
    const state = addr.state || 'Unknown'

    return NextResponse.json({
      address: data.display_name || `${lat}, ${lng}`,
      city,
      state,
      country: addr.country || 'India',
    })
  } catch (error) {
    console.error('[OSM] Reverse geocoding failed:', error)
    return NextResponse.json({
      address: '',
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
    })
  }
}
