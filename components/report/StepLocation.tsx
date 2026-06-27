'use client'

import { useEffect, useState } from 'react'
import { MapPin, LocateFixed, Loader2, AlertCircle } from 'lucide-react'
import type { Ward } from '@/lib/types/database'

interface Props {
  lat: number
  lng: number
  address: string
  city: string
  state: string
  wardId: string | null
  onLocationChange: (lat: number, lng: number, address: string, city: string, state: string) => void
  onWardChange: (wardId: string | null) => void
}

export function StepLocation({ lat, lng, address, city, state, wardId, onLocationChange, onWardChange }: Props) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingWards, setLoadingWards] = useState(false)

  // Load wards when city changes
  useEffect(() => {
    if (city && city !== 'Unknown') {
      loadWardsForCity(city)
    }
  }, [city])

  const loadWardsForCity = async (cityName: string) => {
    setLoadingWards(true)
    try {
      const response = await fetch(`/api/wards?city=${encodeURIComponent(cityName)}`)
      const data = await response.json()
      setWards(data.wards || [])
    } catch (err) {
      console.error('[v0] Error loading wards:', err)
      setWards([])
    }
    setLoadingWards(false)
  }

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        // Reverse geocode via API
        try {
          const response = await fetch(`/api/geolocation?lat=${latitude}&lng=${longitude}`)
          const data = await response.json()
          onLocationChange(latitude, longitude, data.address || '', data.city || 'Unknown', data.state || 'Unknown')
        } catch (err) {
          console.error('[v0] Geocoding error:', err)
          onLocationChange(latitude, longitude, `${latitude}, ${longitude}`, 'Unknown', 'Unknown')
        }
        setLocating(false)
      },
      () => {
        setError('Could not get your location. Please allow location access or enter manually.')
        setLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  // Auto-request on mount if no location yet
  useEffect(() => {
    if (lat === 0 && lng === 0) requestLocation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasLocation = lat !== 0 || lng !== 0

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Confirm Location</h2>
        <p className="text-sm text-slate-400">Verify the GPS coordinates of the issue.</p>
      </div>

      {/* Map placeholder — full interactive map in Phase 3 */}
      <div className="rounded-xl border border-[#1f2d45] bg-[#0d1526] h-44 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-900/40" />
        {hasLocation ? (
          <div className="relative text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-xs text-blue-300 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
          </div>
        ) : (
          <div className="relative text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Detecting location...</p>
          </div>
        )}
      </div>

      {/* Location display */}
      <div className="space-y-3">
        {/* City/State */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#1f2d45] bg-[#111827]">
          <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Location detected</p>
            <p className="text-sm text-slate-200">
              {city === 'Unknown' ? 'Location unavailable' : `${city}, ${state}`}
            </p>
          </div>
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#1f2d45] bg-[#111827]">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Address</p>
              <p className="text-sm text-slate-300">{address}</p>
            </div>
          </div>
        )}

        {/* Ward selection */}
        {city !== 'Unknown' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Select Ward</label>
            {loadingWards ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-[#1f2d45] bg-[#111827]">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <p className="text-sm text-slate-400">Loading wards...</p>
              </div>
            ) : wards.length === 0 ? (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-300">No wards available for this city. You can continue without selecting one.</p>
              </div>
            ) : (
              <select
                value={wardId || ''}
                onChange={(e) => onWardChange(e.target.value || null)}
                className="w-full rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a ward (optional)</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 px-1">{error}</p>
      )}

      {/* Manual lat/lng inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Latitude</label>
          <input
            type="number"
            step="0.00001"
            value={lat || ''}
            onChange={(e) => onLocationChange(parseFloat(e.target.value) || 0, lng, address, city, state)}
            placeholder="19.07609"
            className="w-full rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Longitude</label>
          <input
            type="number"
            step="0.00001"
            value={lng || ''}
            onChange={(e) => onLocationChange(lat, parseFloat(e.target.value) || 0, address, city, state)}
            placeholder="72.87743"
            className="w-full rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={requestLocation}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#1f2d45] bg-[#111827] text-slate-300 text-sm font-medium hover:bg-[#1a2235] transition-colors disabled:opacity-50"
      >
        {locating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>
        ) : (
          <><LocateFixed className="w-4 h-4 text-blue-400" /> Re-detect My Location</>
        )}
      </button>
    </div>
  )
}
