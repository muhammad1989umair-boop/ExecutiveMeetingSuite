import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { ArrowLeft, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { request } = useApi()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: ''
  })

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.title) {
      toast.error('Title is required')
      return
    }

    try {
      await request('POST', `/action-items`, {
        title: newItem.title,
        description: newItem.description,
        priority: newItem.priority,
        targetDate: newItem.dueDate || new Date().toISOString().split('T')[0],
        meetingId: id,
        responsibleUserId: 'f7347db5-82f8-4d75-ad16-0e418fb4c6b7',
        responsibleDivisionId: '3013ca42-1121-4e45-a4b8-df111478e08f'
      })

      setNewItem({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
      setShowAddForm(false)
      toast.success('Action item created! Go to Action Items page to view.')
      navigate('/action-items')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create action item')
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/meetings')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Meetings</span>
      </button>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Create Action Item</h1>
        <p className="text-slate-600 mb-6">Add a new action item for this meeting</p>

        <form onSubmit={handleAddActionItem} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Add details..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={newItem.dueDate}
                onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Action Item
            </button>
            <button
              type="button"
              onClick={() => navigate('/meetings')}
              className="flex-1 bg-slate-300 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
