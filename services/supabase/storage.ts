import { createClient } from '@/lib/supabase/client'

const BUCKET = 'complaint-images'

export async function uploadComplaintImage(
  userId: string,
  complaintIdempotencyKey: string,
  file: File,
  variant: 'before' | 'after' = 'before',
): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${complaintIdempotencyKey}/${variant}.${ext}`

  console.log('[v0] Uploading image to bucket:', BUCKET, 'path:', path)

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    console.error('[v0] Upload error:', error.message, error)
    
    if (error.message?.toLowerCase().includes('bucket not found')) {
      throw new Error(
        `Storage bucket "${BUCKET}" not found. This requires one-time setup in Supabase. See STORAGE_SETUP.md for instructions.`,
      )
    }
    
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  console.log('[v0] Upload successful, public URL:', data.publicUrl)
  return data.publicUrl
}

export function getPublicUrl(path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Convert File → base64 string (strips the data URL prefix) */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip "data:image/jpeg;base64," prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Detect MIME type from File */
export function getMimeType(file: File): string {
  return file.type || 'image/jpeg'
}
