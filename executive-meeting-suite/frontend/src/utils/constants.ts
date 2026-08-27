// Frontend Constants

export const APP_NAME = 'Executive Meeting Suite'
export const APP_VERSION = '1.0.0'

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const
export const STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'COMPLETED',
  'CLOSED'
] as const

export const ROLES = {
  CHIEF_OF_STAFF: 'Chief of Staff',
  DIVISIONAL_HEAD: 'Divisional Head',
  VIEWER: 'Viewer'
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile'
  },
  MEETINGS: {
    LIST: '/meetings',
    CREATE: '/meetings',
    GET: (id: string) => `/meetings/${id}`,
    UPDATE: (id: string) => `/meetings/${id}`,
    DELETE: (id: string) => `/meetings/${id}`
  },
  ACTION_ITEMS: {
    LIST: '/action-items',
    CREATE: '/action-items',
    GET: (id: string) => `/action-items/${id}`,
    UPDATE: (id: string) => `/action-items/${id}`,
    DELETE: (id: string) => `/action-items/${id}`
  },
  DASHBOARD: {
    METRICS: '/dashboard/metrics',
    TIMELINE: '/dashboard/timeline',
    ACTIVITY: '/dashboard/activity'
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`
  }
} as const

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme'
} as const
