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
 * Reverse geocode coordinates to city/state/country using Google Maps API
 * Falls back gracefully if API is unavailable
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | GeolocationError> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    // Fallback: return basic coordinates without city/state
    return {
      lat,
      lng,
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
    }
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return {
        lat,
        lng,
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'India',
      }
    }

    const result = data.results[0]
    const address = result.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`

    // Extract city, state, country from address_components
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

    return {
      lat,
      lng,
      address,
      city,
      state,
      country,
    }
  } catch (err) {
    console.error('[v0] Geolocation error:', err)
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
