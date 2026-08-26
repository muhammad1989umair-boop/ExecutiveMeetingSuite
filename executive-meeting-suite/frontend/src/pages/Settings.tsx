import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Plus, Trash2, Users } from 'lucide-react'

interface DivisionalHead {
  id: string
  name: string
  title: string
  email: string
  phone: string
  divisionId: string
  company: string
}

export default function Settings() {
  const [divisionalHeads, setDivisionalHeads] = useState<DivisionalHead[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    divisionId: ''
  })
  const { request } = useApi()
  const { user } = useAuth()

  const handleAddHead = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await request('POST', '/divisional-heads/heads', formData)
      toast.success('Divisional head added successfully!')
      setShowForm(false)
      setFormData({ name: '', title: '', email: '', phone: '', divisionId: '' })
      loadHeads()
    } catch (error) {
      toast.error('Failed to add divisional head')
    }
  }

  const loadHeads = async () => {
    try {
      const data = await request('GET', '/divisional-heads/heads')
      setDivisionalHeads(data.heads)
    } catch (error) {
      console.error('Failed to load heads:', error)
    }
  }

  if (user?.role !== 'CHIEF_OF_STAFF') {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">You do not have permission to access settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage divisional heads and system configuration</p>
      </div>

      {/* Divisional Heads Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>Divisional Heads</span>
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Head</span>
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAddHead} className="mb-6 p-6 bg-slate-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-slate-900 mb-4">Add New Divisional Head</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Add Divisional Head
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
        )}

        {/* Heads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {divisionalHeads.length > 0 ? (
                divisionalHeads.map((head) => (
                  <tr key={head.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{head.name}</td>
                    <td className="px-4 py-3">{head.title}</td>
                    <td className="px-4 py-3">{head.email}</td>
                    <td className="px-4 py-3">{head.company}</td>
                    <td className="px-4 py-3">
                      <button className="text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1">
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No divisional heads added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 mt-4">
          💡 Tip: You can add or remove divisional heads at any time. They will automatically get access to action items assigned to them.
        </p>
      </div>
    </div>
  )
}
