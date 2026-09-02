import { create } from 'zustand'

export interface Dashboard {
  totalActions: number
  openActions: number
  closedActions: number
  pendingReview: number
  overdueActions: number
  completionRate: string
}

export interface Meeting {
  id: string
  title: string
  description: string
  meeting_date: string
  location: string
  attendees: string[]
  audio_url?: string
  notes?: string
  open_items?: number
  closed_items?: number
}

export interface ActionItem {
  id: string
  meeting_id: string
  title: string
  description: string
  responsible_user_id: string
  responsible_division_id: string
  status: string
  priority: string
  target_date: string
  created_at: string
  full_name?: string
  division_name?: string
}

interface Store {
  dashboard: Dashboard | null
  meetings: Meeting[]
  actionItems: ActionItem[]
  setDashboard: (dashboard: Dashboard) => void
  setMeetings: (meetings: Meeting[]) => void
  setActionItems: (items: ActionItem[]) => void
  addMeeting: (meeting: Meeting) => void
  addActionItem: (item: ActionItem) => void
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void
  clearDashboard: () => void
}

export const useStore = create<Store>((set) => ({
  dashboard: null,
  meetings: [],
  actionItems: [],
  setDashboard: (dashboard) => set({ dashboard }),
  setMeetings: (meetings) => set({ meetings }),
  setActionItems: (actionItems) => set({ actionItems }),
  addMeeting: (meeting) => set((state) => ({
    meetings: [...state.meetings, meeting]
  })),
  addActionItem: (item) => set((state) => ({
    actionItems: [...state.actionItems, item]
  })),
  updateActionItem: (id, updates) => set((state) => ({
    actionItems: state.actionItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  clearDashboard: () => set({ dashboard: null })
}))
