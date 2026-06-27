import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[v0] Missing environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupStorage() {
  console.log('[v0] Setting up Supabase Storage...')

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) throw listError

    const bucketExists = buckets?.some((b) => b.name === 'complaint-images')

    if (!bucketExists) {
      console.log('[v0] Creating complaint-images bucket...')
      const { data, error } = await supabase.storage.createBucket('complaint-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      })

      if (error) throw error
      console.log('[v0] ✓ Bucket created:', data?.name)
    } else {
      console.log('[v0] ✓ Bucket already exists: complaint-images')
    }

    // Configure CORS (optional but recommended)
    console.log('[v0] Storage setup complete!')
  } catch (error) {
    console.error('[v0] Storage setup failed:', error)
    process.exit(1)
  }
}

setupStorage()
