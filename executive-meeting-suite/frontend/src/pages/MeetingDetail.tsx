import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

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
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Meeting Details</h1>
        <p className="text-slate-600">Meeting ID: {id}</p>
        <p className="text-slate-500 text-sm mt-4">Complete meeting details, action items, and notes will be displayed here.</p>
      </div>
    </div>
  )
}
