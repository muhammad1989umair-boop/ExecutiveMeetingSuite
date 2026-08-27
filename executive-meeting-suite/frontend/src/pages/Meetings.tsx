import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Plus, Calendar, MapPin, Users, X } from 'lucide-react'

interface Meeting {
  id: string
  meeting_number: number
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
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [participantForm, setParticipantForm] = useState({ name: '', title: '', company: '', email: '' })
  const [addedParticipants, setAddedParticipants] = useState<Array<{ name: string; title: string; company: string; email: string }>>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    location: ''
  })
  const navigate = useNavigate()
  const { request, loading } = useApi()
  const { user } = useAuth()

  useEffect(() => {
    loadMeetings()
  }, [])

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
    if (addedParticipants.length === 0) {
      toast.error('Please add at least one participant')
      return
    }
    try {
      await request('POST', '/meetings', {
        title: formData.title,
        description: formData.description,
        meetingDate: formData.meetingDate,
        location: formData.location,
        participants: addedParticipants
      })
      toast.success('Meeting created successfully!')
      setShowForm(false)
      setFormData({ title: '', description: '', meetingDate: '', location: '' })
      setAddedParticipants([])
      loadMeetings()
    } catch (error) {
      toast.error('Failed to create meeting')
    }
  }

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!participantForm.name || !participantForm.email) {
      toast.error('Name and Email are required')
      return
    }
    setAddedParticipants([...addedParticipants, participantForm])
    setParticipantForm({ name: '', title: '', company: '', email: '' })
    setShowAddParticipant(false)
    toast.success('Participant added!')
  }

  const removeParticipant = (index: number) => {
    setAddedParticipants(addedParticipants.filter((_, i) => i !== index))
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

            {/* Participants Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-900">
                  Participants <span className="text-red-500">*</span>
                </label>
                {!showAddParticipant && (
                  <button
                    type="button"
                    onClick={() => setShowAddParticipant(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Participant</span>
                  </button>
                )}
              </div>

              {/* Add Participant Form */}
              {showAddParticipant && (
                <div className="bg-slate-50 rounded-lg border border-slate-300 p-4 space-y-3">
                  <h3 className="font-semibold text-slate-900">Add New Participant</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={participantForm.name}
                      onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={participantForm.title}
                      onChange={(e) => setParticipantForm({ ...participantForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={participantForm.company}
                      onChange={(e) => setParticipantForm({ ...participantForm, company: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={participantForm.email}
                      onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddParticipant(false)
                        setParticipantForm({ name: '', title: '', company: '', email: '' })
                      }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Added Participants List */}
              {addedParticipants.length > 0 ? (
                <div className="bg-slate-50 rounded-lg border border-slate-300 p-4 space-y-2">
                  {addedParticipants.map((participant, index) => (
                    <div key={index} className="flex justify-between items-start bg-white p-3 rounded border border-slate-200">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{participant.name}</p>
                        <p className="text-sm text-slate-600">{participant.title}</p>
                        <p className="text-xs text-slate-500">{participant.company}</p>
                        <p className="text-xs text-slate-500">{participant.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="text-red-500 hover:text-red-700 ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg border border-slate-300 p-4 text-center text-slate-500 text-sm">
                  No participants added yet. Click "Add Participant" to get started.
                </div>
              )}
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
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {meeting.title}
                    </h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      ID: {meeting.meeting_number}
                    </span>
                  </div>
                </div>
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
