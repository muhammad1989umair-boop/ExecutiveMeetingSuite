import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Calendar, MapPin, Users, X, Trash2 } from 'lucide-react'

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
  division_name?: string
  company?: string
  company_name?: string
  responsible_person_name?: string
}

interface DivisionalHead {
  id: string
  email: string
  full_name: string
  title: string
  division_name: string
  company: string
}

interface Division {
  id: string
  name: string
  company: string
}

interface Company {
  id: string
  name: string
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [participantForm, setParticipantForm] = useState({ name: '', title: '', company: '', email: '' })
  const [addedParticipants, setAddedParticipants] = useState<Array<{ name: string; title: string; company: string; email: string }>>([])
  const getDefaultDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase())
  }

  const capitalizeFirstLetter = (str: string) => {
    if (str.length === 0) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: getDefaultDateTime(),
    location: '13th Floor - G&T Tower',
    division: '',
    company: '',
    responsiblePerson: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCompany, setFilterCompany] = useState('ALL')
  const [filterDivision, setFilterDivision] = useState('ALL')
  const [filterResponsiblePerson, setFilterResponsiblePerson] = useState('ALL')
  const [divisionalHeads, setDivisionalHeads] = useState<DivisionalHead[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [companies, setCompanies] = useState<Company[]>([])

  const navigate = useNavigate()
  const { request, loading } = useApi()
  const { user } = useAuth()

  useEffect(() => {
    loadMeetings()
    loadDivisionalHeads()
    loadDivisions()
    loadCompanies()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [meetings, searchTerm, filterCompany, filterDivision, filterResponsiblePerson])

  useEffect(() => {
    if (divisionalHeads.length > 0 && !formData.responsiblePerson) {
      setFormData(prev => ({ ...prev, responsiblePerson: divisionalHeads[0].id }))
    }
  }, [divisionalHeads])

  const loadMeetings = async () => {
    try {
      const data = await request('GET', '/meetings')
      const sortedMeetings = (data.meetings || []).sort((a: Meeting, b: Meeting) =>
        new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime()
      )
      setMeetings(sortedMeetings)
    } catch (error) {
      console.error('Failed to load meetings:', error)
    }
  }

  const loadDivisionalHeads = async () => {
    try {
      const data = await request('GET', '/users/divisional-heads')
      setDivisionalHeads(data.users || [])
    } catch (error) {
      console.error('Failed to load divisional heads:', error)
    }
  }

  const loadDivisions = async () => {
    try {
      const data = await request('GET', '/meetings/master-data/divisions')
      setDivisions(data.divisions || [])
    } catch (error) {
      console.error('Failed to load divisions:', error)
    }
  }

  const loadCompanies = async () => {
    try {
      const data = await request('GET', '/meetings/master-data/companies')
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Failed to load companies:', error)
    }
  }

  const applyFilters = () => {
    let filtered = meetings

    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCompany !== 'ALL') {
      filtered = filtered.filter(meeting =>
        meeting.attendees?.some(email =>
          divisionalHeads.some(head => head.email === email && head.company === filterCompany)
        )
      )
    }

    if (filterDivision !== 'ALL') {
      filtered = filtered.filter(meeting =>
        meeting.attendees?.some(email =>
          divisionalHeads.some(head => head.email === email && head.division_name === filterDivision)
        )
      )
    }

    if (filterResponsiblePerson !== 'ALL') {
      filtered = filtered.filter(meeting =>
        meeting.attendees?.includes(filterResponsiblePerson)
      )
    }

    // Sort by date chronologically
    filtered.sort((a, b) =>
      new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime()
    )

    setFilteredMeetings(filtered)
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
        division: formData.division,
        company: formData.company,
        responsiblePerson: formData.responsiblePerson,
        participants: addedParticipants
      })
      toast.success('Meeting created successfully!')
      setShowForm(false)
      setFormData({ title: '', description: '', meetingDate: getDefaultDateTime(), location: '13th Floor - G&T Tower', division: '', company: '', responsiblePerson: '' })
      setAddedParticipants([])
      loadMeetings()
    } catch (error) {
      toast.error('Failed to create meeting')
    }
  }

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!participantForm.name) {
      toast.error('Name is required')
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

  const handleDeleteMeeting = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the meeting "${title}"? This will also delete all associated action items.`)) {
      try {
        await request('DELETE', `/meetings/${id}`)
        toast.success('Meeting deleted successfully!')
        loadMeetings()
      } catch (error) {
        toast.error('Failed to delete meeting')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meetings</h1>
          <p className="text-slate-600">Manage your executive meetings • Total: <span className="font-semibold text-slate-900">{meetings.length}</span></p>
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
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
              placeholder="13th Floor - G&T Tower"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: toTitleCase(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-16"
            ></textarea>

            {/* Division, Company, Responsible Person */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Division</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Division</option>
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company</label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Company</option>
                  {companies.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Responsible Person</label>
                <select
                  value={formData.responsiblePerson}
                  onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Responsible Person</option>
                  {divisionalHeads.map(head => (
                    <option key={head.id} value={head.id}>{head.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

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
                      onChange={(e) => setParticipantForm({ ...participantForm, name: toTitleCase(e.target.value) })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant(e)}
                      autoFocus
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
                      placeholder="Email Address"
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search meetings by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="text-slate-600 font-semibold pt-2">Filter by:</span>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Companies</option>
            {[...new Set(divisionalHeads.map(head => head.company))].map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Divisions</option>
            {[...new Set(divisionalHeads.map(head => head.division_name))].map(division => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>

          <select
            value={filterResponsiblePerson}
            onChange={(e) => setFilterResponsiblePerson(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Persons</option>
            {divisionalHeads.map(head => (
              <option key={head.email} value={head.email}>{head.full_name}</option>
            ))}
          </select>

          {(searchTerm || filterCompany !== 'ALL' || filterDivision !== 'ALL' || filterResponsiblePerson !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterCompany('ALL')
                setFilterDivision('ALL')
                setFilterResponsiblePerson('ALL')
              }}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading meetings...</p>
          </div>
        ) : filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group relative"
            >
              {/* Delete Button (Admin Only) */}
              {user?.role === 'CHIEF_OF_STAFF' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteMeeting(meeting.id, meeting.title)
                  }}
                  className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete meeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div
                onClick={() => navigate(`/meetings/${meeting.id}`)}
                className="cursor-pointer"
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
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
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
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Division:</span>
                  <span>{meeting.division_name || '—'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Company:</span>
                  <span>{meeting.company_name || '—'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Person:</span>
                  <span>{meeting.responsible_person_name || '—'}</span>
                </div>
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
