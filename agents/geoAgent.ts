export interface GeoResult {
  address: string
  city: string
  nearbyContext: string[]
}

/**
 * Reverse-geocodes lat/lng using the Google Maps Geocoding API.
 * If GOOGLE_MAPS_API_KEY is not set, returns a formatted fallback.
 */
export async function runGeoAgent(lat: number, lng: number): Promise<GeoResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return {
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      city: 'Unknown',
      nearbyContext: [],
    }
  }

  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    const res = await fetch(geocodeUrl)
    const data = await res.json()

    const formattedAddress: string =
      data.results?.[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`

    // Extract city from address components
    let city = 'Unknown'
    const cityComponent = data.results?.[0]?.address_components?.find((c: { types: string[] }) =>
      c.types.includes('locality'),
    )
    if (cityComponent) city = cityComponent.long_name

    // Nearby Places — classify nearby POIs for severity context
    const nearbyContext: string[] = []
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=300&type=school|hospital|transit_station&key=${apiKey}`
    const placesRes = await fetch(placesUrl)
    const placesData = await placesRes.json()

    const placeResults = placesData.results?.slice(0, 3) ?? []
    for (const place of placeResults) {
      const types: string[] = place.types ?? []
      if (types.includes('school')) nearbyContext.push(`Near ${place.name} (School)`)
      else if (types.includes('hospital')) nearbyContext.push(`Near ${place.name} (Hospital)`)
      else if (types.includes('transit_station')) nearbyContext.push(`Near ${place.name} (Transit)`)
      else nearbyContext.push(`Near ${place.name}`)
    }

    // Always note if it looks like a main road
    if (formattedAddress.toLowerCase().includes('road') || formattedAddress.toLowerCase().includes('highway')) {
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
