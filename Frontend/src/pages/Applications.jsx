import { useState, useEffect, useMemo } from 'react'
import { getApplications, createApplication, updateApplication, deleteApplication } from '../api/client'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_META = {
  Applied:      { color: '#3b82f6', bg: '#eff6ff' },
  Interviewing: { color: '#f59e0b', bg: '#fffbeb' },
  Offer:        { color: '#10b981', bg: '#ecfdf5' },
  Rejected:     { color: '#ef4444', bg: '#fff1f2' },
}

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#f97316']
const avatarColor = (name) => AVATAR_COLORS[(name || 'A').charCodeAt(0) % AVATAR_COLORS.length]

function CompanyAvatar({ name }) {
  return (
    <div className="company-avatar" style={{ background: avatarColor(name) }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function EmptyState({ filtered, onAdd }) {
  return (
    <div className="empty-state-v2">
      <div className="empty-icon">📭</div>
      <h3>{filtered ? 'No matches found' : 'No applications yet'}</h3>
      <p>{filtered ? 'Try a different search or filter.' : 'Start tracking your job search — add your first application.'}</p>
      {!filtered && (
        <button className="btn-primary" onClick={onAdd} style={{ marginTop: '1rem' }}>
          + Add Application
        </button>
      )}
    </div>
  )
}

const EMPTY_FORM = { company: '', role: '', status: 'Applied', notes: '' }

function Applications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => { fetchApplications() }, [])

  const fetchApplications = async () => {
    try {
      const res = await getApplications()
      setApplications(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditingApp(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (app) => {
    setEditingApp(app)
    setForm({ company: app.company, role: app.role, status: app.status, notes: app.notes || '' })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingApp(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async () => {
    if (!form.company.trim() || !form.role.trim()) return
    try {
      if (editingApp) {
        await updateApplication(editingApp.id, form)
      } else {
        await createApplication(form)
      }
      closeForm()
      fetchApplications()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this application?')) {
      await deleteApplication(id)
      fetchApplications()
    }
  }

  // Counts per status for filter tabs
  const counts = useMemo(() => {
    const c = { All: applications.length }
    STATUSES.forEach(s => { c[s] = applications.filter(a => a.status === s).length })
    return c
  }, [applications])

  // Filtered list
  const filtered = useMemo(() => {
    let list = applications
    if (filterStatus !== 'All') list = list.filter(a => a.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
      )
    }
    return list
  }, [applications, filterStatus, search])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return <div className="loading">Loading applications...</div>

  return (
    <div className="page">
      {/* Header */}
      <div className="apps-header">
        <div className="apps-header-left">
          <p className="apps-greeting">{greeting()} 👋</p>
          <h2>My Applications</h2>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          + Add Application
        </button>
      </div>

      {/* Mini stats strip */}
      <div className="apps-stats-strip">
        {STATUSES.map(s => (
          <div key={s} className="apps-stat-chip" style={{ borderLeft: `3px solid ${STATUS_META[s].color}` }}>
            <span className="apps-stat-chip-count" style={{ color: STATUS_META[s].color }}>{counts[s]}</span>
            <span className="apps-stat-chip-label">{s}</span>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="apps-controls">
        <div className="apps-search-wrap">
          <span className="apps-search-icon">🔍</span>
          <input
            className="apps-search"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="apps-search-clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>
        <div className="apps-filter-tabs">
          {['All', ...STATUSES].map(s => (
            <button
              key={s}
              className={`apps-filter-tab ${filterStatus === s ? 'active' : ''}`}
              style={filterStatus === s && s !== 'All'
                ? { background: STATUS_META[s].bg, color: STATUS_META[s].color, borderColor: STATUS_META[s].color }
                : {}
              }
              onClick={() => setFilterStatus(s)}
            >
              {s}
              <span className="apps-filter-count">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <EmptyState filtered={search || filterStatus !== 'All'} onAdd={openAdd} />
      ) : (
        <div className="applications-grid">
          {filtered.map(app => (
            <div
              key={app.id}
              className="application-card-v2"
              style={{ borderTop: `3px solid ${STATUS_META[app.status]?.color || '#e2e8f0'}` }}
            >
              <div className="card-v2-header">
                <CompanyAvatar name={app.company} />
                <div className="card-v2-info">
                  <h3 className="card-v2-company">{app.company}</h3>
                  <p className="card-v2-role">{app.role}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {app.notes && (
                <p className="card-v2-notes">{app.notes}</p>
              )}

              <div className="card-v2-footer">
                <span className="card-v2-date">
                  📅 {new Date(app.date_applied).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <div className="card-actions">
                  <button className="btn-edit" onClick={() => openEdit(app)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(app.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="modal modal-v2">
            <div className="modal-v2-header">
              <h3>{editingApp ? 'Edit Application' : 'Add Application'}</h3>
              <button className="modal-close" onClick={closeForm}>×</button>
            </div>

            <div className="modal-v2-body">
              <div className="form-group">
                <label>Company <span className="required">*</span></label>
                <input
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Role <span className="required">*</span></label>
                <input
                  placeholder="e.g. Software Engineer"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Recruiter name, salary range, interview rounds..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-v2-footer">
              <button className="btn-secondary" onClick={closeForm}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!form.company.trim() || !form.role.trim()}
              >
                {editingApp ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Applications
