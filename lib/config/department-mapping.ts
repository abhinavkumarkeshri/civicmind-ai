/**
 * Department Workflow Configuration
 * Maps complaint categories to responsible departments
 */

export interface DepartmentMapping {
  id?: string
  category: string
  departmentId: string
  departmentName: string
}

// Default category to department mappings
export const CATEGORY_DEPARTMENT_MAPPING: Record<string, { name: string; email?: string }> = {
  pothole: {
    name: 'Roads Department',
    email: 'roads@civicmind.local',
  },
  road_damage: {
    name: 'Roads Department',
    email: 'roads@civicmind.local',
  },
  streetlight: {
    name: 'Electricity Department',
    email: 'electricity@civicmind.local',
  },
  garbage: {
    name: 'Sanitation Department',
    email: 'sanitation@civicmind.local',
  },
  drain: {
    name: 'Drainage Department',
    email: 'drainage@civicmind.local',
  },
  water_leak: {
    name: 'Water Supply Department',
    email: 'water@civicmind.local',
  },
  fallen_tree: {
    name: 'Parks Department',
    email: 'parks@civicmind.local',
  },
  other: {
    name: 'Municipal Office',
    email: 'office@civicmind.local',
  },
}

/**
 * Get department info for a complaint category
 */
export function getDepartmentForCategory(category: string): { name: string; email?: string } | null {
  return CATEGORY_DEPARTMENT_MAPPING[category] || null
}

/**
 * Complaint status workflow
 */
export type WorkflowStatus =
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'department_accepted'
  | 'work_started'
  | 'in_progress'
  | 'completed'
  | 'resolved'
  | 'closed'

export const WORKFLOW_PROGRESSION: WorkflowStatus[] = [
  'submitted',
  'verified',
  'assigned',
  'department_accepted',
  'work_started',
  'in_progress',
  'completed',
  'resolved',
  'closed',
]

/**
 * Get allowed next statuses for current status
 */
export function getNextStatuses(currentStatus: WorkflowStatus): WorkflowStatus[] {
  const currentIndex = WORKFLOW_PROGRESSION.indexOf(currentStatus)
  if (currentIndex === -1) return []
  return WORKFLOW_PROGRESSION.slice(currentIndex + 1)
}

/**
 * Check if transition is allowed
 */
export function isValidTransition(from: string, to: string): boolean {
  const fromIndex = WORKFLOW_PROGRESSION.indexOf(from as WorkflowStatus)
  const toIndex = WORKFLOW_PROGRESSION.indexOf(to as WorkflowStatus)

  if (fromIndex === -1 || toIndex === -1) return false
  return toIndex > fromIndex
}
