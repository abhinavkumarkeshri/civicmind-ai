'use client'

import { ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { OrchestratorResult, ComplaintCategory } from '@/lib/types/database'
import { CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from '@/lib/constants'
import { SeverityBadge } from '@/components/shared/SeverityBadge'

interface Props {
  result: OrchestratorResult
  imagePreview: string
  onEdit: (field: 'title' | 'description' | 'category', value: string) => void
}

const CATEGORIES: ComplaintCategory[] = [
  'pothole', 'garbage', 'streetlight', 'water_leak', 'drain', 'fallen_tree', 'road_damage', 'other',
]

export function StepAIReview({ result, imagePreview, onEdit }: Props) {
  const [showReasoning, setShowReasoning] = useState(false)
  const confidence = Math.round(result.vision.confidence * 100)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-1">AI Analysis Complete</h2>
        <p className="text-sm text-slate-400">Review and edit if needed before continuing.</p>
      </div>

      {/* Confidence header */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-200">AI Confidence</span>
            <span className="text-sm font-bold text-blue-400">{confidence}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1f2d45] overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Duplicate warning */}
      {result.duplicates.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Similar report exists nearby</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              &ldquo;{result.duplicates[0].title}&rdquo; — {result.duplicates[0].distance}m away
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Your report will be linked as additional verification.
            </p>
          </div>
        </div>
      )}

      {/* Category selector */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
        <select
          value={result.category}
          onChange={(e) => onEdit('category', e.target.value)}
          className="w-full rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Severity</label>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={result.severity} />
          <span className="text-xs text-slate-500">Score: {result.severityScore}/100</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Title</label>
        <input
          type="text"
          value={result.title}
          onChange={(e) => onEdit('title', e.target.value)}
          className="w-full rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500"
          maxLength={120}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Description</label>
        <textarea
          value={result.description}
          onChange={(e) => onEdit('description', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
          maxLength={500}
        />
      </div>

      {/* Repair plan preview */}
      <div className="rounded-xl border border-[#1f2d45] bg-[#0d1526] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Repair Plan Preview</span>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{result.estimatedHours}h est.</span>
            <span>₹{result.estimatedCost.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <p className="text-xs text-slate-300">{result.department}</p>
      </div>

      {/* AI Reasoning toggle */}
      <button
        onClick={() => setShowReasoning(!showReasoning)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showReasoning ? 'Hide' : 'Show'} AI reasoning
      </button>

      {showReasoning && (
        <ul className="space-y-1.5 pl-3 border-l border-[#1f2d45]">
          {result.vision.reasoning.map((r, i) => (
            <li key={i} className="text-xs text-slate-400">{r}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
