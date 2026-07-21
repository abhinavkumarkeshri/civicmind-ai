'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StepUpload } from '@/components/report/StepUpload'
import { StepAITimeline } from '@/components/report/StepAITimeline'
import { StepAIReview } from '@/components/report/StepAIReview'
import { StepLocation } from '@/components/report/StepLocation'
import { StepConfirm } from '@/components/report/StepConfirm'
import { submitComplaint } from '@/app/actions/submitComplaint'
import type { OrchestratorResult } from '@/lib/types/database'

type Step = 'upload' | 'ai_timeline' | 'ai_review' | 'location' | 'confirm' | 'success'

const STEP_LABELS = ['Upload', 'AI Analysis', 'Review', 'Location', 'Submit']
const STEP_ORDER: Step[] = ['upload', 'ai_timeline', 'ai_review', 'location', 'confirm']

function stepIndex(step: Step) {
  return STEP_ORDER.indexOf(step)
}

export default function ReportPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('upload')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [aiResult, setAiResult] = useState<OrchestratorResult | null>(null)
  const [editedTitle, setEditedTitle] = useState<string>('')
  const [editedDescription, setEditedDescription] = useState<string>('')
  const [editedCategory, setEditedCategory] = useState<string>('')
  const [lat, setLat] = useState<number>(0)
  const [lng, setLng] = useState<number>(0)
  const [address, setAddress] = useState<string>('')
  const [city, setCity] = useState<string>('Unknown')
  const [state, setState] = useState<string>('Unknown')
  const [wardId, setWardId] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  // Fetch userId once on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  const handleImageReady = useCallback((file: File, preview: string) => {
    setImageFile(file)
    setImagePreview(preview)
    setStep('ai_timeline')
    // Auto-request location in parallel
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latitude = pos.coords.latitude
          const longitude = pos.coords.longitude
          setLat(latitude)
          setLng(longitude)
          try {
            const res = await fetch(
              `/api/geolocation?lat=${latitude}&lng=${longitude}`
            )
            const data = await res.json()
            setAddress(data.address || '')
            setCity(data.city || 'Unknown')
            setState(data.state || 'Unknown')
          } catch (err) {
            console.error('Geolocation error:', err)
          }
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      )
    }
  }, [])

  const handleAIComplete = useCallback((result: OrchestratorResult, imgUrl: string) => {
    setAiResult(result)
    setImageUrl(imgUrl)
    setEditedTitle(result.title)
    setEditedDescription(result.description)
    setEditedCategory(result.category)
    if (result.address) {
      // Use geo agent address if available
      setAddress(result.address)
    }
    setStep('ai_review')
  }, [])

  const handleEdit = useCallback((field: 'title' | 'description' | 'category', value: string) => {
    if (field === 'title') setEditedTitle(value)
    if (field === 'description') setEditedDescription(value)
    if (field === 'category') setEditedCategory(value)
  }, [])

  const handleSubmit = async () => {
    if (!aiResult) return
    setSubmitting(true)
    try {
      const { id } = await submitComplaint({
        idempotencyKey,
        title: editedTitle,
        description: editedDescription,
        category: editedCategory,
        lat,
        lng,
        address,
        beforeImageUrl: imageUrl,
        wardId: wardId || null,
        city: city && city !== 'Unknown' ? city : null,
        aiAnalysis: {
          ...aiResult,
          category: editedCategory as OrchestratorResult['category'],
          title: editedTitle,
          description: editedDescription,
        },
      })
      setSubmittedId(id)
      setStep('success')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const currentIndex = stepIndex(step)

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Complaint Submitted!</h1>
        <p className="text-slate-400 mb-8">
          Your report has been received and will be reviewed by municipal officers shortly.
          You earned <span className="text-amber-400 font-bold">+15 points</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => submittedId && router.push(`/citizen/complaints/${submittedId}`)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
          >
            Track this complaint
          </button>
          <button
            onClick={() => router.push('/citizen/dashboard')}
            className="px-6 py-2.5 rounded-xl border border-[#1f2d45] hover:bg-[#111827] text-slate-300 font-medium text-sm transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            if (step === 'upload') router.push('/citizen/dashboard')
            else if (step === 'ai_review') setStep('upload')
            else if (step === 'location') setStep('ai_review')
            else if (step === 'confirm') setStep('location')
          }}
          className="w-8 h-8 rounded-lg border border-[#1f2d45] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#111827] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-bold text-slate-100">Report an Issue</h1>
          <p className="text-xs text-slate-500">Step {Math.max(1, currentIndex + 1)} of 5</p>
        </div>
      </div>

      {/* Progress bar */}
      {step !== 'ai_timeline' && (
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-3">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div className={`h-1.5 w-full rounded-full transition-colors ${
                  i < currentIndex ? 'bg-blue-500' : i === currentIndex ? 'bg-blue-400' : 'bg-[#1f2d45]'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`text-[10px] ${i <= currentIndex ? 'text-blue-400' : 'text-slate-600'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div>
        {step === 'upload' && (
          <StepUpload onImageReady={handleImageReady} />
        )}

        {step === 'ai_timeline' && imageFile && userId && (
          <>
            {aiError && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
                <div>{aiError}</div>
                <button 
                  onClick={() => { setAiError(null); setStep('upload') }} 
                  className="mt-2 text-xs underline hover:text-red-300 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
            <StepAITimeline
              imageFile={imageFile}
              lat={lat}
              lng={lng}
              userId={userId}
              idempotencyKey={idempotencyKey}
              onComplete={handleAIComplete}
              onError={(err) => { setAiError(err); }}
            />
          </>
        )}

        {step === 'ai_review' && aiResult && (
          <>
            <StepAIReview
              result={{ ...aiResult, category: editedCategory as OrchestratorResult['category'], title: editedTitle, description: editedDescription }}
              imagePreview={imagePreview}
              onEdit={handleEdit}
            />
            <button
              onClick={() => setStep('location')}
              className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
            >
              Confirm & Continue
            </button>
          </>
        )}

        {step === 'location' && (
          <>
            <StepLocation
              lat={lat}
              lng={lng}
              address={address}
              city={city}
              state={state}
              wardId={wardId}
              onLocationChange={(newLat, newLng, newAddress, newCity, newState) => {
                setLat(newLat)
                setLng(newLng)
                setAddress(newAddress)
                setCity(newCity)
                setState(newState)
              }}
              onWardChange={(newWardId) => setWardId(newWardId)}
            />
            <button
              onClick={() => setStep('confirm')}
              className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
            >
              Confirm Location & Continue
            </button>
          </>
        )}

        {step === 'confirm' && aiResult && (
          <StepConfirm
            title={editedTitle}
            description={editedDescription}
            result={{ ...aiResult, category: editedCategory as OrchestratorResult['category'], title: editedTitle, description: editedDescription }}
            imagePreview={imagePreview}
            address={address}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
