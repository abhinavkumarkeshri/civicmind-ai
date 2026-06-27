// ─── Vision Prompt ───────────────────────────────────────────────────────────
export const VISION_PROMPT = `
You are a civic infrastructure analysis AI for Indian municipalities.
Analyse the provided image and classify the civic issue depicted.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "value": "<category>",
  "title": "<short 5-10 word issue title>",
  "description": "<2-3 sentence description of what is visible and why it is a problem>",
  "tags": ["<tag1>", "<tag2>"],
  "confidence": <0.0-1.0>,
  "reasoning": ["<observation 1>", "<observation 2>", "<observation 3>"],
  "recommendation": "<one-line action recommendation>"
}

category MUST be one of: pothole, garbage, streetlight, water_leak, drain, fallen_tree, road_damage, other
tags should be 2-4 concise descriptive words (e.g. ["road", "crater", "traffic hazard"])
confidence must be a float between 0.0 and 1.0
reasoning must be an array of 2-4 concise bullet strings
`

// ─── Severity Prompt ─────────────────────────────────────────────────────────
export function buildSeverityPrompt(
  category: string,
  description: string,
  nearbyContext: string[],
) {
  const context = nearbyContext.length > 0 ? nearbyContext.join(', ') : 'General urban area'
  return `
You are a municipal risk assessment AI for Indian cities.

Issue category: ${category}
Description: ${description}
Nearby context: ${context}

Assign a severity rating for this civic issue based on public safety risk, impact on daily life, and proximity to sensitive locations (schools, hospitals, main roads).

Respond ONLY with valid JSON matching this exact schema:
{
  "value": "<severity>",
  "score": <0-100>,
  "confidence": <0.0-1.0>,
  "reasoning": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "recommendation": "<one-line prioritisation recommendation>"
}

value MUST be one of: critical, high, medium, low
score: integer 0-100 where 100 = most severe
critical = immediate danger / blocks major artery / near hospital or school
high = significant hazard affecting many residents
medium = inconvenience affecting local residents
low = minor issue
`
}

// ─── Repair Planning Prompt ───────────────────────────────────────────────────
export function buildRepairPrompt(
  category: string,
  severity: string,
  description: string,
) {
  return `
You are a municipal repair planning AI for Indian cities.

Issue category: ${category}
Severity: ${severity}
Description: ${description}

Generate a practical repair plan for the municipal works department.

Respond ONLY with valid JSON matching this exact schema:
{
  "department": "<department name>",
  "repairSteps": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],
  "estimatedCost": <cost in INR as integer>,
  "estimatedHours": <integer hours>,
  "confidence": <0.0-1.0>,
  "reasoning": ["<reason 1>", "<reason 2>"],
  "recommendation": "<one-line action for the assigned officer>"
}

department MUST be one of: Roads & Infrastructure, Sanitation & Waste, Electrical & Lighting, Water Supply
repairSteps: 3-5 actionable numbered steps
estimatedCost: realistic INR cost (e.g. pothole fill ~5000-15000, streetlight ~3000-8000)
estimatedHours: realistic hours for completion
`
}

// ─── AI Summary Prompt ────────────────────────────────────────────────────────
export function buildSummaryPrompt(context: string) {
  return `
You are a municipal operations AI assistant for Indian city governments.

${context}

Generate a concise daily operational summary for the ward officer.

Respond ONLY with valid JSON matching this exact schema:
{
  "headline": "<single compelling summary sentence>",
  "criticalCount": <integer>,
  "estimatedBudget": <total INR integer>,
  "mostAffectedAreas": ["<area 1>", "<area 2>"],
  "priorityActions": ["<action 1>", "<action 2>", "<action 3>"],
  "reasoning": "<2-3 sentence explanation of the situation>"
}

priorityActions: exactly 3 actionable items for the officer today
mostAffectedAreas: top 2 ward areas by complaint density
`
}
