/**
 * Ward management service — fetch wards for a city
 */

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createClientLib } from '@/lib/supabase/client'
import type { Ward } from '@/lib/types/database'

/**
 * Fetch all wards for a specific city (server-side)
 */
export async function getWardsByCity(city: string): Promise<Ward[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('wards')
    .select('*')
    .eq('city', city)
    .order('name', { ascending: true })

  if (error) {
    console.error(`[v0] Error fetching wards for ${city}:`, error)
    return []
  }

  return (data ?? []) as Ward[]
}

/**
 * Fetch all wards for a specific city (client-side)
 */
export async function getWardsByCityClient(city: string): Promise<Ward[]> {
  const supabase = createClientLib()

  const { data, error } = await supabase
    .from('wards')
    .select('*')
    .eq('city', city)
    .order('name', { ascending: true })

  if (error) {
    console.error(`[v0] Error fetching wards for ${city}:`, error)
    return []
  }

  return (data ?? []) as Ward[]
}

/**
 * Get all unique cities with wards available
 */
export async function getAllCities(): Promise<string[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('wards')
    .select('city')
    .order('city', { ascending: true })

  if (error) {
    console.error('[v0] Error fetching cities:', error)
    return []
  }

  return data?.map((row: { city: string }) => row.city) ?? []
}

/**
 * Get all states for a country (currently India only)
 */
export async function getAllStates(): Promise<Array<{ city: string; state: string }>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('wards')
    .select('city, state')
    .order('state', { ascending: true })

  if (error) {
    console.error('[v0] Error fetching states:', error)
    return []
  }

  return (data ?? []) as Array<{ city: string; state: string }>
}

/**
 * Check if a city has wards
 */
export async function hasCityWards(city: string): Promise<boolean> {
  const supabase = await createServerClient()

  const { count, error } = await supabase
    .from('wards')
    .select('*', { count: 'exact', head: true })
    .eq('city', city)

  if (error) {
    console.error(`[v0] Error checking wards for ${city}:`, error)
    return false
  }

  return (count ?? 0) > 0
}
