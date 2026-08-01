/**
 * Resizes and compresses an image File in the browser before it's uploaded
 * or sent for AI analysis. Large phone-camera photos (4000px+, several MB)
 * easily exceed Vercel's ~4.5MB serverless request body limit once
 * base64-encoded (+33% size) for the AI analysis call — this keeps things
 * well under that ceiling while staying visually sharp enough for both
 * storage and Gemini's vision analysis.
 */
export async function resizeImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<File> {
  // Non-image files (shouldn't normally happen here) pass through untouched.
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  const scale = Math.min(1, maxDimension / Math.max(width, height))
  const targetWidth = Math.round(width * scale)
  const targetHeight = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  )
  if (!blob) return file

  // Don't bother if the "resized" version somehow ended up bigger
  // (can happen with already-small, already-compressed images).
  if (blob.size >= file.size) return file

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg' })
}
