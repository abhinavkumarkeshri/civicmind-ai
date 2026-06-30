import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  // Warn at startup — fail gracefully per-request
  console.warn('[CivicMind] GEMINI_API_KEY not set. AI features will be disabled.')
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

// Fast model — Vision, Severity, Duplicate agents (low latency)
export const FAST_MODEL = process.env.GEMINI_FAST_MODEL ?? 'gemini-2.5-flash'

// Pro model — Repair Planning, AI Summary (deeper reasoning)
export const PRO_MODEL = process.env.GEMINI_PRO_MODEL ?? 'gemini-2.5-flash'

export function getFastModel() {
  return genAI.getGenerativeModel({
    model: FAST_MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  })
}

export function getProModel() {
  return genAI.getGenerativeModel({
    model: PRO_MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  })
}
