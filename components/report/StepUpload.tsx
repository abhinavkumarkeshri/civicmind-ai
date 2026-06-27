'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react'

interface Props {
  onImageReady: (file: File, preview: string) => void
}

export function StepUpload({ onImageReady }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
        onImageReady(file, result)
      }
      reader.readAsDataURL(file)
    },
    [onImageReady],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) handleFile(file)
    },
    [handleFile],
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Upload a photo</h2>
        <p className="text-sm text-slate-400">Take a photo or upload from your gallery. AI will analyse it instantly.</p>
      </div>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-[#1f2d45] aspect-video bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            Image ready
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer aspect-video flex flex-col items-center justify-center gap-4 ${
            dragging ? 'border-blue-500 bg-blue-500/5' : 'border-[#1f2d45] hover:border-blue-500/50 bg-[#0d1526]'
          }`}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">Drag & drop or tap to upload</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP up to 10MB</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Camera — mobile primary */}
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1f2d45] bg-[#111827] text-slate-300 text-sm font-medium hover:bg-[#1a2235] transition-colors"
        >
          <Camera className="w-4 h-4 text-blue-400" />
          Take Photo
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1f2d45] bg-[#111827] text-slate-300 text-sm font-medium hover:bg-[#1a2235] transition-colors"
        >
          <Upload className="w-4 h-4 text-blue-400" />
          From Gallery
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onInputChange} />
    </div>
  )
}
