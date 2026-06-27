/**
 * Seed script — creates demo accounts and sample complaints.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> NEXT_PUBLIC_SUPABASE_URL=<url> \
 *   pnpm tsx scripts/seed.ts
 *
 * Prerequisites:
 *   - Database schema must be applied (run SQL migrations first)
 *   - The Supabase service role key must have admin access
 *   - The `complaint-images` storage bucket must exist and be public
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Demo users ────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    email: 'citizen@civicmind.in',
    password: 'CivicDemo2024!',
    full_name: 'Priya Sharma',
    role: 'citizen',
  },
  {
    email: 'officer@civicmind.in',
    password: 'CivicDemo2024!',
    full_name: 'Rajesh Kumar',
    role: 'officer',
  },
]

// ── Sample wards (multi-city) ─────────────────────────────────────────────────
const SAMPLE_WARDS = [
  // Mumbai, Maharashtra
  { name: 'Ward 1', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Ward 2', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Ward 3', city: 'Mumbai', state: 'Maharashtra' },
  // Bangalore, Karnataka
  { name: 'Bengaluru Ward 1', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'Bengaluru Ward 2', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'Bengaluru Ward 3', city: 'Bengaluru', state: 'Karnataka' },
  // Delhi
  { name: 'North Delhi Ward 1', city: 'Delhi', state: 'Delhi' },
  { name: 'South Delhi Ward 1', city: 'Delhi', state: 'Delhi' },
  // Ranchi, Jharkhand
  { name: 'Ranchi Central', city: 'Ranchi', state: 'Jharkhand' },
  { name: 'Ranchi East', city: 'Ranchi', state: 'Jharkhand' },
  // Bhubaneswar, Odisha
  { name: 'Bhubaneswar Ward 1', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Bhubaneswar Ward 2', city: 'Bhubaneswar', state: 'Odisha' },
]

// ── Sample departments ────────────────────────────────────────────────────────
const SAMPLE_DEPARTMENTS = [
  { name: 'Roads & Infrastructure', categories: ['pothole', 'road_damage'] },
  { name: 'Sanitation',             categories: ['garbage', 'drain'] },
  { name: 'Electrical',             categories: ['streetlight'] },
  { name: 'Water & Sewage',         categories: ['water_leak'] },
  { name: 'Parks & Trees',          categories: ['fallen_tree'] },
  { name: 'General',                categories: ['other'] },
]

// ── Sample complaints (generic, location-independent) ───────────────────────────
const SAMPLE_COMPLAINTS = [
  {
    title: 'Large pothole on Main Road',
    description: 'A significant pothole has formed in the middle of the main road. It poses a serious risk to vehicles and two-wheelers.',
    category: 'pothole',
    severity: 'critical',
    severity_score: 85,
    lat: 19.1197,
    lng: 72.8464,
    address: 'Main Road, Central District',
    status: 'in_progress',
    upvote_count: 14,
    repair_steps: ['Assess depth and size', 'Clear debris', 'Apply cold patch mix', 'Compact and seal edges'],
    estimated_cost: 8500,
    estimated_hours: 4,
  },
  {
    title: 'Overflowing garbage bin at transit hub',
    description: 'The municipal garbage bin has been overflowing for several days. Waste is spilling onto the surrounding area.',
    category: 'garbage',
    severity: 'high',
    severity_score: 65,
    lat: 19.1131,
    lng: 72.8478,
    address: 'Transit Hub Area',
    status: 'submitted',
    upvote_count: 7,
    repair_steps: ['Schedule immediate collection', 'Deep clean area', 'Install overflow sensor'],
    estimated_cost: 2000,
    estimated_hours: 2,
  },
  {
    title: 'Street lights non-functional in residential area',
    description: 'Multiple street lights in this residential area are not working. The area is very dark at night creating safety concerns.',
    category: 'streetlight',
    severity: 'medium',
    severity_score: 45,
    lat: 19.0546,
    lng: 72.8274,
    address: 'Residential Zone, Sector 5',
    status: 'under_review',
    upvote_count: 5,
    repair_steps: ['Inspect wiring and fuse box', 'Replace bulbs', 'Test all units'],
    estimated_cost: 4500,
    estimated_hours: 3,
  },
  {
    title: 'Water pipeline leak on arterial road',
    description: 'A water pipeline has developed a significant leak. Water is gushing onto the road causing traffic disruption.',
    category: 'water_leak',
    severity: 'critical',
    severity_score: 92,
    lat: 19.0195,
    lng: 72.8427,
    address: 'Arterial Road, Intersection Zone',
    status: 'in_progress',
    upvote_count: 22,
    repair_steps: ['Shut off main valve', 'Excavate and expose pipe', 'Replace damaged section', 'Restore road surface'],
    estimated_cost: 35000,
    estimated_hours: 12,
  },
  {
    title: 'Fallen tree blocking thoroughfare',
    description: 'A large tree has fallen across the road due to recent weather. Complete traffic blockage in this area.',
    category: 'fallen_tree',
    severity: 'high',
    severity_score: 78,
    lat: 19.0728,
    lng: 72.8826,
    address: 'Green Belt Area, Commercial Zone',
    status: 'resolved',
    upvote_count: 31,
    repair_steps: ['Deploy chainsaw team', 'Clear road in sections', 'Remove branches', 'Inspect for root damage'],
    estimated_cost: 12000,
    estimated_hours: 6,
  },
]

async function seed() {
  console.log('Seeding CivicMind database...\n')

  // 1. Create wards
  console.log('Creating wards...')
  const { data: wards } = await supabase
    .from('wards')
    .upsert(SAMPLE_WARDS, { onConflict: 'name' })
    .select('id, name')
  console.log(`  ${wards?.length ?? 0} wards ready`)

  // 2. Create departments
  console.log('Creating departments...')
  await supabase
    .from('departments')
    .upsert(SAMPLE_DEPARTMENTS, { onConflict: 'name' })
  console.log(`  ${SAMPLE_DEPARTMENTS.length} departments ready`)

  // 3. Create demo users via auth
  const userIds: Record<string, string> = {}
  for (const u of DEMO_USERS) {
    console.log(`Creating user ${u.email}...`)
    // Try sign up
    const { data: signUpData } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    })

    const userId = signUpData?.user?.id
    if (!userId) {
      console.log(`  Skipped (may already exist)`)
      // Fetch existing
      const { data: list } = await supabase.auth.admin.listUsers()
      const existing = list?.users?.find((usr) => usr.email === u.email)
      if (existing) userIds[u.email] = existing.id
      continue
    }

    userIds[u.email] = userId

    // Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: u.full_name,
      role: u.role,
      points: u.role === 'officer' ? 0 : 150,
      badges: u.role === 'citizen' ? ['first_report'] : [],
    })
    console.log(`  Created ${u.role}: ${u.full_name} (${userId})`)
  }

  // 4. Create sample complaints
  const citizenId = userIds['citizen@civicmind.in']
  if (!citizenId) {
    console.error('Could not find citizen user ID — skipping complaints')
  } else {
    const wardId = wards?.[0]?.id ?? null
    console.log('\nCreating sample complaints...')
    for (const c of SAMPLE_COMPLAINTS) {
      const { error } = await supabase.from('complaints').insert({
        reporter_id: citizenId,
        ward_id: wardId,
        idempotency_key: crypto.randomUUID(),
        ...c,
        resolved_at: c.status === 'resolved' ? new Date().toISOString() : null,
      })
      if (error) console.error(`  Error: ${error.message}`)
      else console.log(`  Created: ${c.title}`)
    }
  }

  console.log('\nSeed complete.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
