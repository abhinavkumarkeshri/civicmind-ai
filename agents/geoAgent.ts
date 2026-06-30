export interface GeoResult {
  address: string
  city: string
  nearbyContext: string[]
}

/**
 * Reverse-geocodes lat/lng using OpenStreetMap's free Nominatim API.
 * No API key required. "Nearby context" (school/hospital/transit proximity)
 * is derived from OSM's address tags rather than a Places API, since
 * Nominatim doesn't offer a separate nearby-search endpoint.
 */
export async function runGeoAgent(lat: number, lng: number): Promise<GeoResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: { 'User-Agent': 'CivicMind-AI/1.0' },
        cache: 'no-store',
      },
    )
    const data = await res.json()
    const addr = data.address || {}

    const formattedAddress: string = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    const city: string =
      addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Unknown'

    const nearbyContext: string[] = []
    if (addr.amenity) nearbyContext.push(`Near ${addr.amenity}`)
    if (addr.road && /road|highway|marg|nh-?\d/i.test(addr.road)) {
      nearbyContext.push('On a main arterial road')
    }

    return { address: formattedAddress, city, nearbyContext }
  } catch {
    return {
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      city: 'Unknown',
      nearbyContext: [],
    }
  }
}
