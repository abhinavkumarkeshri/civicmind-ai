'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { CATEGORY_LABELS, SEVERITY_COLORS } from '@/lib/constants'
import type { ComplaintCategory, ComplaintSeverity } from '@/lib/types/database'

interface MapPoint {
  id: string
  title: string
  category: ComplaintCategory
  severity: ComplaintSeverity
  status: string
  lat: number
  lng: number
  upvote_count: number
}

interface Props {
  points: MapPoint[]
}

const SEVERITY_MARKER_COLORS: Record<ComplaintSeverity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export function ComplaintsMap({ points }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<MapPoint | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // We use the native Leaflet-style canvas map via react-simple-maps or a CSS-based placeholder.
    // For full production, swap in Google Maps / Mapbox.
    // Here we render a CSS grid-based dot map that works offline.
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  // Calculate bounding box
  const lats = points.map((p) => p.lat).filter(Boolean)
  const lngs = points.map((p) => p.lng).filter(Boolean)
  const minLat = Math.min(...lats) - 0.01
  const maxLat = Math.max(...lats) + 0.01
  const minLng = Math.min(...lngs) - 0.01
  const maxLng = Math.max(...lngs) + 0.01
  const latRange = maxLat - minLat || 0.1
  const lngRange = maxLng - minLng || 0.1

  function toPercent(lat: number, lng: number) {
    const x = ((lng - minLng) / lngRange) * 100
    const y = (1 - (lat - minLat) / latRange) * 100
    return { x, y }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map background grid */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, rgba(59,130,246,0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(16,185,129,0.03) 0%, transparent 60%),
            #0a1120
          `,
          backgroundImage: `
            linear-gradient(rgba(31,45,69,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31,45,69,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Pins */}
      {points.map((p) => {
        const { x, y } = toPercent(p.lat, p.lng)
        const color = SEVERITY_MARKER_COLORS[p.severity]
        const isSelected = selected?.id === p.id

        return (
          <button
            key={p.id}
            onClick={() => setSelected(isSelected ? null : p)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
            title={p.title}
          >
            <div
              className={`w-3 h-3 rounded-full border-2 transition-transform ${
                isSelected ? 'scale-150' : 'group-hover:scale-125'
              }`}
              style={{
                background: color,
                borderColor: `${color}80`,
                boxShadow: `0 0 6px ${color}60`,
              }}
            />
          </button>
        )
      })}

      {/* Selected popup */}
      {selected && (() => {
        const { x, y } = toPercent(selected.lat, selected.lng)
        return (
          <div
            className="absolute z-20 bg-[#111827] border border-[#1f2d45] rounded-xl p-3 shadow-xl w-52"
            style={{
              left: `${Math.min(Math.max(x, 20), 80)}%`,
              top: `${Math.max(y - 5, 5)}%`,
              transform: 'translate(-50%, -100%)',
              marginBottom: '8px',
            }}
          >
            <div
              className="w-2 h-2 rounded-full mb-2"
              style={{ background: SEVERITY_MARKER_COLORS[selected.severity] }}
            />
            <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
              {selected.title}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
              <span className="capitalize">{selected.category.replace('_', ' ')}</span>
              <span>·</span>
              <span className="capitalize">{selected.severity}</span>
              <span>·</span>
              <span>{selected.upvote_count} votes</span>
            </div>
            <a
              href={`/citizen/complaints/${selected.id}`}
              className="mt-2 block text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              View details →
            </a>
          </div>
        )
      })()}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-2 bg-[#111827]/90 border border-[#1f2d45] rounded-xl px-3 py-2">
        {(Object.entries(SEVERITY_MARKER_COLORS) as [ComplaintSeverity, string][]).map(([sev, color]) => (
          <div key={sev} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-slate-400 capitalize">{sev}</span>
          </div>
        ))}
      </div>

      {/* Point count */}
      <div className="absolute top-3 right-3 bg-[#111827]/90 border border-[#1f2d45] rounded-lg px-2.5 py-1">
        <span className="text-xs text-slate-400">{points.length} complaints</span>
      </div>
    </div>
  )
}
