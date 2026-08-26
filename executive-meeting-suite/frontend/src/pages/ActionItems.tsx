import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { CheckSquare, Filter, ChevronDown } from 'lucide-react'

interface ActionItem {
  id: string
  title: string
  description: string
  status: string
  priority: string
  target_date: string
  full_name: string
  division_name: string
}

export default function ActionItems() {
  const [items, setItems] = useState<ActionItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ActionItem[]>([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const { request, loading } = useApi()
  const { user } = useAuth()

  useEffect(() => {
    loadActionItems()
  }, [])

  const loadActionItems = async () => {
    try {
      const data = await request('GET', '/action-items')
      setItems(data.actionItems)
      setFilteredItems(data.actionItems)
    } catch (error) {
      console.error('Failed to load action items:', error)
    }
  }

  useEffect(() => {
    let filtered = items
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(item => item.status === filterStatus)
    }
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(item => item.priority === filterPriority)
    }
    setFilteredItems(filtered)
  }, [filterStatus, filterPriority, items])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'OPEN': 'bg-yellow-100 text-yellow-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'PENDING_REVIEW': 'bg-purple-100 text-purple-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CLOSED': 'bg-slate-100 text-slate-700'
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'HIGH': 'text-red-600',
      'MEDIUM': 'text-yellow-600',
      'LOW': 'text-green-600'
    }
    return colors[priority] || 'text-slate-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Action Items</h1>
        <p className="text-slate-600">Track and manage all action items</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="text-slate-600 font-semibold">Filters:</span>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="COMPLETED">Completed</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading action items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex-1">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className={`text-sm font-semibold ${getPriorityColor(item.priority)}`}>
                    ● {item.priority}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-3">{item.description}</p>

              <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 pt-3 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900">{item.full_name}</p>
                  <p className="text-xs">{item.division_name}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Target Date</p>
                  <p className="text-xs">{new Date(item.target_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">Due</p>
                  <p className="text-xs">{Math.max(0, Math.ceil((new Date(item.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No action items found</p>
            {user?.role === 'CHIEF_OF_STAFF' && (
              <p className="text-slate-500 text-sm mt-2">Create your first meeting to add action items</p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700">
          Showing {filteredItems.length} action item{filteredItems.length !== 1 ? 's' : ''} out of {items.length} total
        </div>
      )}
    </div>
  )
}
