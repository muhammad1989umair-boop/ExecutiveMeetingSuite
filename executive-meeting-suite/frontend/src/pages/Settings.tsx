import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Users, Building2, Layers } from 'lucide-react'

interface DivisionalHead {
  id: string
  email: string
  full_name: string
  title: string
  role: string
  division_id: string
  phone?: string
}

interface DivisionalHeadWithDetails extends DivisionalHead {
  division_name?: string
  company?: string
}

interface Division {
  id: string
  name: string
  company: string
  description?: string
}

interface Company {
  id: string
  name: string
  description?: string
}

export default function Settings() {
  const [divisionalHeads, setDivisionalHeads] = useState<DivisionalHeadWithDetails[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [newDivision, setNewDivision] = useState({ name: '', company: '' })
  const [newCompany, setNewCompany] = useState({ name: '' })
  const [newHead, setNewHead] = useState({ email: '', fullName: '', title: '', divisionId: '', password: '', phone: '' })
  const [addingDivision, setAddingDivision] = useState(false)
  const [addingCompany, setAddingCompany] = useState(false)
  const [addingHead, setAddingHead] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { request } = useApi()
  const { user } = useAuth()

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const headsData = await request('GET', '/users/divisional-heads')
      const divisionsData = await request('GET', '/master-data/divisions')
      const companiesData = await request('GET', '/master-data/companies')

      setDivisionalHeads(headsData.users || [])
      setDivisions(divisionsData.divisions || [])
      setCompanies(companiesData.companies || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load master data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDivision = async () => {
    if (!newDivision.name || !newDivision.company) {
      toast.error('Division name and company are required')
      return
    }

    try {
      setAddingDivision(true)
      await request('POST', '/master-data/divisions', newDivision)
      toast.success('Division added successfully')
      setNewDivision({ name: '', company: '' })
      await loadAllData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add division')
    } finally {
      setAddingDivision(false)
    }
  }

  const handleAddCompany = async () => {
    if (!newCompany.name) {
      toast.error('Company name is required')
      return
    }

    try {
      setAddingCompany(true)
      await request('POST', '/master-data/companies', newCompany)
      toast.success('Company added successfully')
      setNewCompany({ name: '' })
      await loadAllData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add company')
    } finally {
      setAddingCompany(false)
    }
  }

  const handleAddHead = async () => {
    if (!newHead.email || !newHead.fullName || !newHead.title || !newHead.divisionId || !newHead.password || !newHead.phone) {
      toast.error('All fields are required')
      return
    }

    if (newHead.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setAddingHead(true)
      await request('POST', '/users', newHead)
      toast.success('Divisional head added successfully')
      setNewHead({ email: '', fullName: '', title: '', divisionId: '', password: '', phone: '' })
      await loadAllData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add divisional head')
    } finally {
      setAddingHead(false)
    }
  }

  const handleDeleteHead = async (headId: string) => {
    if (!confirm('Are you sure you want to delete this divisional head?')) {
      return
    }

    try {
      setDeletingId(headId)
      await request('PATCH', `/users/${headId}/deactivate`, {})
      toast.success('Divisional head deleted successfully')
      await loadAllData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete divisional head')
    } finally {
      setDeletingId(null)
    }
  }

  if (user?.role !== 'CHIEF_OF_STAFF') {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">You do not have permission to access settings</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading master data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage organization master data</p>
      </div>

      {/* Divisional Heads Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Organization Divisional Heads</span>
          </h2>
          <span className="ml-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {divisionalHeads.length} members
          </span>
        </div>

        {/* Add Divisional Head Form */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-700 mb-4">Add New Divisional Head</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
              <input
                type="email"
                placeholder="email@company.com"
                value={newHead.email}
                onChange={(e) => setNewHead({ ...newHead, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="John Doe"
                value={newHead.fullName}
                onChange={(e) => setNewHead({ ...newHead, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
              <input
                type="text"
                placeholder="Division Head"
                value={newHead.title}
                onChange={(e) => setNewHead({ ...newHead, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone *</label>
              <input
                type="tel"
                placeholder="+92-300-1234567"
                value={newHead.phone}
                onChange={(e) => setNewHead({ ...newHead, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Division *</label>
              <select
                value={newHead.divisionId}
                onChange={(e) => setNewHead({ ...newHead, divisionId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
              <input
                type="text"
                placeholder="Auto-filled from Division"
                value={newHead.divisionId ? divisions.find(d => d.id === newHead.divisionId)?.company || '' : ''}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password (min 8 chars) *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newHead.password}
                onChange={(e) => setNewHead({ ...newHead, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddHead}
            disabled={addingHead}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {addingHead ? 'Adding...' : 'Add Divisional Head'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">S.No</th>
                <th className="px-4 py-3 font-semibold">Full Name</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Division</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Action</th>
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
                    <td className="px-4 py-3 text-slate-600">{head.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {head.company || 'Gatronova'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteHead(head.id)}
                        disabled={deletingId === head.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold disabled:opacity-50 transition-colors"
                      >
                        {deletingId === head.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No divisional heads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Divisions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-6 h-6 text-purple-600" />
            <span>Divisions</span>
          </h2>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
            {divisions.length} divisions
          </span>
        </div>

        {/* Add Division Form */}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-700 mb-3">Add New Division</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Division name"
              value={newDivision.name}
              onChange={(e) => setNewDivision({ ...newDivision, name: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Company"
              value={newDivision.company}
              onChange={(e) => setNewDivision({ ...newDivision, company: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddDivision}
              disabled={addingDivision}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {addingDivision ? 'Adding...' : 'Add Division'}
            </button>
          </div>
        </div>

        {/* Divisions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">S.No</th>
                <th className="px-4 py-3 font-semibold">Division Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {divisions.length > 0 ? (
                divisions.map((div, index) => (
                  <tr key={div.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{div.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {div.company}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No divisions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Companies Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-green-600" />
            <span>Companies</span>
          </h2>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            {companies.length} companies
          </span>
        </div>

        {/* Add Company Form */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-700 mb-3">Add New Company</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Company name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ name: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleAddCompany}
              disabled={addingCompany}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {addingCompany ? 'Adding...' : 'Add Company'}
            </button>
          </div>
        </div>

        {/* Companies Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">S.No</th>
                <th className="px-4 py-3 font-semibold">Company Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {companies.length > 0 ? (
                companies.map((company, index) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{company.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
