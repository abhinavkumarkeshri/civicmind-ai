'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import type { OrchestratorResult } from '@/lib/types/database'

interface Props {
  analysis: OrchestratorResult
}

export function AIExplainCard({ analysis }: Props) {
  const [expanded, setExpanded] = useState(false)

  const agents = [
    { label: 'Vision Agent', result: analysis.vision },
    { label: 'Severity Agent', result: analysis.severityAgent },
    { label: 'Repair Planning', result: analysis.repair },
  ]

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-500/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">AI Analysis</p>
            <p className="text-xs text-slate-400">
              Overall confidence: {Math.round(analysis.vision.confidence * 100)}%
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-blue-500/20 divide-y divide-[#1f2d45]">
          {agents.map(({ label, result }) => (
            <div key={label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-300">{label}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-16 rounded-full bg-[#1f2d45] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.round(result.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-blue-400">{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>
              <ul className="space-y-1 mb-2">
                {result.reasoning.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                    {r}
                  </li>
                ))}
              </ul>
              {result.recommendation && (
                <p className="text-xs text-blue-300 bg-blue-500/10 rounded-lg px-2.5 py-1.5">
                  {result.recommendation}
                </p>
              )}
            </div>
          ))}

          {analysis.nearbyContext.length > 0 && (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-300 mb-2">Nearby Context</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.nearbyContext.map((ctx, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 border border-slate-500/20 text-slate-400">
                    {ctx}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
