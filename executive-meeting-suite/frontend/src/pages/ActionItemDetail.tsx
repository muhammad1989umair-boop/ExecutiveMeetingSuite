import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ActionItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/action-items')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Action Items</span>
      </button>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Action Item Details</h1>
        <p className="text-slate-600">Action Item ID: {id}</p>
        <p className="text-slate-500 text-sm mt-4">Complete action item details, responses, and status updates will be displayed here.</p>
      </div>
    </div>
  )
}
