/**
 * Reusable AI Summary Service
 *
 * Consumed by: Officer Dashboard, Analytics page, Weekly Reports, Notifications.
 * Never tied to a single route — call directly from Server Components or Server Actions.
 */
import { getProModel } from '@/lib/ai/models'
import { buildSummaryPrompt } from '@/prompts'
import type { AISummaryResult } from '@/lib/types/database'

export type SummaryContext = 'officer_dashboard' | 'weekly_report' | 'analytics' | 'notification'

export interface SummaryInput {
  totalComplaints: number
  criticalCount: number
  highCount: number
  resolvedToday: number
  totalEstimatedBudget: number
  topCategories: Array<{ category: string; count: number }>
  mostAffectedWards: Array<{ ward: string; count: number }>
  unresolvedCriticals: Array<{ id: string; title: string; address: string | null }>
}

const CONTEXT_PREAMBLES: Record<SummaryContext, string> = {
  officer_dashboard: 'Generate a concise daily briefing for the ward officer.',
  weekly_report: 'Generate a weekly performance summary for the municipality.',
  analytics: 'Generate a data-driven analytics summary for the management team.',
  notification: 'Generate a brief notification-style summary (1-2 sentences max).',
}

export async function generateSummary(
  input: SummaryInput,
  context: SummaryContext = 'officer_dashboard',
): Promise<AISummaryResult> {
  const preamble = CONTEXT_PREAMBLES[context]
  const contextStr = `
${preamble}

Current data:
- Total open complaints: ${input.totalComplaints}
- Critical: ${input.criticalCount}, High: ${input.highCount}
- Resolved today: ${input.resolvedToday}
- Total estimated repair budget: ₹${input.totalEstimatedBudget.toLocaleString('en-IN')}
- Top categories: ${input.topCategories.map((c) => `${c.category} (${c.count})`).join(', ')}
- Most affected wards: ${input.mostAffectedWards.map((w) => `${w.ward} (${w.count} complaints)`).join(', ')}
- Unresolved criticals: ${input.unresolvedCriticals.map((c) => c.title).join('; ') || 'None'}
`

  const model = getProModel()
  const prompt = buildSummaryPrompt(contextStr)

  try {
    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text())

    return {
      headline: parsed.headline ?? 'No critical issues requiring immediate attention.',
      criticalCount: parsed.criticalCount ?? input.criticalCount,
      estimatedBudget: parsed.estimatedBudget ?? input.totalEstimatedBudget,
      mostAffectedAreas: parsed.mostAffectedAreas ?? [],
      priorityActions: parsed.priorityActions ?? [],
      reasoning: parsed.reasoning ?? '',
    }
  } catch {
    return {
      headline: `${input.criticalCount} critical issues require immediate attention.`,
      criticalCount: input.criticalCount,
      estimatedBudget: input.totalEstimatedBudget,
      mostAffectedAreas: input.mostAffectedWards.map((w) => w.ward),
      priorityActions: [
        'Review all critical complaints immediately',
        'Assign field officers to top affected areas',
        'Update status on in-progress repairs',
      ],
      reasoning: 'AI summary unavailable — displaying calculated metrics.',
    }
  }
}
