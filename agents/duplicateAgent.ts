import { createClient } from '@/lib/supabase/server'
import type { ComplaintCategory, ComplaintStatus } from '@/lib/types/database'

export interface DuplicateMatch {
  id: string
  title: string
  distance: number
  status: ComplaintStatus
  category: ComplaintCategory
}

/**
 * Finds complaints within `radiusMeters` of the given coordinates
 * with the same category that are not yet resolved/closed.
 * Uses a bounding-box approximation (no PostGIS needed).
 */
export async function runDuplicateAgent(
  lat: number,
  lng: number,
  category: ComplaintCategory,
  radiusMeters = 300,
): Promise<DuplicateMatch[]> {
  const supabase = await createClient()

  // Approximate degree deltas for the radius
  const latDelta = radiusMeters / 111_320
  const lngDelta = radiusMeters / (111_320 * Math.cos((lat * Math.PI) / 180))

  const { data, error } = await supabase
    .from('complaints')
    .select('id, title, status, category, lat, lng')
    .eq('category', category)
    .not('status', 'in', '("resolved","closed")')
    .gte('lat', lat - latDelta)
    .lte('lat', lat + latDelta)
    .gte('lng', lng - lngDelta)
    .lte('lng', lng + lngDelta)
    .limit(5)

  if (error || !data) return []

  return data.map((row) => {
    const dlat = (row.lat ?? lat) - lat
    const dlng = (row.lng ?? lng) - lng
    const distanceMeters = Math.sqrt(dlat * dlat + dlng * dlng) * 111_320
    return {
      id: row.id,
      title: row.title,
      distance: Math.round(distanceMeters),
      status: row.status as ComplaintStatus,
      category: row.category as ComplaintCategory,
    }
  }).sort((a, b) => a.distance - b.distance)
}
