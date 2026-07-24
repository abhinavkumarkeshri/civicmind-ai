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

    const rawCity =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      'Unknown'
    const city = normalizeCityName(rawCity)
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

/**
 * Nominatim often returns civic-body names instead of plain city names
 * (e.g. "Bhubaneswar Municipal Corporation", "Greater Kolkata Corporation",
 * "Patna Nagar Nigam"). Our wards/officers/complaints all key off the plain
 * city name, so we strip these common Indian administrative-body suffixes
 * to keep matching consistent everywhere.
 */
function normalizeCityName(rawCity: string): string {
  return rawCity
    .replace(/\([^)]*\)/g, ' ') // drop parenthetical bits like "(M.Corp.)"
    .replace(
      /\b(Municipal\s+Corporation|Municipal\s+Council|Municipality|City\s+Corporation|Nagar\s+Nigam|Nagar\s+Palika|Nagar\s+Parishad|Corporation|Cantonment\s+Board)\b/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim()
}
