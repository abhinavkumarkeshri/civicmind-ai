'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { LocationData } from '@/services/geolocation'
import { getCurrentLocation } from '@/services/geolocation'

interface LocationContextType {
  location: LocationData | null
  loading: boolean
  error: string | null
  requestLocation: () => Promise<void>
  setLocationManually: (data: Partial<LocationData>) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = async () => {
    setLoading(true)
    setError(null)
    const result = await getCurrentLocation()

    if ('code' in result) {
      // Error case
      setError(result.message)
      setLocation(null)
    } else {
      // Success case
      setLocation(result)
      setError(null)
    }
    setLoading(false)
  }

  const setLocationManually = (data: Partial<LocationData>) => {
    setLocation((prev) => ({ ...prev, ...data } as LocationData))
  }

  // Auto-request location on mount
  useEffect(() => {
    requestLocation()
  }, [])

  return (
    <LocationContext.Provider value={{ location, loading, error, requestLocation, setLocationManually }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider')
  }
  return context
}
