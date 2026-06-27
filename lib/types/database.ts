export type UserRole = 'citizen' | 'officer' | 'admin'
export type ComplaintCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'water_leak'
  | 'drain'
  | 'fallen_tree'
  | 'road_damage'
  | 'other'
export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed'
export type ComplaintSeverity = 'critical' | 'high' | 'medium' | 'low'
export type VerificationType = 'upvote' | 'confirm'
export type NotificationType = 'status_change' | 'assignment' | 'verified' | 'resolved'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  ward_id: string | null
  points: number
  badges: string[]
  created_at: string
}

export interface Ward {
  id: string
  name: string
  city: string
  state: string
  created_at: string
}

export interface Department {
  id: string
  name: string
  categories: string[]
  contact_email: string | null
  created_at: string
}

export interface Complaint {
  id: string
  reporter_id: string
  ward_id: string | null
  title: string
  description: string
  category: ComplaintCategory
  status: ComplaintStatus
  severity: ComplaintSeverity
  severity_score: number
  lat: number | null
  lng: number | null
  address: string | null
  department_id: string | null
  assigned_officer_id: string | null
  before_image_url: string | null
  ai_analysis: OrchestratorResult | null
  ai_confidence: number | null
  ai_reasoning: string | null
  repair_steps: string[]
  estimated_cost: number | null
  estimated_hours: number | null
  upvote_count: number
  duplicate_of: string | null
  idempotency_key: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  // joined
  profiles?: Profile
  wards?: Ward
  departments?: Department
}

export interface ComplaintUpdate {
  id: string
  complaint_id: string
  author_id: string
  old_status: ComplaintStatus | null
  new_status: ComplaintStatus | null
  message: string | null
  created_at: string
  profiles?: Profile
}

export interface ComplaintVerification {
  id: string
  complaint_id: string
  user_id: string
  type: VerificationType
  created_at: string
}

export type OfficerStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export interface Officer {
  id: string
  user_id: string
  ward_id: string
  department_id: string | null
  status: OfficerStatus
  approved_by: string | null
  approved_at: string | null
  suspended_at: string | null
  suspension_reason: string | null
  created_at: string
  updated_at: string
  // joined
  profiles?: Profile
  wards?: Ward
}

export interface Admin {
  id: string
  user_id: string
  email: string
  created_at: string
  updated_at: string
  last_login: string | null
}

export interface Notification {
  id: string
  user_id: string
  complaint_id: string | null
  type: NotificationType
  message: string
  read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  complaint_id: string | null
  type: NotificationType
  message: string
  read: boolean
  created_at: string
  complaints?: Pick<Complaint, 'id' | 'title' | 'category'>
}

// AI types
export interface AgentResult {
  value: string | number
  confidence: number
  reasoning: string[]
  recommendation: string
}

export interface OrchestratorResult {
  // Vision
  category: ComplaintCategory
  title: string
  description: string
  tags: string[]
  vision: AgentResult

  // Geo
  address: string
  city: string
  nearbyContext: string[]

  // Duplicate
  duplicates: Array<{
    id: string
    title: string
    distance: number
    status: ComplaintStatus
  }>

  // Severity
  severity: ComplaintSeverity
  severityScore: number
  severityAgent: AgentResult

  // Repair Planning
  department: string
  repairSteps: string[]
  estimatedCost: number
  estimatedHours: number
  repair: AgentResult
}

export interface AISummaryResult {
  headline: string
  criticalCount: number
  estimatedBudget: number
  mostAffectedAreas: string[]
  priorityActions: string[]
  reasoning: string
}
