import { useState, useEffect } from 'react'
import { getAnalyticsSummary } from '../api/client'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Interviewing: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#ef4444'
}

const STAT_META = [
  { key: 'total', label: 'Total Applications', icon: '📋', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'interview_rate', label: 'Interview Rate', icon: '🎯', color: '#f59e0b', bg: '#fffbeb', suffix: '%' },
  { key: 'offer_rate', label: 'Offer Rate', icon: '🏆', color: '#10b981', bg: '#ecfdf5', suffix: '%' },
  { key: 'active', label: 'Active', icon: '⚡', color: '#8b5cf6', bg: '#f5f3ff' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
      padding: '10px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{label || payload[0].name}</p>
      <p style={{ color: '#64748b', fontSize: 14 }}>{payload[0].value} applications</p>
    </div>
  )
}

function FunnelStep({ label, count, total, color, isLast }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const width = Math.max(pct, 8)
  return (
    <div className="funnel-step">
      <div className="funnel-bar-wrap">
        <div className="funnel-bar" style={{ width: `${width}%`, background: color }} />
      </div>
      <div className="funnel-labels">
        <span className="funnel-label">{label}</span>
        <span className="funnel-count" style={{ color }}>{count} <span className="funnel-pct">({pct}%)</span></span>
      </div>
      {!isLast && <div className="funnel-arrow">↓</div>}
    </div>
  )
}

function Analytics() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSummary() }, [])

  const fetchSummary = async () => {
    try {
      const res = await getAnalyticsSummary()
      setSummary(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading analytics...</div>
  if (!summary) return <div className="loading">No data available</div>

  const stats = [
    { ...STAT_META[0], value: summary.total },
    { ...STAT_META[1], value: summary.interview_rate },
    { ...STAT_META[2], value: summary.offer_rate },
    { ...STAT_META[3], value: summary.applied + summary.interviewing },
  ]

  const pieData = [
    { name: 'Applied', value: summary.applied },
    { name: 'Interviewing', value: summary.interviewing },
    { name: 'Offer', value: summary.offer },
    { name: 'Rejected', value: summary.rejected },
  ].filter(d => d.value > 0)

  const barData = [
    { name: 'Applied', count: summary.applied, fill: '#3b82f6' },
    { name: 'Interviewing', count: summary.interviewing, fill: '#f59e0b' },
    { name: 'Offer', count: summary.offer, fill: '#10b981' },
    { name: 'Rejected', count: summary.rejected, fill: '#ef4444' },
  ]

  const funnelSteps = [
    { label: 'Applications Sent', count: summary.total, color: '#3b82f6' },
    { label: 'Reached Interview Stage', count: summary.interviewing + summary.offer, color: '#f59e0b' },
    { label: 'Received Offers', count: summary.offer, color: '#10b981' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Track your job search progress at a glance
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.key} className="stat-card-v2" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-body">
              <p className="stat-label-v2">{s.label}</p>
              <p className="stat-number-v2" style={{ color: s.color }}>
                {s.value}{s.suffix || ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Donut Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Status Breakdown</h3>
            <span className="chart-total-badge">{summary.total} total</span>
          </div>
          {pieData.length === 0 ? (
            <div className="chart-empty">No applications yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: '#475569', fontSize: 13 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend">
                {pieData.map(d => (
                  <div key={d.name} className="donut-legend-item">
                    <span className="donut-dot" style={{ background: STATUS_COLORS[d.name] }} />
                    <span>{d.name}</span>
                    <strong>{d.value}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Applications by Stage</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map(entry => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3>Hiring Funnel</h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Conversion through each stage</span>
        </div>
        <div className="funnel-container">
          {funnelSteps.map((step, i) => (
            <FunnelStep
              key={step.label}
              {...step}
              total={summary.total}
              isLast={i === funnelSteps.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics
