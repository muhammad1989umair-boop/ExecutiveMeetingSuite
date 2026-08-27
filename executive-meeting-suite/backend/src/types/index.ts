// Shared Type Definitions

export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string
  role: 'CHIEF_OF_STAFF' | 'DIVISIONAL_HEAD' | 'VIEWER'
  division_id?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Meeting {
  id: string
  title: string
  date: Date
  location: string
  description?: string
  attendees?: string[]
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface ActionItem {
  id: string
  meeting_id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CLOSED'
  target_date: Date
  responsible_person_id: string
  responsible_person_name?: string
  responsible_person_email?: string
  division_id?: string
  company_id?: string
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface Division {
  id: string
  name: string
  company?: string
  description?: string
  created_at: Date
  updated_at: Date
}

export interface AuthPayload {
  id: string
  email: string
  role: string
  division_id?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export type ApiStatus = 'success' | 'error' | 'pending'
