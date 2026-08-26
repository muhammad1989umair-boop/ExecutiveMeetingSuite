import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useStore } from '../store'
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Target
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface DashboardMetrics {
  metrics: {
    totalActions: number
    openActions: number
    closedActions: number
    pendingReview: number
    overdueActions: number
    completionRate: string
  }
  byPriority: Array<{ priority: string; count: number }>
  byDivision: Array<{ division: string; count: number }>
}

interface Activity {
  id: string
  title: string
  status: string
  full_name: string
  division_name: string
  updated_at: string
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const { request, loading } = useApi()
  const { dashboard, setDashboard } = useStore()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await request('GET', '/dashboard/metrics')
        setMetrics(data)
        setDashboard(data.metrics)
      } catch (error) {
        console.error('Failed to load metrics:', error)
      }
    }

    const fetchActivities = async () => {
      try {
        const data = await request('GET', '/dashboard/activity')
        setActivities(data.activities)
      } catch (error) {
        console.error('Failed to load activities:', error)
      }
    }

    fetchMetrics()
    fetchActivities()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const pieData = metrics?.byPriority ? {
    labels: metrics.byPriority.map(p => p.priority),
    datasets: [{
      data: metrics.byPriority.map(p => p.count),
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  } : null

  const barData = metrics?.byDivision ? {
    labels: metrics.byDivision.map(d => d.division),
    datasets: [{
      label: 'Open Action Items',
      data: metrics.byDivision.map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      borderRadius: 6
    }]
  } : null

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your executive meetings and action items</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Actions */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Actions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.metrics.totalActions || 0}</p>
            </div>
            <Target className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        {/* Open Actions */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.metrics.openActions || 0}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.metrics.closedActions || 0}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.metrics.pendingReview || 0}</p>
            </div>
            <Users className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.metrics.overdueActions || 0}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-white mt-2">{metrics?.metrics.completionRate || 0}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-white opacity-30" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">By Priority</h2>
          {pieData ? (
            <div className="flex justify-center">
              <div style={{ width: '250px', height: '250px' }}>
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No data available</p>
          )}
        </div>

        {/* Division Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">By Division</h2>
          {barData ? (
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
            </div>
          ) : (
            <p className="text-slate-500">No data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">{activity.title}</p>
                  <p className="text-sm text-slate-600">
                    {activity.full_name} • {activity.division_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    activity.status === 'CLOSED' ? 'bg-green-100 text-green-700' :
                    activity.status === 'PENDING_REVIEW' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-8">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
