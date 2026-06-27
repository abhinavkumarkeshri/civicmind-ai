'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import type { OrchestratorResult } from '@/lib/types/database'
import { fileToBase64, getMimeType, uploadComplaintImage } from '@/services/supabase/storage'

interface AgentStep {
  id: string
  label: string
  description: string
  status: 'pending' | 'running' | 'done' | 'error'
  result?: string
}

interface Props {
  imageFile: File
  lat: number
  lng: number
  userId: string
  idempotencyKey: string
  onComplete: (result: OrchestratorResult, imageUrl: string) => void
  onError: (err: string) => void
}

const INITIAL_STEPS: AgentStep[] = [
  { id: 'upload',   label: 'Uploading Image',       description: 'Storing photo securely',         status: 'pending' },
  { id: 'vision',   label: 'Vision Agent',           description: 'Identifying the issue',          status: 'pending' },
  { id: 'geo',      label: 'Geo Agent',              description: 'Reverse geocoding location',     status: 'pending' },
  { id: 'duplicate',label: 'Duplicate Detection',   description: 'Checking nearby reports',        status: 'pending' },
  { id: 'severity', label: 'Severity Agent',         description: 'Calculating risk level',         status: 'pending' },
  { id: 'repair',   label: 'Repair Planning Agent',  description: 'Estimating repair details',      status: 'pending' },
]

export function StepAITimeline({ imageFile, lat, lng, userId, idempotencyKey, onComplete, onError }: Props) {
  const [steps, setSteps] = useState<AgentStep[]>(INITIAL_STEPS)

  const setStepStatus = (id: string, status: AgentStep['status'], result?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, ...(result ? { result } : {}) } : s)),
    )
  }

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        // Step 1 — Upload image
        setStepStatus('upload', 'running')
        const imageUrl = await uploadComplaintImage(userId, idempotencyKey, imageFile)
        if (cancelled) return
        setStepStatus('upload', 'done', 'Uploaded successfully')

        // Steps 2+ — run orchestrator
        setStepStatus('vision', 'running')
        const base64 = await fileToBase64(imageFile)
        const mime = getMimeType(imageFile)

        // Mark all remaining steps running sequentially via streaming progress
        // We simulate step-by-step by polling via SSE — here we call the API and
        // animate steps optimistically with timing
        const timings = [
          { id: 'vision',    delay: 0 },
          { id: 'geo',       delay: 1200 },
          { id: 'duplicate', delay: 2000 },
          { id: 'severity',  delay: 3200 },
          { id: 'repair',    delay: 4500 },
        ]

        // Start optimistic animations
        timings.forEach(({ id, delay }) => {
          setTimeout(() => {
            if (!cancelled) setStepStatus(id, 'running')
          }, delay)
        })

        // Fire the actual API call
        const res = await fetch('/api/ai/orchestrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: mime, lat, lng }),
        })

        if (cancelled) return

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'AI analysis failed')
        }

        const result: OrchestratorResult = await res.json()

        // Mark all agent steps done with results
        setStepStatus('vision',    'done', `${result.category.replace('_', ' ')} detected (${Math.round(result.vision.confidence * 100)}% confidence)`)
        setStepStatus('geo',       'done', result.address)
        setStepStatus('duplicate', 'done', result.duplicates.length > 0 ? `${result.duplicates.length} similar report(s) nearby` : 'No duplicates found')
        setStepStatus('severity',  'done', `${result.severity.toUpperCase()} — score ${result.severityScore}/100`)
        setStepStatus('repair',    'done', `${result.department} · Est. ${result.estimatedHours}h · ₹${result.estimatedCost.toLocaleString('en-IN')}`)

        setTimeout(() => {
          if (!cancelled) onComplete(result, imageUrl)
        }, 600)
      } catch (err) {
        if (!cancelled) {
          steps.forEach((s) => {
            if (s.status === 'running') setStepStatus(s.id, 'error')
          })
          onError(err instanceof Error ? err.message : 'Analysis failed')
        }
      }
    }

    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Analysing with CivicMind AI</h2>
        <p className="text-sm text-slate-400">5 agents are processing your report simultaneously.</p>
      </div>

      <div className="rounded-xl border border-[#1f2d45] bg-[#0d1526] divide-y divide-[#1f2d45]">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3 p-4">
            <div className="mt-0.5 flex-shrink-0">
              {step.status === 'done' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
              )}
              {step.status === 'running' && (
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                </div>
              )}
              {step.status === 'error' && (
                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                </div>
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border border-[#1f2d45] bg-[#1a2235]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  step.status === 'done' ? 'text-slate-200'
                  : step.status === 'running' ? 'text-blue-300'
                  : step.status === 'error' ? 'text-red-400'
                  : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {step.result ? (
                <p className="text-xs text-emerald-400 mt-0.5 truncate">{step.result}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
