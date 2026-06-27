/**
 * Reverse geocode coordinates to city/state/country
 * GET /api/geolocation?lat=19.07&lng=72.87
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      // Fallback when no API key
      return NextResponse.json({
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'India',
      })
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'India',
      })
    }

    const result = data.results[0]
    const address = result.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`

    let city = 'Unknown'
    let state = 'Unknown'
    let country = 'India'

    for (const component of result.address_components || []) {
      const types: string[] = component.types || []

      if (types.includes('locality')) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name
      } else if (types.includes('country')) {
        country = component.long_name
      }
    }

    return NextResponse.json({
      address,
      city,
      state,
      country,
    })
  } catch (error) {
    console.error('[v0] Geolocation API error:', error)
    return NextResponse.json(
      { error: 'Geolocation service unavailable' },
      { status: 500 },
    )
  }
}
