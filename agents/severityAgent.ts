import { getFastModel } from '@/lib/ai/models'
import { buildSeverityPrompt } from '@/prompts'
import type { ComplaintSeverity, AgentResult } from '@/lib/types/database'

export interface SeverityResult extends AgentResult {
  value: ComplaintSeverity
  score: number
}

export async function runSeverityAgent(
  category: string,
  description: string,
  nearbyContext: string[],
): Promise<SeverityResult> {
  const model = getFastModel()
  const prompt = buildSeverityPrompt(category, description, nearbyContext)

  try {
    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text())

    return {
      value: (parsed.value ?? 'medium') as ComplaintSeverity,
      score: Math.min(100, Math.max(0, parseInt(parsed.score ?? 50))),
      confidence: parsed.confidence ?? 0.7,
      reasoning: parsed.reasoning ?? [],
      recommendation: parsed.recommendation ?? '',
    }
  } catch {
    return {
      value: 'medium',
      score: 50,
      confidence: 0,
      reasoning: ['Severity assessment unavailable — defaulting to medium.'],
      recommendation: 'Manual severity review recommended.',
    }
  }
}
