import { useEffect, useState, useRef } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { CheckSquare, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActionItem {
  id: string
  action_item_number?: number
  title: string
  description: string
  status: string
  priority: string
  target_date: string
  full_name: string
  division_name: string
  meeting_number?: number
  meeting_title?: string
}

interface User {
  id: string
  email: string
  full_name: string
  title: string
  role: string
  division_id: string
}

export default function ActionItems() {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<ActionItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ActionItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [filterMeeting, setFilterMeeting] = useState('ALL')
  const [filterResponsiblePerson, setFilterResponsiblePerson] = useState('ALL')
  const [filterDivision, setFilterDivision] = useState('ALL')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [responsiblePersonId, setResponsiblePersonId] = useState('')
  const [divisionalHeads, setDivisionalHeads] = useState<User[]>([])
  const { request, loading } = useApi()
  const { user } = useAuth()

  useEffect(() => {
    loadActionItems()
    loadDivisionalHeads()
  }, [])

  const loadDivisionalHeads = async () => {
    try {
      const data = await request('GET', '/users/divisional-heads')
      setDivisionalHeads(data.users || [])
      if (data.users && data.users.length > 0) {
        setResponsiblePersonId(data.users[0].id)
      }
    } catch (error) {
      console.error('Failed to load divisional heads:', error)
    }
  }

  const loadActionItems = async () => {
    try {
      const data = await request('GET', '/action-items')
      setItems(data.actionItems || [])
      setFilteredItems(data.actionItems || [])
    } catch (error) {
      console.error('Failed to load action items:', error)
    }
  }

  useEffect(() => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(item => item.status === filterStatus)
    }
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(item => item.priority === filterPriority)
    }
    if (filterMeeting !== 'ALL') {
      filtered = filtered.filter(item => item.meeting_title === filterMeeting)
    }
    if (filterResponsiblePerson !== 'ALL') {
      filtered = filtered.filter(item => item.full_name === filterResponsiblePerson)
    }
    if (filterDivision !== 'ALL') {
      filtered = filtered.filter(item => item.division_name === filterDivision)
    }
    setFilteredItems(filtered)
  }, [searchTerm, filterStatus, filterPriority, filterMeeting, filterResponsiblePerson, filterDivision, items])

  const handleAddItem = async (e: any) => {
    e.preventDefault?.()

    if (!title || !title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!responsiblePersonId) {
      toast.error('Please select a responsible person')
      return
    }

    try {
      const selectedPerson = divisionalHeads.find(h => h.id === responsiblePersonId)
      if (!selectedPerson) {
        toast.error('Invalid person selected')
        return
      }

      const response = await request('POST', '/action-items', {
        title: title.trim(),
        description: description.trim(),
        priority,
        targetDate: dueDate || new Date().toISOString().split('T')[0],
        meetingId: '46e0d600-4781-4fe0-9dfb-6fbcc2811879',
        responsibleUserId: responsiblePersonId,
        responsibleDivisionId: selectedPerson.division_id
      })

      toast.success('✅ Action item created!')
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setDueDate('')
      if (divisionalHeads.length > 0) {
        setResponsiblePersonId(divisionalHeads[0].id)
      }

      setTimeout(() => {
        loadActionItems()
        titleInputRef.current?.focus()
      }, 500)
    } catch (error: any) {
      console.error('API Error:', error?.response?.data || error)
      toast.error(error?.response?.data?.error || 'Failed to create action item')
    }
  }

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

  const handleDeleteItem = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the action item "${title}"?`)) {
      try {
        await request('DELETE', `/action-items/${id}`)
        toast.success('Action item deleted successfully!')
        loadActionItems()
      } catch (error) {
        toast.error('Failed to delete action item')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Action Items</h1>
        <p className="text-slate-600">Add new items below and manage all action items • Total: <span className="font-semibold text-slate-900">{items.length}</span></p>
      </div>

      {/* Add Item Form */}
      {user?.role === 'CHIEF_OF_STAFF' && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-slate-900 mb-4">➕ Create New Action Item</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3">
              <select
                value={responsiblePersonId}
                onChange={(e) => setResponsiblePersonId(e.target.value)}
                className="col-span-6 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select Responsible Person *</option>
                {divisionalHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.full_name} {head.title ? `- ${head.title}` : ''} ({head.role})
                  </option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleAddItem}
                type="button"
                className="col-span-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-semibold text-sm flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4 mr-1" /> Create
              </button>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem(e)}
                placeholder="[NEW] Title *"
                className="col-span-3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem(e)}
                placeholder="Description"
                className="col-span-9 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <input
          type="text"
          placeholder="Search action items by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="flex flex-wrap gap-3">
          <span className="text-slate-600 font-semibold">Filter by:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>

        <select
          value={filterMeeting}
          onChange={(e) => setFilterMeeting(e.target.value)}
          className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Meetings</option>
          {Array.from(new Set(items.map(item => item.meeting_title))).filter(Boolean).map(meeting => (
            <option key={meeting} value={meeting}>{meeting}</option>
          ))}
        </select>

        <select
          value={filterResponsiblePerson}
          onChange={(e) => setFilterResponsiblePerson(e.target.value)}
          className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Responsible Persons</option>
          {Array.from(new Set(items.map(item => item.full_name))).filter(Boolean).map(person => (
            <option key={person} value={person}>{person}</option>
          ))}
        </select>

        <select
          value={filterDivision}
          onChange={(e) => setFilterDivision(e.target.value)}
          className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Divisions</option>
          {Array.from(new Set(items.map(item => item.division_name))).filter(Boolean).map(division => (
            <option key={division} value={division}>{division}</option>
          ))}
        </select>
        </div>
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
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group relative"
            >
              <div className="cursor-pointer" onClick={() => {}}>
                <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {item.action_item_number && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                        AI#{item.action_item_number}
                      </span>
                    )}
                    {item.meeting_number && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        Meeting #{item.meeting_number}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                </div>
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
                  <p className="font-semibold text-slate-900">Due In</p>
                  <p className="text-xs">{Math.max(0, Math.ceil((new Date(item.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days</p>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteItem(item.id, item.title)
                }}
                className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete action item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No action items found</p>
            {user?.role === 'CHIEF_OF_STAFF' && (
              <p className="text-slate-500 text-sm mt-2">Use the form above to create your first action item</p>
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
