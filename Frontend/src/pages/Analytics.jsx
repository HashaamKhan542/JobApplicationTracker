import { useState, useEffect } from 'react'
import { getAnalyticsSummary } from '../api/client'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Interviewing: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#ef4444'
}

function Analytics() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await getAnalyticsSummary()
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!summary) return <div className="loading">No data available</div>

  const pieData = [
    { name: 'Applied', value: summary.applied },
    { name: 'Interviewing', value: summary.interviewing },
    { name: 'Offer', value: summary.offer },
    { name: 'Rejected', value: summary.rejected }
  ].filter(item => item.value > 0)

  const barData = [
    { name: 'Applied', count: summary.applied },
    { name: 'Interviewing', count: summary.interviewing },
    { name: 'Offer', count: summary.offer },
    { name: 'Rejected', count: summary.rejected }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h2>Analytics Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p className="stat-number">{summary.total}</p>
        </div>
        <div className="stat-card">
          <h3>Interview Rate</h3>
          <p className="stat-number">{summary.interview_rate}%</p>
        </div>
        <div className="stat-card">
          <h3>Offer Rate</h3>
          <p className="stat-number">{summary.offer_rate}%</p>
        </div>
        <div className="stat-card">
          <h3>Active Applications</h3>
          <p className="stat-number">{summary.applied + summary.interviewing}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Application Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />   
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Pipeline Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics