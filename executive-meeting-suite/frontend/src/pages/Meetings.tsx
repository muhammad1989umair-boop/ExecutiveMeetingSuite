import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Plus, Calendar, MapPin, Users, X } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  description: string
  meeting_date: string
  location: string
  attendees: string[]
  open_items: number
  closed_items: number
}

interface DivisionalHead {
  id: string
  email: string
  full_name: string
  title: string
  division_name: string
  company: string
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [showForm, setShowForm] = useState(false)
  const [divisionalHeads, setDivisionalHeads] = useState<DivisionalHead[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    location: '',
    participants: [] as string[]
  })
  const navigate = useNavigate()
  const { request, loading } = useApi()
  const { user } = useAuth()

  useEffect(() => {
    loadMeetings()
    loadDivisionalHeads()
  }, [])

  const loadDivisionalHeads = async () => {
    try {
      const data = await request('GET', '/users/divisional-heads')
      setDivisionalHeads(data.users || [])
    } catch (error) {
      console.error('Failed to load divisional heads:', error)
    }
  }

  const loadMeetings = async () => {
    try {
      const data = await request('GET', '/meetings')
      setMeetings(data.meetings)
    } catch (error) {
      console.error('Failed to load meetings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.participants.length === 0) {
      toast.error('Please select at least one participant')
      return
    }
    try {
      await request('POST', '/meetings', {
        title: formData.title,
        description: formData.description,
        meetingDate: formData.meetingDate,
        location: formData.location,
        participants: formData.participants
      })
      toast.success('Meeting created successfully!')
      setShowForm(false)
      setFormData({ title: '', description: '', meetingDate: '', location: '', participants: [] })
      loadMeetings()
    } catch (error) {
      toast.error('Failed to create meeting')
    }
  }

  const toggleParticipant = (headId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(headId)
        ? prev.participants.filter(id => id !== headId)
        : [...prev.participants, headId]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meetings</h1>
          <p className="text-slate-600">Manage your executive meetings</p>
        </div>
        {user?.role === 'CHIEF_OF_STAFF' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Meeting</span>
          </button>
        )}
      </div>

      {/* Create Meeting Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Meeting</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Meeting Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="datetime-local"
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            ></textarea>

            {/* Participants Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Participants <span className="text-red-500">*</span>
              </label>
              <div className="bg-slate-50 rounded-lg border border-slate-300 p-4 max-h-48 overflow-y-auto">
                {divisionalHeads.length > 0 ? (
                  <div className="space-y-2">
                    {divisionalHeads.map((head) => (
                      <label key={head.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.participants.includes(head.id)}
                          onChange={() => toggleParticipant(head.id)}
                          className="w-4 h-4 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{head.full_name}</p>
                          <p className="text-xs text-slate-500">{head.division_name} - {head.company}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Loading participants...</p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Selected: {formData.participants.length} participant{formData.participants.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create Meeting
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-200 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meetings List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading meetings...</p>
          </div>
        ) : meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {meeting.title}
                </h3>
                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {meeting.open_items || 0} Open
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {meeting.closed_items || 0} Closed
                  </span>
                </div>
              </div>
              <p className="text-slate-600 mb-4">{meeting.description}</p>
              <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{meeting.location || 'TBD'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{meeting.attendees?.length || 0} attendees</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No meetings yet</p>
            {user?.role === 'CHIEF_OF_STAFF' && (
              <p className="text-slate-500 text-sm mt-2">Create your first meeting to get started</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
