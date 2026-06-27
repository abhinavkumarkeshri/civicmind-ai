import { runVisionAgent } from '@/agents/visionAgent'
import { runGeoAgent } from '@/agents/geoAgent'
import { runDuplicateAgent } from '@/agents/duplicateAgent'
import { runSeverityAgent } from '@/agents/severityAgent'
import { runRepairPlanningAgent } from '@/agents/repairPlanningAgent'
import type { OrchestratorResult, ComplaintCategory } from '@/lib/types/database'

export interface AnalyzeInput {
  imageBase64: string
  mimeType?: string
  lat: number
  lng: number
}

/**
 * Master orchestrator — chains all 5 agents.
 *
 * Execution order:
 *   Step 1+2 (parallel): visionAgent + geoAgent
 *   Step 3: duplicateAgent   (needs category from vision)
 *   Step 4: severityAgent    (needs description + nearbyContext)
 *   Step 5: repairPlanningAgent (needs severity)
 */
export async function analyzeComplaint(input: AnalyzeInput): Promise<OrchestratorResult> {
  const { imageBase64, mimeType = 'image/jpeg', lat, lng } = input

  // ── Step 1+2 — parallel ──────────────────────────────────────────────────
  const [visionResult, geoResult] = await Promise.all([
    runVisionAgent(imageBase64, mimeType),
    runGeoAgent(lat, lng),
  ])

  // ── Step 3 — duplicate detection ────────────────────────────────────────
  const duplicates = await runDuplicateAgent(lat, lng, visionResult.value as ComplaintCategory)

  // ── Step 4 — severity ────────────────────────────────────────────────────
  const severityResult = await runSeverityAgent(
    visionResult.value,
    visionResult.description,
    geoResult.nearbyContext,
  )

  // ── Step 5 — repair planning ─────────────────────────────────────────────
  const repairResult = await runRepairPlanningAgent(
    visionResult.value,
    severityResult.value,
    visionResult.description,
  )

  // ── Merge ────────────────────────────────────────────────────────────────
  return {
    // Vision
    category: visionResult.value,
    title: visionResult.title,
    description: visionResult.description,
    tags: visionResult.tags,
    vision: visionResult,

    // Geo
    address: geoResult.address,
    city: geoResult.city,
    nearbyContext: geoResult.nearbyContext,

    // Duplicate
    duplicates,

    // Severity
    severity: severityResult.value,
    severityScore: severityResult.score,
    severityAgent: severityResult,

    // Repair
    department: repairResult.department,
    repairSteps: repairResult.repairSteps,
    estimatedCost: repairResult.estimatedCost,
    estimatedHours: repairResult.estimatedHours,
    repair: repairResult,
  }
}
