/**
 * Client-side geolocation service using Browser Geolocation API
 * and Google Reverse Geocoding for city/state/country detection.
 */

export interface LocationData {
  lat: number
  lng: number
  address: string
  city: string
  state: string
  country: string
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED'
  message: string
}

/**
 * Request user's current location via Browser Geolocation API
 */
export async function getCurrentLocation(): Promise<LocationData | GeolocationError> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        code: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your browser',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const result = await reverseGeocode(latitude, longitude)
        resolve(result)
      },
      (error) => {
        let code: GeolocationError['code'] = 'POSITION_UNAVAILABLE'
        if (error.code === 1) code = 'PERMISSION_DENIED'
        else if (error.code === 2) code = 'POSITION_UNAVAILABLE'
        else if (error.code === 3) code = 'TIMEOUT'

        resolve({
          code,
          message: 'Could not access your location. Please enable location permissions.',
        })
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  })
}

/**
 * Reverse geocode coordinates to city/state/country using OpenStreetMap (Nominatim).
 * No API key required.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | GeolocationError> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: { 'User-Agent': 'CivicMind-AI/1.0' },
        cache: 'no-store',
      },
    )
    const data = await response.json()
    const addr = data.address || {}

    const city: string =
      addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Unknown'
    const state: string = addr.state || 'Unknown'
    const country: string = addr.country || 'India'
    const address: string = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`

    return { lat, lng, address, city, state, country }
  } catch (err) {
    console.error('[OSM] Geolocation error:', err)
    // Fallback on any error
    return {
      lat,
      lng,
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
    }
  }
}

/**
 * Format location for display
 */
export function formatLocation(city: string, state: string): string {
  if (city === 'Unknown' || state === 'Unknown') {
    return 'India'
  }
  return `${city}, ${state}`
}
