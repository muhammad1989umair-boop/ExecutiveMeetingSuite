// Common Helper Functions

export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const isOverdue = (targetDate: string | Date): boolean => {
  const d = new Date(targetDate)
  return d < new Date() && d.toDateString() !== new Date().toDateString()
}

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'HIGH':
      return 'text-red-600 bg-red-50'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-50'
    case 'LOW':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'OPEN':
      return 'text-blue-600 bg-blue-50'
    case 'IN_PROGRESS':
      return 'text-purple-600 bg-purple-50'
    case 'PENDING_REVIEW':
      return 'text-orange-600 bg-orange-50'
    case 'COMPLETED':
      return 'text-green-600 bg-green-50'
    case 'CLOSED':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export const camelToTitle = (text: string): string => {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
