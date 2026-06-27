import { getFastModel } from '@/lib/ai/models'
import { VISION_PROMPT } from '@/prompts'
import type { ComplaintCategory, AgentResult } from '@/lib/types/database'

export interface VisionResult extends AgentResult {
  value: ComplaintCategory
  title: string
  description: string
  tags: string[]
}

export async function runVisionAgent(imageBase64: string, mimeType = 'image/jpeg'): Promise<VisionResult> {
  const model = getFastModel()

  const result = await model.generateContent([
    { text: VISION_PROMPT },
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ])

  const raw = result.response.text()

  try {
    const parsed = JSON.parse(raw)
    return {
      value: parsed.value as ComplaintCategory,
      title: parsed.title ?? 'Civic Issue Reported',
      description: parsed.description ?? '',
      tags: parsed.tags ?? [],
      confidence: parsed.confidence ?? 0.5,
      reasoning: parsed.reasoning ?? [],
      recommendation: parsed.recommendation ?? '',
    }
  } catch {
    // Graceful fallback
    return {
      value: 'other',
      title: 'Civic Issue Reported',
      description: 'Unable to analyse image automatically.',
      tags: [],
      confidence: 0,
      reasoning: ['Image analysis failed — please describe the issue manually.'],
      recommendation: 'Please select a category manually.',
    }
  }
}
