// Shared Frontend Types

export interface User {
  id: string
  email: string
  full_name: string
  role: 'CHIEF_OF_STAFF' | 'DIVISIONAL_HEAD' | 'VIEWER'
  division_id?: string
  is_active: boolean
}

export interface Meeting {
  id: string
  title: string
  date: string
  location: string
  description?: string
  attendees?: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface ActionItem {
  id: string
  meeting_id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CLOSED'
  target_date: string
  responsible_user_id: string
  responsible_division_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Division {
  id: string
  name: string
  company?: string
  description?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  status: number
  message: string
  data?: T
  error?: string
  timestamp: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}
