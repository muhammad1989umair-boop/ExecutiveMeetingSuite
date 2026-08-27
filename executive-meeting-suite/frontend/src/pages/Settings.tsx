import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Users } from 'lucide-react'

interface DivisionalHead {
  id: string
  email: string
  full_name: string
  title: string
  role: string
  division_id: string
}

interface DivisionalHeadWithDetails extends DivisionalHead {
  division_name?: string
  company?: string
}

export default function Settings() {
  const [divisionalHeads, setDivisionalHeads] = useState<DivisionalHeadWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { request } = useApi()
  const { user } = useAuth()

  useEffect(() => {
    loadHeads()
  }, [])

  const loadHeads = async () => {
    try {
      setLoading(true)
      const data = await request('GET', '/users/divisional-heads')
      const heads = data.users || []
      setDivisionalHeads(heads)
    } catch (error) {
      console.error('Failed to load heads:', error)
      toast.error('Failed to load divisional heads')
    } finally {
      setLoading(false)
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
        <p className="text-slate-600">Manage team members and system configuration</p>
      </div>

      {/* Divisional Heads Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>Organization Divisional Heads</span>
          </h2>
          <span className="ml-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {divisionalHeads.length} members
          </span>
        </div>

        <p className="text-slate-600 mb-6">
          These divisional heads are available as responsible persons when creating action items.
        </p>

        {/* Heads Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading divisional heads...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">S.No</th>
                  <th className="px-4 py-3 font-semibold">Full Name</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Division</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {divisionalHeads.length > 0 ? (
                  divisionalHeads.map((head, index) => (
                    <tr key={head.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{head.full_name}</td>
                      <td className="px-4 py-3">{head.title}</td>
                      <td className="px-4 py-3">{head.division_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-blue-600">{head.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {head.company || 'Gatronova'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No divisional heads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-slate-700">
          <p className="font-semibold mb-2">💡 Connected with Action Items</p>
          <p>All divisional heads listed above are available in the "Select Responsible Person" dropdown when creating new action items.</p>
        </div>
      </div>
    </div>
  )
}
