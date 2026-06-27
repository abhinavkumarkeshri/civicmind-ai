import { getProModel } from '@/lib/ai/models'
import { buildRepairPrompt } from '@/prompts'
import type { AgentResult } from '@/lib/types/database'

export interface RepairResult extends AgentResult {
  department: string
  repairSteps: string[]
  estimatedCost: number
  estimatedHours: number
}

export async function runRepairPlanningAgent(
  category: string,
  severity: string,
  description: string,
): Promise<RepairResult> {
  const model = getProModel()
  const prompt = buildRepairPrompt(category, severity, description)

  try {
    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text())

    return {
      department: parsed.department ?? 'Roads & Infrastructure',
      repairSteps: parsed.repairSteps ?? [],
      estimatedCost: parsed.estimatedCost ?? 10000,
      estimatedHours: parsed.estimatedHours ?? 8,
      confidence: parsed.confidence ?? 0.8,
      reasoning: parsed.reasoning ?? [],
      recommendation: parsed.recommendation ?? '',
      value: parsed.department ?? 'Roads & Infrastructure',
    }
  } catch {
    return {
      department: 'Roads & Infrastructure',
      repairSteps: ['Inspect the site', 'Cordone off affected area', 'Arrange repair crew', 'Complete repairs', 'Post-repair inspection'],
      estimatedCost: 10000,
      estimatedHours: 8,
      confidence: 0,
      reasoning: ['Repair planning unavailable — using defaults.'],
      recommendation: 'Manual assessment by assigned officer required.',
      value: 'Roads & Infrastructure',
    }
  }
}
